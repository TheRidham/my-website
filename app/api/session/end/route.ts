/**
 * Example API using centralized Firebase utilities
 * This demonstrates how to reuse firebase-server functions in other APIs
 * 
 * Example: /api/session/end
 */

import { NextResponse } from "next/server";
import {
  verifyFirebaseToken,
  endVideoSession,
  getVideoSession,
} from "@/lib/firebase-server";

export async function POST(req: Request) {
  try {
    const { roomName } = await req.json();

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Verify Firebase token
    const authHeader = req.headers.get("authorization");
    const decodedToken = await verifyFirebaseToken(authHeader);
    const userId = decodedToken.uid;

    // Get session details
    const session = await getVideoSession(roomName);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify user is part of the session
    if (session.caller !== userId && session.callee !== userId) {
      return NextResponse.json(
        { error: "You are not part of this session" },
        { status: 403 }
      );
    }

    // End the session
    await endVideoSession(roomName);

    return NextResponse.json(
      { message: "Session ended successfully", roomName },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error ending session:", error);

    if (error.message.includes("Missing or invalid authorization header")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    if (error.message.includes("Authentication token expired")) {
      return NextResponse.json(
        { error: "Authentication token expired" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to end session" },
      { status: 500 }
    );
  }
}
