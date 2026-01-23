"use client";

import { useState, useCallback } from "react";

interface CallState {
  isCallActive: boolean;
  roomName: string | null;
  calleeId: string | null;
  isCaller: boolean;
}

export function useVideoCall() {
  const [callState, setCallState] = useState<CallState>({
    isCallActive: false,
    roomName: null,
    calleeId: null,
    isCaller: false,
  });

  const initiateCall = useCallback((calleeId: string) => {
    // Generate room name
    const roomName = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCallState({
      isCallActive: true,
      roomName,
      calleeId,
      isCaller: true,
    });
  }, []);

  const joinCall = useCallback((roomName: string, callerId: string) => {
    setCallState({
      isCallActive: true,
      roomName,
      calleeId: callerId,
      isCaller: false,
    });
  }, []);

  const endCall = useCallback(() => {
    setCallState({
      isCallActive: false,
      roomName: null,
      calleeId: null,
      isCaller: false,
    });
  }, []);

  return {
    ...callState,
    initiateCall,
    joinCall,
    endCall,
  };
}
