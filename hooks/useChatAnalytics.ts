"use client";

import { useCallback } from "react";
import { getAuth } from "firebase/auth";

declare let gtag: any;

declare global {
  interface Window {
    gtag: any;
  }
}

export const useChatAnalytics = () => {
  const trackChatStart = useCallback((type: "ai" | "human", categoryKey?: string, subcategoryTitle?: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && user) {
      gtag("event", "chat_started", {
        user_id: user.uid,
        user_email: user.email,
        chat_type: type,
        category: categoryKey || "general",
        subcategory: subcategoryTitle || "default",
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const trackChatEnd = useCallback((type: "ai" | "human") => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && user) {
      gtag("event", "chat_ended", {
        user_id: user.uid,
        chat_type: type,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  return { trackChatStart, trackChatEnd };
};
