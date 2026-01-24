import { NextResponse } from "next/server";
import { firestore, verifyUser } from "@/lib/firebase-admin";
import { nanoid } from "nanoid";
import type { Participant, Room } from "@/types/VideoRoom";

interface CreateRoomResponse {
  roomId: string;
}

export async function POST(req: Request) {
  try {
    const user = await verifyUser(req);
    const roomId = nanoid(12);

    const room: Room = {
      status: "waiting",
      createdAt: new Date(),
      createdBy: user.uid,
    };

    const participant: Participant = {
      identity: user.uid,
      joinedAt: new Date(),
    };

    await firestore.doc(`rooms/${roomId}`).set(room);
    await firestore
      .doc(`rooms/${roomId}/participants/${user.uid}`)
      .set(participant);

    return NextResponse.json<CreateRoomResponse>(
      { roomId },
      { status: 200 }
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
