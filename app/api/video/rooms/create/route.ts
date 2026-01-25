import { NextResponse } from "next/server";
import { firestore, verifyUser } from "@/lib/firebase-admin";
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
    console.log("[VIDEO ROOM CREATE] Starting room creation");
    const user = await verifyUser(req);
    console.log("[VIDEO ROOM CREATE] User verified:", user.uid);
    
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
    };

    const participant: Participant = {
      identity: user.uid,
      joinedAt: new Date(),
    };

    console.log("[VIDEO ROOM CREATE] Updating chat request");
    await firestore
      .doc(`chatRequests/${body.chatRequestId}`)
      .update({ isVideo: true });
    
    console.log("[VIDEO ROOM CREATE] Creating room document");
    await firestore.doc(`rooms/${roomId}`).set(room);
    
    console.log("[VIDEO ROOM CREATE] Adding participant");
    await firestore
      .doc(`rooms/${roomId}/participants/${user.uid}`)
      .set(participant);

    console.log("[VIDEO ROOM CREATE] Room created successfully:", roomId);
    return NextResponse.json<CreateRoomResponse>({ roomId }, { status: 200 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    console.error("[VIDEO ROOM CREATE] Error:", errorMessage, e);
    
    // Return 401 only for auth errors
    if (errorMessage.includes("Unauthorized") || errorMessage.includes("auth")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    
    // Return 500 for other errors
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}