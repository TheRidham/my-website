"use client";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { auth } from "@/lib/firebase";
import { Trash2, MessageSquare, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useHumanChatHistory } from "@/hooks/useHumanChatHistory";

interface Props {
  open: boolean;
  setOpen: any;
  setChatId: any;
  setHistory: any;
}

const formatDate = (value: any) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  const dateStr =  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
};

const map = new Map([
  ["Nutrition & Diet", "nutrition"],
  ["Fitness", "fitness"],
  ["Mental Health", "mental"],
  ["General Medicine", "general"],
  ["Sexual Health", "sexual"],
  ["Chronic Diseases", "chronic"],
  ["Skin & Beauty", "skin"],
  ["Addiction", "addiction"],
  ["Relationship", "relationship"],
]);

export default function AIChatHistorySheet({
  open,
  setOpen,
  setChatId,
  setHistory,
}: Props) {
  const { chats, loading, deleteChat } = useChatHistory(auth.currentUser?.uid);
  const { humanChats, deleteHumanChat } = useHumanChatHistory(
    auth.currentUser?.uid,
  );
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (chatId: string) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId);
      console.log(`Chat with ID ${chatId} deleted.`);
    }
  };

  return (
    <>
      {/* Controlled Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="bg-white w-full sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-2xl font-bold">Chat History</SheetTitle>
            <SheetDescription>
              View and manage your previous AI conversations
            </SheetDescription>
          </SheetHeader>

          <div className="m-2 overflow-y-auto h-[calc(100vh-120px)]">

            {/* AI Chats */}
            <div className="space-y-3">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                    selectedChatId === chat.id
                      ? "border-primary bg-primary/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setChatId(chat.id);
                    setHistory(chat.messages);
                    setOpen(false);
                    router.push(
                      `../${map.get(chat.advisorName) ?? chat.advisorName}/${encodeURIComponent(
                        chat.advisorCategory,
                      )}`,
                    );
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Chat Title */}
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {chat.title}
                      </h3>

                      {/* Advisor Info */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">

                        <span className="px-2 py-0.5 bg-accent text-primary rounded-full">
                          AI Chat
                        </span>
                        <span className="px-2 py-0.5 bg-accent text-primary rounded-full">
                          {chat.advisorName}
                        </span>

                        <span className="px-2 py-0.5 bg-accent text-primary rounded-full">
                          {chat.advisorCategory}
                        </span>
                        
                      </div>

                      {/* Last Message */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {chat.lastMessage}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(chat.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Expert Chats */}
            <div className="mt-3 space-y-3">
              {humanChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
                  
                  onClick={() => {
                    setOpen(false);
                    router.push(`/humanChat/${chat.roomId}/${chat.advisorId}`)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Chat Title */}
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {chat.status === "closed"
                          ? `past chat with ${chat.advisorName}`
                          : `chat with ${chat.advisorName}`}
                      </h3>

                      {/* Advisor Info */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <span className="px-2 py-0.5 bg-accent text-primary rounded-full">
                          Expert Chat
                        </span>
                        <span className="px-2 py-0.5 bg-accent text-primary rounded-full">
                          {formatDate(chat.createdAt)}
                        </span>
                      </div>

                      {/* Chat Status */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {chat.status === "closed"
                          ? "Chat closed"
                          : "Chat in progress"}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHumanChat(chat.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
