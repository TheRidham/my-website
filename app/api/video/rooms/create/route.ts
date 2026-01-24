import { NextResponse } from "next/server";
import { firestore, verifyUser } from "@/lib/firebase-admin";
import { nanoid } from "nanoid";
import type { Participant, Room } from "@/types/VideoRoom";

interface CreateRoomBody {
  advisorId: string;
  chatRequestId: string;
  roomId: string;
  payment?: {
    amount: number;
    status: "pending" | "success" | "failed";
    transactionId?: string;
    method?: "wallet" | "card" | "upi" | "dodo";
  };
}

interface CreateRoomResponse {
  roomId: string;
}

export async function POST(req: Request) {
  try {
    const user = await verifyUser(req);
    const body = (await req.json()) as CreateRoomBody;

    const { roomId } = body;

    if (!body.advisorId) {
      return NextResponse.json(
        { error: "advisorId is required" },
        { status: 400 },
      );
    }

    const room: Room = {
      status: "waiting",
      createdAt: new Date(),
      createdBy: user.uid,
      userId: user.uid,
      advisorId: body.advisorId,
      ...(body.payment && {
        payment: {
          ...body.payment,
          processedAt: new Date(),
        },
      }),
      userId: user.uid,
      advisorId: body.advisorId,
      ...(body.payment && {
        payment: {
          ...body.payment,
          processedAt: new Date(),
        },
      }),
    };

    const participant: Participant = {
      identity: user.uid,
      joinedAt: new Date(),
    };

    await firestore
      .doc(`chatRequests/${body.chatRequestId}`)
      .update({ isvideo: true });
    await firestore.doc(`rooms/${roomId}`).set(room);
    await firestore
      .doc(`rooms/${roomId}/participants/${user.uid}`)
      .set(participant);

    return NextResponse.json<CreateRoomResponse>({ roomId }, { status: 200 });
    return NextResponse.json<CreateRoomResponse>({ roomId }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unauthorized" },
      { status: 401 },
      { status: 401 },
    );
  }
}