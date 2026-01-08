import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  userId: string
  advisorName: string
  advisorCategory: string
  messages: any[]
}

export function useChatHistory(userId?: string) {
  const [chats, setChats] = useState<ChatHistory[]>([])
  const [loading, setLoading] = useState(true)

  /* ---------------- REAL-TIME LISTENER ---------------- */
  useEffect(() => {
    if (!userId) {
      setChats([])
      setLoading(false)
      return
    }

    setLoading(true)

    const q = query(
      collection(db, "aichathistory"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const d = docSnap.data()
        return {
          id: docSnap.id,
          title: d.title,
          lastMessage: d.lastMessage,
          timestamp:
            d.timestamp instanceof Timestamp
              ? d.timestamp.toDate()
              : new Date(),
          userId: d.userId,
          advisorName: d.advisorName,
          advisorCategory: d.advisorCategory,
          messages: d.messages || [],
        }
      })

      setChats(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  /* ---------------- CREATE CHAT ---------------- */
  const createChat = async (
    title: string,
    messages: any[],
    advisorName: string,
    advisorCategory: string
  ) => {
    if (!userId) return

    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1].text : "New chat"

    const docRef = await addDoc(collection(db, "aichathistory"), {
      userId,
      title,
      lastMessage,
      messages,
      advisorName,
      advisorCategory,
      timestamp: serverTimestamp(),
    })

    return docRef.id;
  }

  /* ---------------- UPDATE CHAT ---------------- */
  const updateChat = async (chatId: string, messages: any[]) => {
    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1].text : "New chat"

    await updateDoc(doc(db, "aichathistory", chatId), {
      messages,
      lastMessage,
      timestamp: serverTimestamp(),
    })
  }

  /* ---------------- DELETE CHAT ---------------- */
  const deleteChat = async (chatId: string) => {
    await deleteDoc(doc(db, "aichathistory", chatId))
  }

  return {
    chats,
    loading,
    createChat,
    updateChat,
    deleteChat,
  }
}
