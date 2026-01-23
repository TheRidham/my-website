import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, "\n")
        .replace(/^"(.*)"$/, "$1")
    : undefined;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();

/**
 * Verify Firebase ID token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns { uid, email, ... } decoded token or null
 */
export async function verifyFirebaseToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const idToken = authHeader.substring(7);

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error: any) {
    if (error.code === "auth/invalid-id-token") {
      throw new Error("Invalid authentication token");
    }
    if (error.code === "auth/id-token-expired") {
      throw new Error("Authentication token expired");
    }
    throw error;
  }
}

/**
 * Get user info from Firebase by UID
 * @param uid - Firebase user ID
 */
export async function getUserInfo(uid: string) {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    };
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      throw new Error("User not found");
    }
    throw error;
  }
}

/**
 * Store video session in Firestore
 * @param roomName - Video room identifier
 * @param data - Session data to store
 */
export async function storeVideoSession(
  roomName: string,
  data: Record<string, any>
) {
  const sessionRef = adminDb.collection("videoSessions").doc(roomName);
  return sessionRef.set(
    {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Update video session in Firestore
 * @param roomName - Video room identifier
 * @param data - Data to update
 */
export async function updateVideoSession(
  roomName: string,
  data: Record<string, any>
) {
  const sessionRef = adminDb.collection("videoSessions").doc(roomName);
  return sessionRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Get video session from Firestore
 * @param roomName - Video room identifier
 */
export async function getVideoSession(roomName: string) {
  const sessionRef = adminDb.collection("videoSessions").doc(roomName);
  const doc = await sessionRef.get();
  return doc.exists ? doc.data() : null;
}

/**
 * End video session (mark as completed)
 * @param roomName - Video room identifier
 */
export async function endVideoSession(roomName: string) {
  return updateVideoSession(roomName, {
    status: "completed",
    endedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
