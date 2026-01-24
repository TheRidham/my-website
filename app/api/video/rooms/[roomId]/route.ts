import { firestore, verifyUser } from "@/lib/firebase-admin";
import { Participant, Room } from "@/types/VideoRoom";
import { NextResponse } from "next/server";

interface RouteParams {
  roomId: string;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    // Verify user is authenticated
    await verifyUser(req);

    const { roomId } = await params;

    if (!roomId) {
      return NextResponse.json(
        { error: "Invalid roomId" },
        { status: 400 }
      );
    }

    const roomSnap = await firestore.doc(`rooms/${roomId}`).get();
    if (!roomSnap.exists) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const roomData = roomSnap.data() as Room;
    
    // Don't return ended rooms
    if (roomData.status === "ended") {
      return NextResponse.json(
        { error: "Room has ended" },
        { status: 404 }
      );
    }

    const participantsSnap = await firestore
      .collection(`rooms/${roomId}/participants`)
      .get();

    return NextResponse.json({
      room: roomData,
      participants: participantsSnap.docs.map(
        d => d.data() as Participant
      ),
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
