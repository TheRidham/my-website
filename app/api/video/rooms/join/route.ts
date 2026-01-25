import { NextResponse } from "next/server";
import { firestore, verifyUser } from "@/lib/firebase-admin";
import type { Participant } from "@/types/VideoRoom";

interface JoinRoomBody {
  roomId: string;
}

export async function POST(req: Request) {
  try {
    const user = await verifyUser(req);
    const body = (await req.json()) as JoinRoomBody;

    if (!body.roomId) {
      return NextResponse.json(
        { error: "roomId is required" },
        { status: 400 },
      );
    }

    const roomRef = firestore.doc(`rooms/${body.roomId}`);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const participant: Participant = {
      identity: user.uid,
      joinedAt: new Date(),
    };

    await roomRef.collection("participants").doc(user.uid).set(participant);

    await roomRef.update({ status: "active" });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unauthorized" },
      { status: 401 },
    );
  }
}
