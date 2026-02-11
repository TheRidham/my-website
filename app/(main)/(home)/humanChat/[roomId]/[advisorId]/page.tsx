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
import {
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRightToLine,
  MessageSquare,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

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

  console.log("roomId:", roomId);

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
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);

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
      orderBy("createdAt", "asc"),
    );

    console.log("q: ", q);

    const unsub = onSnapshot(q, (snap) => {
      console.log(snap.docs);
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });

    const chatRequestQuery = query(
      collection(db, "chatRequests"),
      where("roomId", "==", roomId),
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

  // console.log(advisorProfile);

  const handleEndSession = async () => {
    // Get the latest chat request status first
    try {
      setIsLoading(true);
      const db = getFirestore();
      const chatRequestQuery = query(
        collection(db, "chatRequests"),
        where("roomId", "==", roomId),
        limit(1),
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
        router.replace("/");
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
      router.replace("/");
    } catch (error) {
      console.error("Error fetching chat request:", error);
      alert("Could not verify chat session status");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  function handleClose() {
    setIsOpen(false);
  }

  console.log("chatRequest:", chatRequest);
  console.log("messages:", messages);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="p-4 border-b flex items-center gap-6 bg-gray-100">
        <button
          className="group"
          onClick={() => {
            if (chatRequest.status !== "closed") {
              setIsOpen(true);
            } else {
              router.back();
            }
          }}
        >
          <ArrowLeft className="w-6 h-6 group-hover:text-primary" />
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
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center cursor-pointer w-8 h-8 rounded-lg bg-red-400 hover:bg-red-500 transition"
            aria-label="End session"
          >
            <ArrowRightToLine className="w-4 h-4 text-white" />
          </button>
        )}
      </header>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>End the session with advisor</DialogDescription>
          </DialogHeader>
          {loading ? (
            <p>Leaving...</p>
          ) : (
            <>
              <Button
                className="bg-slate-200 text-slate-600 mr-6 hover:scale-95"
                onClick={() => handleClose()}
              >
                cancel
              </Button>
              <Button
                className="bg-red-200 text-red-600 hover:scale-95"
                onClick={() => handleEndSession()}
              >
                Leave
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {chatRequest?.status === "closed" && messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <MessageSquare size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">No chat history</p>
          <p className="text-sm">no conversation to see</p>
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.senderType === "user";
          const timestamp = m.createdAt?.toDate
            ? new Date(m.createdAt.toDate()).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={m.id}
              className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <img
                  src={
                    isUser
                      ? auth.currentUser?.photoURL ||
                        "https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff"
                      : advisorProfile?.photoURL ||
                        "https://ui-avatars.com/api/?name=Advisor&background=22c55e&color=fff"
                  }
                  alt={isUser ? "User" : "Advisor"}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
              </div>

              {/* Message Content */}
              <div
                className={`flex flex-col max-w-[70%] ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl shadow-sm ${
                    isUser
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {m.content}
                  </p>
                </div>
                {timestamp && (
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {chatRequest?.status === "active" ? (
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
            className="px-4 rounded-lg bg-primary text-white"
          >
            Send
          </button>
        </div>
      ) : null}
    </div>
  );
}
