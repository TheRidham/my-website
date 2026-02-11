"use client";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { Trash2, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useHumanChatHistory } from "@/hooks/useHumanChatHistory";

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

const formatDate = (value: any) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


export default function History() {
  const { chats, loading, deleteChat } = useChatHistory(auth.currentUser?.uid);
  const { humanChats, deleteHumanChat } = useHumanChatHistory(
    auth.currentUser?.uid,
  );
  const router = useRouter();

  console.log(loading);
  console.log("chats", chats);

  const handleDelete = async (chatId: string) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId);
      console.log(`Chat with ID ${chatId} deleted.`);
    }
  };

  if (loading) return <div>...loading</div>;

  return (
    <div className="md:px-10 md:py-5 px-2 py-4">
      <h1 className="text-2xl font-bold text-primary">Chat History</h1>
      <p className="text-accent-foreground">
        View and manage your previous AI conversations
      </p>
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No chat history yet</p>
            <p className="text-sm">Start a conversation to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
                onClick={() => {
                  router.push(
                    `/${map.get(chat.advisorName)}/${encodeURIComponent(
                      chat.advisorCategory,
                    )}`,
                  );
                  console.log(chat);
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
                        {chat.advisorName}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{chat.advisorCategory}</span>
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
        )}
      </div>
      <div className="space-y-3">
        {humanChats.map((chat) => (
          <div
            key={chat.id}
            className={`group relative bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Chat Title */}
                <h3 className="font-semibold text-gray-900 truncate mb-1">
                  {chat.status === "closed" ? `past chat with ${chat.advisorName}` : `chat with ${chat.advisorName}`}
                </h3>

                {/* Advisor Info */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span className="px-2 py-0.5 bg-accent text-primary rounded-full">
                    {formatDate(chat.createdAt)}
                  </span>
                </div>

                {/* Last Message */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {chat.status === "closed" ? "Chat closed" : "Chat in progress"}
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
  );
}
