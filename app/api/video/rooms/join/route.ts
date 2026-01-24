import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyUser } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {

    const user = await verifyUser(req);

    // Parse and validate request body
    const body = await req.json();
    const { roomId } = body;

    // Input validation
    if (!roomId) {
      return NextResponse.json(
        { error: "missing required params: roomId" },
        { status: 400 },
      );
    }

    //callee creation
    const participant = {
      type: "callee",
      identity: user.uid,
      joinedAt: new Date(),
    };

    //query chatRequests collection by roomId
    const chatRequestsSnapshot = await adminDb
      .collection("chatRequests")
      .where("roomId", "==", roomId)
      .limit(1)
      .get();

    if (chatRequestsSnapshot.empty) {
      console.error("Chat request not found for roomId:", roomId);
      return NextResponse.json(
        { error: "Chat request not found" },
        { status: 404 },
      );
    }

    // Get the first matching document
    const chatRequestDoc = chatRequestsSnapshot.docs[0];
    const chatRequestRef = chatRequestDoc.ref;

    // Update the document
    await chatRequestRef.update({
      participants: FieldValue.arrayUnion(participant),
      videoCallStatus: "accepted",
      updatedAt: FieldValue.serverTimestamp(),
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
