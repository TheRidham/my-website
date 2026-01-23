"use client";

import { useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";

interface VideoCallState {
  token: string | null;
  roomName: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing video call initialization and state
 * Handles token fetching, error handling, and call lifecycle
 */
export function useVideoCallSetup() {
  const [callState, setCallState] = useState<VideoCallState>({
    token: null,
    roomName: null,
    isLoading: false,
    error: null,
  });

  /**
   * Initialize video call with another user
   */
  const initializeCall = useCallback(
    async (calleeId: string, isCaller: boolean = true) => {
      setCallState({
        token: null,
        roomName: null,
        isLoading: true,
        error: null,
      });

      try {
        if (!auth.currentUser) {
          throw new Error("User not authenticated");
        }

        // Get Firebase ID token
        const idToken = await getIdToken(auth.currentUser);

        // Request video token from backend
        const response = await fetch("/api/twilio/join", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calleeId,
            isCaller,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to initialize call");
        }

        const data = await response.json();

        setCallState({
          token: data.token,
          roomName: data.roomName,
          isLoading: false,
          error: null,
        });

        return {
          token: data.token,
          roomName: data.roomName,
          userId: data.userId,
          role: data.role,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize call";
        setCallState({
          token: null,
          roomName: null,
          isLoading: false,
          error: errorMessage,
        });
        throw err;
      }
    },
    []
  );

  /**
   * End video call and clean up session
   */
  const endCall = useCallback(async (roomName: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      const idToken = await getIdToken(auth.currentUser);

      const response = await fetch("/api/session/end", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error ending call:", error);
      }

      setCallState({
        token: null,
        roomName: null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error("Failed to end call:", err);
    }
  }, []);

  /**
   * Clear call state
   */
  const resetCall = useCallback(() => {
    setCallState({
      token: null,
      roomName: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...callState,
    initializeCall,
    endCall,
    resetCall,
  };
}
