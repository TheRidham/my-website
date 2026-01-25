export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { firestore, verifyUser } from "@/lib/firebase-admin";
import AccessToken, { VideoGrant } from "twilio/lib/jwt/AccessToken";

interface TokenBody {
  roomId: string;
}

interface TokenResponse {
  token: string;
}

export async function POST(req: Request) {
  try {
    const user = await verifyUser(req);
    const body = (await req.json()) as TokenBody;

    if (!body.roomId) {
      return NextResponse.json(
        { error: "roomId is required" },
        { status: 400 },
      );
    }

    const participantSnap = await firestore
      .doc(`rooms/${body.roomId}/participants/${user.uid}`)
      .get();

    if (!participantSnap.exists) {
      return NextResponse.json({ error: "Not in room" }, { status: 403 });
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
