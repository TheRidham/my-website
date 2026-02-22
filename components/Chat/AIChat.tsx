"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Send,
  Loader2,
  Trash2,
  Paperclip,
  Mic,
  ArrowRightSquare,
  ArrowRight,
  Shield,
  MessageCircle,
  Group,
  Users,
  Sparkles,
} from "lucide-react";
import { ADVISOR_CATEGORIES } from "@/constant/advisors";
import { SpeedMode, PrivacyMode, DEFAULT_SPEED_MODE, DEFAULT_PRIVACY_MODE } from "@/constants/chatModes";
import { Button } from "@/components/ui/button";
import { usePrompts } from "@/providers/PromptsProvider";
import { useChatAI } from "@/hooks/useAI";
import { useChat } from "@/providers/ChatProvider";
import { marked } from "marked";
import { HumanAdvisorModal } from "./HumanAdvisorModal";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useChatAnalytics } from "@/hooks/useChatAnalytics";
import { auth } from "@/lib/firebase";
import { LucideIcon } from "../ui/LucideIcon";
import { ChatHeader } from "./ChatHeader";
import ChatSection from "../ChatSection";
import AppDownloadBadges from "../AppDownloadBadges";
import Link from "next/link";
import AdvisorPromptModal from "../AdvisorPromptModal";
import FollowUpChips from "../FollowUpChips";
import MCQOptions from "../MCQOptions";

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
  onPrivacyModeChange?: (mode: PrivacyMode) => void;
  initialSpeedMode?: SpeedMode;
  initialPrivacyMode?: PrivacyMode;
  isSidebarOpen?: boolean;
  walletBalance?: number;
  privacyMode?: PrivacyMode;
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onConnectHuman?: () => void;
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
      onPrivacyModeChange,
      initialSpeedMode,
      initialPrivacyMode,
      isSidebarOpen,
      walletBalance = 0,
      privacyMode: propPrivacyMode,
      onNewChat,
      onOpenHistory,
      onConnectHuman,
    },
    ref,
  ) => {
    const [input, setInput] = useState("");
    const [speedMode, setSpeedMode] = useState<SpeedMode>(initialSpeedMode || DEFAULT_SPEED_MODE);
    const [privacyMode, setPrivacyMode] = useState<PrivacyMode>(initialPrivacyMode || DEFAULT_PRIVACY_MODE);
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const [showAnonWarning, setShowAnonWarning] = useState(false);
    const [isHumanModalOpen, setIsHumanModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { jaiyaPrompt, advisorsPrompt } = usePrompts();
    const { switchChat, activeChat } = useChat();
    const { createChat, updateChat } = useChatHistory(auth.currentUser?.uid);

    const messagesRef = useRef<any[]>([]);
    // Track if we've processed the initial message to avoid duplicates
    const initialMessageProcessedRef = useRef(false);
    const isHistoryLoadedRef = useRef(false);

    // State for advisor prompt modal
    const [showAdvisorModal, setShowAdvisorModal] = useState(false);
    const userMessageCountRef = useRef(0);

    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Resolve prompt and welcome message
    const { systemPrompt, welcomeMessage } = useMemo(() => {
      if (isJaiya) {
        // Return early if Jaiya prompt hasn't loaded yet
        if (!jaiyaPrompt) {
          return {
            systemPrompt: undefined,
            welcomeMessage: undefined,
          };
        }
        // Use Firestore prompt directly (same as Android app)
        return {
          systemPrompt: jaiyaPrompt.prompt,
          welcomeMessage: jaiyaPrompt.welcomeMessage,
        };
      }

      if (categoryKey && subcategoryTitle) {
        // Return early if advisor prompts haven't loaded yet
        if (!advisorsPrompt) {
          return {
            systemPrompt: undefined,
            welcomeMessage: undefined,
          };
        }

        const categoryData = advisorsPrompt[categoryKey];
        const advisorData = categoryData?.[subcategoryTitle];

        if (!advisorData) {
          console.warn("AIChat: Advisor data not found for:", {
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
          return {
            systemPrompt: undefined,
            welcomeMessage: undefined,
          };
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

    // Check if prompts are still loading (needed when we expect them)
    const isPromptLoading = Boolean((isJaiya || (categoryKey && subcategoryTitle)) && !systemPrompt);

    const {
      messages,
      isLoading,
      sendMessage,
      clearMessages,
      setMessages,
      isStreaming,
      sendMessageStream,
      shouldSaveToDb,
      } = useChatAI({
      systemPrompt,
      appendGeneralPrompt: !isJaiya,
      speedMode,
      privacyMode,
      isJaiya,
    });

    const { trackChatStart, trackChatEnd } = useChatAnalytics();

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
        
        // Track chat start
        trackChatStart("ai", categoryKey, subcategoryTitle);
      }
    }, [history, setMessages, categoryKey, subcategoryTitle, trackChatStart]);

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

    // Notify parent when privacy mode changes
    useEffect(() => {
      onPrivacyModeChange?.(privacyMode);
    }, [privacyMode, onPrivacyModeChange]);

    useImperativeHandle(ref, () => ({
      clearMessages: () => {
        clearMessages();
        messagesRef.current = [];
        isHistoryLoadedRef.current = false;
        setHasStartedChat(false);
        setSpeedMode(DEFAULT_SPEED_MODE);
        setPrivacyMode(DEFAULT_PRIVACY_MODE);
      },
    }));

    // Clear messages on unmount to stop any pending AI responses
    useEffect(() => {
      return () => {
        clearMessages();
        trackChatEnd("ai");
      };
    }, [clearMessages, trackChatEnd]);

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
        scrollRef.current.scrollTop += 200;
      }
    }, [isLoading]);

    const processMessage = async (content: string) => {
      if (!content.trim() || isLoading || isStreaming) {
        return;
      }

      // Mark chat as started (hides mode toggles)
      if (!hasStartedChat) {
        setHasStartedChat(true);
      }

      // Increment user message count here
      userMessageCountRef.current += 1;
      console.log("userMessageCount: ", userMessageCountRef.current);

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

      // Show advisor modal after message is processed
    if (
      userMessageCountRef.current === 2 ||
      userMessageCountRef.current === 6
      ) {
      setTimeout(() => {
        setShowAdvisorModal(true);
      }, 1000);
    }

      // Save messages to Firebase (only for non-Jaiya chats and if shouldSaveToDb is true)
      if (!isJaiya && shouldSaveToDb) {
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
                    speedMode,
                    privacyMode,
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
      console.log(userMessageCountRef.current);
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
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-4 overflow-x-hidden"
        >
          {/* Sticky Header */}
          {isSidebarOpen !== undefined && (
            <ChatHeader
              isSidebarOpen={isSidebarOpen}
              categoryKey={categoryKey}
              subcategoryTitle={subcategoryTitle}
              privacyMode={propPrivacyMode || privacyMode}
              walletBalance={walletBalance}
              onNewChat={onNewChat || (() => {})}
              onOpenHistory={onOpenHistory || (() => {})}
              onConnectHuman={onConnectHuman || (() => {})}
            />
          )}
          <div className="relative max-w-4xl mx-auto w-full px-6 py-2 space-y-3">
            {/* Loading Prompts State */}
            {isPromptLoading && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] pb-5">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Loading advisor data...</p>
              </div>
            )}

            {/* New Welcome Screen */}
            {!isPromptLoading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] pb-5">
                {isJaiya ? <ChatSection />:
                <>
                  <p className="text-gray-700 font-semibold mb-3 text-center">What can I help you with?</p>

                  {suggestions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => processMessage(suggestion)}
                          className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-primary hover:bg-accent transition-all group shadow-sm text-left"
                        >
                          <p className="text-[13px] font-semibold text-gray-800 group-hover:text-primary">
                            {suggestion}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </>}
              </div>
            )}

            {/* Chat History */}
            {!isPromptLoading && messages.map((msg, index) => {
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
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div
                      className={`px-4 py-2 shadow-sm rounded-2xl ${msg.role === "user"
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

                    {/* Follow-up Questions and MCQ - only for advisors, not Jaiya */}
                    {!isJaiya && msg.role === 'assistant' && (
                      <>
                        {(msg as any).followupQuestions && (msg as any).followupQuestions.length > 0 && (
                          <FollowUpChips
                            questions={(msg as any).followupQuestions}
                            onQuestionTap={async (question) => {
                              await sendMessageStream(question);
                              userMessageCountRef.current += 1;
                              if(userMessageCountRef.current === 2 || userMessageCountRef.current === 6) {
                                setTimeout(() => {
                                  setShowAdvisorModal(true);
                                }, 1000)
                              }
                            }}
                          />
                        )}

                        {(msg as any).isMCQ && (msg as any).mcqOptions && (
                          <MCQOptions
                            options={(msg as any).mcqOptions}
                            onOptionPress={async (option) => {
                              await sendMessageStream(option);
                              userMessageCountRef.current += 1;
                              if(userMessageCountRef.current === 2 || userMessageCountRef.current === 6) {
                                setTimeout(() => {
                                  setShowAdvisorModal(true);
                                }, 1000)
                              }
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading State */}
            {/* For Jaiya: Show during entire loading/streaming */}
            {/* For others: Show only when loading and no streaming message yet */}
            {!isPromptLoading && isLoading &&
              (isJaiya || !messages.some((m) => (m as any)._isStreaming)) && (
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
              )
            }
          </div>
        </div>

        

        {/* Input Area */}
        <div className="px-4 py-1.5 relative">
          {!hasStartedChat && (
            <div className="pl-6 max-w-2xl w-full pt-2 absolute -top-10 left-1/2 -translate-x-1/2">
              <div className="flex gap-3 flex-wrap">
                <div className="flex border border-gray-300 rounded-full overflow-hidden divide-x divide-gray-300">
                  {(['Quick', 'Thoughtful'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSpeedMode(mode.toLowerCase() as SpeedMode)}
                      className={`bg-background px-2 sm:px-4 py-1.5 text-xs font-medium transition-colors ${
                        speedMode === mode.toLowerCase()
                          ? 'text-primary'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <div className="flex border border-gray-300 rounded-full overflow-hidden divide-x divide-gray-300">
                  {(['Anonymized', 'For You'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPrivacyMode(mode === 'For You' ? 'forYou' : 'anonymized' as PrivacyMode)}
                      className={`bg-background px-2 sm:px-4 py-1.5 text-xs font-medium transition-colors ${
                        privacyMode === (mode === 'For You' ? 'forYou' : 'anonymized')
                          ? 'text-primary'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="max-w-2xl mx-auto flex gap-2 bg-background shadow-xl py-3 px-4 rounded-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isPromptLoading}
              className="flex-1 px-4 py-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              onClick={handleSend}
              disabled={isPromptLoading || isLoading || !input.trim()}
              className="w-10 h-10 rounded-full bg-primary hover:bg-emerald-500 transition-colors aspect-square disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight size={24} />
            </Button>
          </div>
        </div>

        {!isPromptLoading && <AppDownloadBadges />}

        {!isPromptLoading && (
          <div className="flex items-center justify-center text-[9px] sm:text-xs pb-1">
            By continuing, you agree to our&nbsp;
            <Link href="/terms" className="underline">
              Terms of Service
            </Link> &nbsp;and&nbsp; 
            <Link href="/policy" className="underline">
              Privacy Policy
            </Link>.
          </div>
        )}

        <HumanAdvisorModal
          isOpen={isHumanModalOpen}
          onClose={() => setIsHumanModalOpen(false)}
          categoryKey={categoryKey}
          subcategoryTitle={subcategoryTitle}
        />
        <AdvisorPromptModal
          visible={showAdvisorModal}
          onClose={handleShowAdvisorModal}
          onConnect={handleShowAdvisorModalConnect}
          advisorCategory={categoryKey}
        />
      </div>
    );
  },
);
