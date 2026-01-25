export const runtime = "nodejs";

import { firestore, verifyUser } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

interface LeaveRoomBody {
  roomId: string;
}

export async function POST(req: Request) {
  try {
    const user = await verifyUser(req);
    const body = (await req.json()) as LeaveRoomBody;

    if (!body.roomId) {
      return NextResponse.json(
        { error: "roomId is required" },
        { status: 400 },
      );
    }

    const participantsRef = firestore.collection(
      `rooms/${body.roomId}/participants`,
    );

    await participantsRef.doc(user.uid).delete();

    const remaining = await participantsRef.get();
    if (remaining.empty) {
      await firestore.doc(`rooms/${body.roomId}`).update({
        status: "ended",
        closedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unauthorized" },
      { status: 401 },
    );
  }
}
