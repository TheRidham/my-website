import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

/**
 * Notify admin when a user successfully initiates a new advisor session
 * Works for both Razorpay and Wallet payments
 */
export async function notifyAdvisorNewSession(roomId: string): Promise<void> {
  try {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    let userName = auth.currentUser?.displayName || "User";

    // If no display name, try to fetch from Firestore
    if (!userName && userId) {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", userId));
      userName = userDoc.data()?.name || "User";
    }

    const functions = getFunctions(getApp(), 'asia-south1');
    const callable = httpsCallable(functions, "sendUserJoiningNotification");
    
    await callable({
      to: ADMIN_EMAIL,
      templateParams: {
        userName,
        sessionLink: `https://jai-ai-liard.vercel.app/advisor/chat/${roomId}`,
        year: new Date().getFullYear().toString(),
      }
    });

  } catch (error) {
    console.error("Error sending advisor notification:", error);
  }
}

/**
 * Notify advisor when a user schedules a session
 */
export async function notifyAdvisorScheduledSession(
  advisorName: string,
  sessionDate: string,
  sessionType: string,
  timeFrom: string,
  timeTo: string,
): Promise<void> {
  try {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    let userName = auth.currentUser?.displayName || "User";

    // If no display name, try to fetch from Firestore
    if (!userName && userId) {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", userId));
      userName = userDoc.data()?.name || "User";
    }

    const functions = getFunctions(getApp(), 'asia-south1');
    const callable = httpsCallable(functions, "notifyUpcomingSessionAdvisor");

    await callable({
      to: "monusch08@gmail.com",
      templateParams: {
        userName,
        advisorName,
        sessionDate,
        sessionType,
        timeFrom,
        timeTo,
        sessionLink: `https://jai-ai-liard.vercel.app`,
        year: new Date().getFullYear().toString(),
      },
    });
  } catch (error) {
    console.error("Error sending advisor notification:", error);
    // Don't throw - notification failure shouldn't block the session
  }
}