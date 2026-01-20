"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Send, Loader2, Trash2, Paperclip, Mic, ArrowRightSquare, ArrowRight, Shield, MessageCircle, Group, Users, Sparkles } from "lucide-react";
import { ADVISOR_CATEGORIES } from "@/constant/advisors";
import { Button } from "@/components/ui/button";
import { usePrompts } from "@/providers/PromptsProvider";
import { useChatAI } from "@/hooks/useAI";
import { useChat } from "@/providers/ChatProvider";
import { marked } from "marked";
import { HumanAdvisorModal } from "./HumanAdvisorModal";
import { useChatHistory } from "@/hooks/useChatHistory";
import { auth } from "@/lib/firebase";
import { LucideIcon } from "../ui/LucideIcon";
import ChatSection from "../ChatSection";
import AppDownloadBadges from "../AppDownloadBadges";


interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  categoryKey?: string;
  subcategoryTitle?: string;
  isJaiya?: boolean;
  chatId?: string | null;
  setChatId: any;
  history: Message[] | null;
}

export interface AIChatHandle {
  clearMessages: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIChat = forwardRef<AIChatHandle, AIChatProps>(
  (
    {
      categoryKey,
      subcategoryTitle,
      isJaiya = false,
      chatId,
      setChatId,
      history,
    },
    ref,
  ) => {
    const [input, setInput] = useState("");
    const [isHumanModalOpen, setIsHumanModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { jaiyaPrompt, advisorsPrompt } = usePrompts();
    const { switchChat, activeChat } = useChat();
    const { createChat, updateChat } = useChatHistory(auth.currentUser?.uid);

    const messagesRef = useRef<any[]>([]);
    // Track if we've processed the initial message to avoid duplicates
    const initialMessageProcessedRef = useRef(false);
    const isHistoryLoadedRef = useRef(false);

    // State for advisor prompt modal (shows every 4 messages)
    const [showAdvisorModal, setShowAdvisorModal] = useState(false);
    const userMessageCountRef = useRef(0);
    const isBackPressedRef = useRef(false);

    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Resolve prompt and welcome message
    const { systemPrompt, welcomeMessage } = useMemo(() => {
      if (isJaiya) {
        // Use Firestore prompt directly (same as Android app)
        return {
          systemPrompt: jaiyaPrompt?.prompt,
          welcomeMessage: jaiyaPrompt?.welcomeMessage,
        };
      }

      if (categoryKey && subcategoryTitle) {
        const categoryData = advisorsPrompt?.[categoryKey];
        const advisorData = categoryData?.[subcategoryTitle];

        if (!advisorData) {
          console.error("AIChat: Advisor data not found for:", {
            categoryKey,
            subcategoryTitle,
          });
          if (advisorsPrompt) {
            console.log(
              "AIChat: Available categories:",
              Object.keys(advisorsPrompt),
            );
            if (categoryData) {
              console.log(
                "AIChat: Available subcategories in",
                categoryKey,
                ":",
                Object.keys(categoryData),
              );
            }
          }
        }

        // Combine subcategory prompt with category general prompt
        const combinedSystemPrompt = advisorData?.prompt
          ? `${advisorData.prompt} ${categoryData?.generalPrompt || ""}`.trim()
          : undefined;

        return {
          systemPrompt: combinedSystemPrompt,
          welcomeMessage: advisorData?.welcomeMessage,
        };
      }

      return {
        systemPrompt: undefined,
        welcomeMessage: undefined,
      };
    }, [isJaiya, categoryKey, subcategoryTitle, jaiyaPrompt, advisorsPrompt]);

    const {
      messages,
      isLoading,
      sendMessage,
      clearMessages,
      setMessages,
      isStreaming,
      sendMessageStream,
    } = useChatAI({
      systemPrompt,
      appendGeneralPrompt: !isJaiya,
    });

    // Load chat history when component mounts or history prop changes
    useEffect(() => {
      if (history && history.length > 0 && !isHistoryLoadedRef.current) {
        // Convert history format to match the messages format
        const formattedHistory = history.map((msg) => ({
          role: msg.role,
          //@ts-ignore
          content: msg.text,
        }));

        setMessages(formattedHistory);
        messagesRef.current = formattedHistory;
        isHistoryLoadedRef.current = true;
      }
    }, [history, setMessages]);

    // Reset history loaded flag when chatId changes (new chat or different chat selected)
    useEffect(() => {
      isHistoryLoadedRef.current = false;
    }, [chatId]);

    // Update messagesRef whenever messages change (for streaming)
    useEffect(() => {
      messagesRef.current = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      }));
    }, [messages]);

    useImperativeHandle(ref, () => ({
      clearMessages: () => {
        clearMessages();
        messagesRef.current = [];
        isHistoryLoadedRef.current = false;
      },
    }));

    // Clear messages on unmount to stop any pending AI responses
    useEffect(() => {
      return () => {
        clearMessages();
      };
    }, [clearMessages]);

    // Auto-send initial message if provided (for Jaiya redirects)
    useEffect(() => {
      const initialMessage = activeChat?.initialMessage;

      // Only process if:
      // 1. There's an initial message
      // 2. We haven't processed it yet
      // 3. We're not in Jaiya mode
      // 4. Messages are empty (fresh chat)
      if (
        initialMessage &&
        !initialMessageProcessedRef.current &&
        !isJaiya &&
        messages.length === 0
      ) {
        console.log("AIChat: Auto-sending initial message:", initialMessage);

        // Mark as processed to prevent duplicates
        initialMessageProcessedRef.current = true;

        // Small delay to ensure component is fully mounted
        setTimeout(() => {
          processMessage(initialMessage);
        }, 100);
      }

      // Reset the flag when switching to a different chat without initial message
      if (!initialMessage && initialMessageProcessedRef.current) {
        initialMessageProcessedRef.current = false;
      }
    }, [activeChat?.initialMessage, isJaiya, messages.length]);

    const suggestions = useMemo(() => {
      if (categoryKey && subcategoryTitle) {
        return (
          ADVISOR_CATEGORIES[categoryKey]?.categories.find(
            (s) => s.title === subcategoryTitle,
          )?.recommendedQuestions || []
        );
      }
      return Object.values(ADVISOR_CATEGORIES)
        .flatMap((cat) =>
          cat.categories.flatMap((sub) => sub.recommendedQuestions),
        )
        .slice(0, 4);
    }, [categoryKey, subcategoryTitle]);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading, isStreaming]);

    const processMessage = async (content: string) => {
      if (!content.trim() || isLoading || isStreaming) {
        return;
      }

      // Send message using streaming
      // The hook will automatically add the user message and stream the response
      await sendMessageStream(content);

      // Wait for streaming to complete
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isStreaming) {
            clearInterval(checkInterval);
            setTimeout(resolve, 100);
          }
        }, 100);
      });

      // Save messages to Firebase (only for non-Jaiya chats)
      if (!isJaiya) {
        const messagesToSave = messagesRef.current.map((msg) => ({
          role: msg.role,
          text: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
        }));

        if (!chatId) {
          const chatTitle =
            content.length > 30 ? content.slice(0, 30) + "..." : content;

          const newChatId = await createChat(
            chatTitle,
            messagesToSave,
            categoryKey as string,
            subcategoryTitle as string,
          );

          if (newChatId) {
            setChatId(newChatId);
          }
        } else {
          await updateChat(chatId, messagesToSave);
        }
      }

      // Handle Jaiya's category matching logic
      if (isJaiya) {
        // Get the LATEST messages after streaming completes
        const latestMessages = messagesRef.current.filter(
          (m) => m.role === "assistant",
        );
        const lastAssistantMessage = latestMessages.pop();
        const response = lastAssistantMessage?.content;

        if (response) {
          try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : response;

            const data = JSON.parse(jsonStr);

            if (data.isfind) {
              const categoryTag = data.categoryTag?.toLowerCase();
              const categoryName = data.categoryName?.toLowerCase();

              let category = ADVISOR_CATEGORIES[categoryTag];
              if (!category) {
                const foundCategory = Object.values(ADVISOR_CATEGORIES).find(
                  (cat) => cat.name.toLowerCase() === categoryName,
                );
                if (foundCategory) {
                  category = foundCategory;
                }
              }

              if (category) {
                const targetTag = Object.keys(ADVISOR_CATEGORIES).find(
                  (key) => ADVISOR_CATEGORIES[key] === category,
                );

                const subcategory = category.categories.find(
                  (c) =>
                    c.title.toLowerCase() ===
                    data.subCategoryName?.toLowerCase(),
                );

                if (subcategory) {
                  switchChat({
                    name: subcategory.title,
                    categoryKey: targetTag,
                    subcategoryTitle: subcategory.title,
                    initialMessage: content, // Pass the original user message
                  });
                } else {
                  console.warn(
                    "processMessage subcategory not found:",
                    data.subCategoryName,
                  );
                }
              } else {
                console.warn(
                  "processMessage category not found for tag:",
                  categoryTag,
                  "or name:",
                  categoryName,
                );
              }
            } else {
              console.log(
                "processMessage AI did not find a match. Response:",
                data.response,
              );
            }
          } catch (e) {
            console.error("processMessage JSON parse error:", e);
          }
        }
      }
    };

    const handleSend = async () => {
      const msg = input;
      setInput("");
      await processMessage(msg);
      userMessageCountRef.current += 1;
      if (
        userMessageCountRef.current == 2 ||
        userMessageCountRef.current == 6
      ) {
        // Delay showing the prompt slightly so it doesn't interfere with the response
        setTimeout(() => {
          setShowAdvisorModal(true);
        }, 1000);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleShowAdvisorModal = () => {
      setShowAdvisorModal(false);
    };

    const handleShowAdvisorModalConnect = () => {
      setShowAdvisorModal(false);
      setIsHumanModalOpen(true);
    };

    return (
      <div className="flex flex-col h-full bg-secondary">
        {/* Chat Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        >
          <div className="max-w-4xl mx-auto w-full px-6 py-2 space-y-3">
            {/* New Welcome Screen */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] pb-5">
                  <ChatSection />
              </div>
            )}

            {/* Chat History */}
            {messages.map((msg, index) => {
              // Hide streaming messages for Jaiya (show "Thinking..." instead)
              if (isJaiya && (msg as any)._isStreaming) {
                return null;
              }

              // If it's Jaiya and the message looks like JSON, we might want to hide it or show the 'response' field
              let displayContent = msg.content;
              if (isJaiya && msg.role === "assistant") {
                try {
                  const jsonMatch = msg.content.match(/\{[\s\S]*\}/);
                  const jsonStr = jsonMatch ? jsonMatch[0] : msg.content;
                  const data = JSON.parse(jsonStr);
                  if (data.isfind) {
                    return null; // Hide redirecting messages
                  }
                  displayContent = data.response || msg.content;
                } catch (e) {
                  // Not JSON, show as is
                }
              }

              return (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 max-w-[85%] shadow-sm rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white border border-gray-200 text-gray-700 rounded-tl-none"
                    }`}
                  >
                    <div
                      className="text-[14px] leading-relaxed font-medium prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(displayContent ?? ""),
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Loading State */}
            {/* For Jaiya: Show during entire loading/streaming */}
            {/* For others: Show only when loading and no streaming message yet */}
            {isLoading && (isJaiya || !messages.some(m => (m as any)._isStreaming)) && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-[12px] text-gray-400 font-medium">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

            {/* Input Area */}
      <div className="px-4 py-2">
        <div className="max-w-2xl mx-auto flex gap-2 bg-background shadow-xl py-3 px-4 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 focus:outline-none"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-primary hover:bg-emerald-500 transition-colors aspect-square"
          >
            <ArrowRight size={24} />
          </Button>
        </div>
      </div>

      <AppDownloadBadges />

      <HumanAdvisorModal
        isOpen={isHumanModalOpen}
        onClose={() => setIsHumanModalOpen(false)}
        categoryKey={categoryKey}
        subcategoryTitle={subcategoryTitle}
      />
    </div>
  )
})
