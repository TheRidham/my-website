"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  limit,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useParams } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import { ArrowLeft, ArrowLeftToLine } from "lucide-react";

// type Msg = {
//   id: string;
//   content: string;
//   senderType: "user" | "advisor";
//   createdAt: any;
// };

type Msg = {
  id: string;
  content: string;
  senderType: "user" | "advisor";
  userId: string;
  advisorId: string;
  createdAt: any;
};

export default function HumanChatWeb() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const advisorId = params.advisorId as string;

  const db = getFirestore();
  const auth = getAuth();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [advisorProfile, setAdvisorProfile] = useState<{
    name: string;
    photoURL: string;
    experience: string;
    specialization: string[];
  } | null>(null);
  const [chatRequest, setChatRequest] = useState<any>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAdvisorProfile = async () => {
      if (advisorId) {
        try {
          const advisorRef = doc(db, "advisors", advisorId);
          const advisorSnap = await getDoc(advisorRef);

          if (advisorSnap.exists()) {
            const data = advisorSnap.data() as {
              name?: string;
              profilePhoto?: string;
              experience?: string;
              specialization?: string[];
            };
            setAdvisorProfile({
              name: data?.name || "Unknown Advisor",
              photoURL:
                data?.profilePhoto ||
                "https://randomuser.me/api/portraits/women/44.jpg",
              experience: data?.experience || "5+",
              specialization: data?.specialization || [],
            });
          }
        } catch (error) {
          console.error("Error fetching advisor profile:", error);
        }
      }
    };

    fetchAdvisorProfile();
  }, [advisorId]);

  // 🔥 Listen to messages
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "chatRooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });

    const chatRequestQuery = query(
      collection(db, "chatRequests"),
      where("roomId", "==", roomId)
    );

    const unsubRequest = onSnapshot(chatRequestQuery, (snap) => {
      if (!snap.empty) {
        const doc = snap.docs[0];
        setChatRequest({ id: doc.id, ...doc.data() });
      }
    });

    return () => {
      unsubRequest();
      unsub();
    };
  }, [roomId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📤 Send message
  const send = async () => {
    if (!text.trim() || !roomId) return;

    await addDoc(collection(db, "chatRooms", roomId, "messages"), {
      content: text,
      senderType: "user",
      userId: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  console.log(advisorProfile);

  const handleEndSession = async (isBackNavigation = false) => {
    // Get the latest chat request status first
    try {
      const db = getFirestore();
      const chatRequestQuery = query(
        collection(db, "chatRequests"),
        where("roomId", "==", roomId),
        limit(1)
      );

      const snap = await getDocs(chatRequestQuery);
      if (snap.empty) {
        // No chat request found in database
        alert("Chat session not found in database");
        return;
      }

      const latestRequest = {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      } as any;

      // If chat is already closed, just navigate back
      if (latestRequest.status === "closed") {
        alert("Session Ended");
        router.back();
        return;
      }
      // Update the local chatRequest state with latest data
      setChatRequest(latestRequest);
      const functions = getFunctions(getApp(), "asia-south1");
      const endChatFunction = httpsCallable(functions, "endChat");
      await endChatFunction({
        roomId: roomId,
        chatRequestId: chatRequest.id,
      });
      router.back();
    } catch (error) {
      console.error("Error fetching chat request:", error);
      alert("Could not verify chat session status");
      return;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="p-4 border-b flex items-center gap-6 bg-gray-100">
        <button onClick={() => router.back()}>
          <ArrowLeft />
        </button>
        {advisorProfile && (
          <div className="flex items-center gap-3">
            <img
              src={advisorProfile.photoURL}
              alt={advisorProfile.name}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div>
              <p className="font-semibold text-sm">{advisorProfile.name}</p>

              <div className="text-[10px] text-gray-500">
                {advisorProfile.specialization.map((el, i) => (
                  <span key={i}>
                    {el}
                    {i !== advisorProfile.specialization.length - 1 && ", "}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-600">
                {advisorProfile.experience} yrs experience
              </p>
            </div>
          </div>
        )}
        {chatRequest && chatRequest.status !== "closed" && (
          <button
            onClick={() => handleEndSession(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500 hover:bg-red-600 transition"
            aria-label="End session"
          >
            <ArrowLeftToLine />
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[70%] p-3 rounded-xl shadow-md ${
              m.senderType === "user" ? "ml-auto bg-blue-100" : "bg-green-100"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2 border-gray-400">
        <textarea
          className="flex-1 border border-gray-400 rounded-lg p-2 resize-none"
          rows={1}
          placeholder="Ask anything"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={send}
          className="px-4 rounded-lg bg-blue-600 text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
