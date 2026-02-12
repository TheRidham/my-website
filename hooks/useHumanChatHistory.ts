import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

export type HumanChatItem = {
  id: string;
  roomId: string;
  status: string;
  createdAt: any;
  advisorId: string;
  advisorName?: string;
  lastMessage?: string;
  type: "human";
  userId: string;
};

export function useHumanChatHistory(userId?: string) {
  const [humanChats, setHumanChats] = useState<HumanChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setHumanChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getFirestore();
    const q = query(
      collection(db, "chatRequests"),
      where("userId", "==", userId),
    );

    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        if (!snap) {
          console.warn("Snapshot is null");
          setLoading(false);
          return;
        }

        try {
          const list: HumanChatItem[] = snap.docs
            .filter((doc: any) => !("isVideo" in doc.data()))
            .map((doc: any) => ({
              id: doc.id,
              ...(doc.data() as any),
              type: "human" as const,
            }));

          // Fetch advisor names
          const advisorIds = [...new Set(list.map((c) => c.advisorId))];
          const advisorNames: Record<string, string> = {};

          await Promise.all(
            advisorIds.map(async (aid) => {
              if (!aid) return;
              try {
                const advisorDoc = await getDoc(doc(db, "advisors", aid));
                if (advisorDoc.exists()) {
                  advisorNames[aid] =
                    advisorDoc.data()?.name || "Unknown Advisor";
                }
              } catch (e) {
                console.error("Error fetching advisor", aid, e);
              }
            }),
          );

          const listWithNames = list.map((item) => ({
            ...item,
            advisorName: advisorNames[item.advisorId] || "Human Expert",
          }));

          setHumanChats(listWithNames);
          setLoading(false);
        } catch (err) {
          console.error("Error processing human chats:", err);
          setError(err as Error);
          setLoading(false);
        }
      },
      (error: any) => {
        console.error("Firestore onSnapshot error:", error);

        if (error.code === "failed-precondition") {
          console.error(
            "Missing Firestore index. Check Firebase console for index creation link.",
          );
        } else if (error.code === "permission-denied") {
          console.error("Permission denied. Check Firestore security rules.");
        }

        setError(error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  async function deleteHumanChat(chatId: string) {
    const db = getFirestore();
    await deleteDoc(doc(db, "chatRequests", chatId));
  }

  return { humanChats, loading, error, deleteHumanChat };
}
