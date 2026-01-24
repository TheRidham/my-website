import { NextResponse } from "next/server";
import { adminDb, verifyUser } from "@/lib/firebase-admin";
import AccessToken, { VideoGrant } from "twilio/lib/jwt/AccessToken";

interface TokenResponse {
  token: string;
}

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

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { identity: user.uid },
    );

    token.addGrant(new VideoGrant({ room: body.roomId }));

    return NextResponse.json<TokenResponse>(
      { token: token.toJwt() },
      { status: 200 },
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unauthorized" },
      { status: 401 },
    );
  }
}
