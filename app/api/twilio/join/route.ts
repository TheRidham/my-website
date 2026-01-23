import { NextResponse } from "next/server";
import { jwt } from "twilio";
import {
  verifyFirebaseToken,
  storeVideoSession,
} from "@/lib/firebase-server";

const { AccessToken } = jwt;
const { VideoGrant } = AccessToken;

export async function POST(req: Request) {
  try {
    const { calleeId, isCaller } = await req.json();

    // Validate input
    if (!calleeId) {
      return NextResponse.json(
        { error: "Callee ID is required" },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("authorization");

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(authHeader);
    const callerId = decodedToken.uid;

    // Validate caller and callee are different
    if (callerId === calleeId) {
      return NextResponse.json(
        { error: "Caller and callee cannot be the same user" },
        { status: 400 }
      );
    }

    // Create a consistent room name for both participants
    const roomName = ["call", callerId, calleeId].sort().join("_");

    // Store session data in Firebase for tracking
    await storeVideoSession(roomName, {
      roomName,
      caller: callerId,
      callee: calleeId,
      isCaller,
      status: "active",
      participants: {
        [callerId]: {
          role: isCaller ? "caller" : "callee",
          joinedAt: new Date(),
        },
      },
    });

    // Generate Twilio Video access token
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { identity: callerId }
    );

    // Add video grant for the room
    token.addGrant(new VideoGrant({ room: roomName }));

    // Return token and session info
    return NextResponse.json(
      {
        token: token.toJwt(),
        roomName,
        sessionId: roomName,
        userId: callerId,
        role: isCaller ? "caller" : "callee",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in Twilio join endpoint:", error);

    // Handle specific Firebase errors
    if (error.message.includes("Invalid authentication token")) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    if (error.message.includes("Authentication token expired")) {
      return NextResponse.json(
        { error: "Authentication token expired" },
        { status: 401 }
      );
    }

    if (error.message.includes("Missing or invalid authorization header")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate video token" },
      { status: 500 }
    );
  }
}
