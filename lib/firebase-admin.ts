import admin, { ServiceAccount } from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

// Parse private key - handle both escaped and literal newlines, with or without quotes
const parsePrivateKey = (key?: string): string | undefined => {
  if (!key) return undefined;
  
  let cleanKey = key;
  
  // Remove surrounding quotes if present
  if ((cleanKey.startsWith('"') && cleanKey.endsWith('"')) ||
      (cleanKey.startsWith("'") && cleanKey.endsWith("'"))) {
    cleanKey = cleanKey.slice(1, -1);
  }
  
  // Replace escaped newlines with actual newlines
  // Handle both \\n (double escaped) and \n (single escaped)
  cleanKey = cleanKey.replace(/\\n/g, "\n");
  
  return cleanKey;
};

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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


