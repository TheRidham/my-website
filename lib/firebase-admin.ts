import admin, { ServiceAccount } from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

// Parse private key - handle both escaped and literal newlines, with or without quotes
// Also handles base64-encoded keys
const parsePrivateKey = (key?: string): string | undefined => {
  if (!key) {
    console.error("[FIREBASE] Private key is not set");
    return undefined;
  }
  
  let cleanKey = key.trim();
  
  // Remove surrounding quotes if present
  if ((cleanKey.startsWith('"') && cleanKey.endsWith('"')) ||
      (cleanKey.startsWith("'") && cleanKey.endsWith("'"))) {
    cleanKey = cleanKey.slice(1, -1);
  }
  
  // Check if it's base64 encoded (common in environment variables)
  if (!cleanKey.includes("-----BEGIN") && cleanKey.length > 100) {
    try {
      cleanKey = Buffer.from(cleanKey, 'base64').toString('utf-8');
      console.log("[FIREBASE] Decoded base64 private key");
    } catch (e) {
      console.log("[FIREBASE] Key is not base64, treating as plain text");
    }
  }
  
  // Replace escaped newlines with actual newlines
  cleanKey = cleanKey.replace(/\\n/g, "\n");
  
  // Ensure proper formatting
  if (!cleanKey.includes("-----BEGIN PRIVATE KEY-----")) {
    console.error("[FIREBASE] Private key format is invalid - missing BEGIN marker");
    return undefined;
  }
  
  if (!cleanKey.includes("-----END PRIVATE KEY-----")) {
    console.error("[FIREBASE] Private key format is invalid - missing END marker");
    return undefined;
  }
  
  console.log("[FIREBASE] Private key parsed successfully");
  return cleanKey;
};

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

console.log("[FIREBASE] Initializing Firebase Admin SDK with project:", serviceAccount.projectId);

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("[FIREBASE] Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("[FIREBASE] Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

export async function verifyUser(req: Request): Promise<DecodedIdToken> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[AUTH] Missing or invalid Authorization header");
    throw new Error("Unauthorized: Missing Authorization header");
  }

  const token = authHeader.split("Bearer ")[1];
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    console.log("[AUTH] Token verified successfully for user:", decodedToken.uid);
    return decodedToken;
  } catch (error) {
    console.error("[AUTH] Token verification failed:", error instanceof Error ? error.message : error);
    throw new Error("Unauthorized: Invalid token");
  }
}

export const firestore = admin.firestore();
export const auth = admin.auth();


