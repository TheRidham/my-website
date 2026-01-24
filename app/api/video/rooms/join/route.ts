import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { roomId, chatRequestId, advisorId } = body;

    // Input validation
    if (!roomId || !chatRequestId || !advisorId) {
      return NextResponse.json(
        { error: "missing required params" },
        { status: 400 },
      );
    }

    //callee creation
    const participant = {
      type: "callee",
      advisorId: advisorId,
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
      videoCallStatus: "accepted",
    });

    return NextResponse.json(
      {
        success: true,
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
