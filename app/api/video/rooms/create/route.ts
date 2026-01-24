import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { roomId, chatRequestId, userId } = body;

    // Input validation
    if (!roomId || !chatRequestId) {
      return NextResponse.json(
        { error: "missing required params" },
        { status: 400 },
      );
    }

    //caller creation
    const participant = {
      type: "caller",
      userId: userId,
      joinedAt: new Date(),
    };

    //update chatRequests doc with participant
    const chatRequestRef = adminDb
      .collection("chatRequests")
      .doc(chatRequestId);

    const chatRequestDoc = await chatRequestRef.get();
    if (!chatRequestDoc.exists) {
      console.error("Chat request not found:", chatRequestId);
      return NextResponse.json(
        { error: "Chat request not found" },
        { status: 404 },
      );
    }

    // Update the document
    await chatRequestRef.update({
      participants: FieldValue.arrayUnion(participant),
      isVideoChat: true,
      videoCallStatus: "waiting",
    });

    return NextResponse.json(
      {
        success: true,
        roomId: roomId,
      },
      { status: 200 },
    );
  } catch (e: unknown) {
    // Generic error fallback
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 },
    );
  }
}
