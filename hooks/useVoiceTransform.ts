"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Scribe, RealtimeEvents, CommitStrategy } from "@elevenlabs/client";
import type {
  VoiceTransformStatus,
  Transcript,
  VoiceTransformConfig,
  VoiceSettings,
  UseVoiceTransformReturn,
} from "@/types/voice-transform";

const COMMIT_CONFIG = {
  silenceAfterPunctuationMs: 400,
  maxSilenceMs: 2500,
  maxWordsBeforeCommit: 20,
  punctuationMarks: [".", "?", "!", "。", "।"],
};

export function useVoiceTransform(config?: VoiceTransformConfig): UseVoiceTransformReturn {
  const [state, setState] = useState({
    status: "idle" as VoiceTransformStatus,
    partialTranscript: "",
    committedTranscripts: [] as Transcript[],
    error: null as string | null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scribeConnectionRef = useRef<ReturnType<typeof Scribe.connect> | null>(null);
  const playbackQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isStoppingRef = useRef(false);
  const commitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPartialRef = useRef<string>("");

  const setStatus = useCallback((status: VoiceTransformStatus) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, status: error ? "error" : prev.status }));
  }, []);

  const playNextInQueue = useCallback(async () => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0) return;

    isPlayingRef.current = true;

    const audioBuffer = playbackQueueRef.current.shift();
    if (!audioBuffer || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    currentSourceRef.current = source;

    source.onended = () => {
      currentSourceRef.current = null;
      isPlayingRef.current = false;
      playNextInQueue();
    };

    source.start(0);
  }, []);

  const fetchAndPlayTTS = useCallback(async (text: string) => {
    if (!audioContextRef.current || !text.trim()) return;

    try {
      const voiceSettings = config?.voiceSettings;
      const body: {
        text: string;
        voiceId?: string;
        voiceSettings?: {
          stability?: number;
          similarityBoost?: number;
          speed?: number;
          style?: number;
          useSpeakerBoost?: boolean;
        };
      } = { text };

      if (config?.voiceId) {
        body.voiceId = config.voiceId;
      }
      if (voiceSettings) {
        body.voiceSettings = voiceSettings;
      }

      const response = await fetch("/api/elevenlabs/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error("[TTS] Request failed:", response.status);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      playbackQueueRef.current.push(audioBuffer);
      playNextInQueue();
    } catch (error) {
      console.error("[TTS] Error:", error);
    }
  }, [config, playNextInQueue]);

  const clearCommitTimer = useCallback(() => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, []);

  const forceCommit = useCallback(() => {
    clearCommitTimer();

    if (scribeConnectionRef.current && lastPartialRef.current.trim()) {
      console.log("[COMMIT] Forcing commit for:", lastPartialRef.current);
      scribeConnectionRef.current.commit();
    }
  }, [clearCommitTimer]);

  const endsWithPunctuation = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return false;
    const lastChar = trimmed[trimmed.length - 1];
    return COMMIT_CONFIG.punctuationMarks.includes(lastChar);
  }, []);

  const getWordCount = useCallback((text: string): number => {
    return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  }, []);

  const handlePartialTranscript = useCallback((text: string) => {
    lastPartialRef.current = text;
    setState((prev) => ({ ...prev, partialTranscript: text }));

    if (!text.trim()) return;

    clearCommitTimer();

    commitTimerRef.current = setTimeout(() => {
      forceCommit();
    }, COMMIT_CONFIG.maxSilenceMs);

    if (endsWithPunctuation(text)) {
      const wordCount = getWordCount(text);
      if (wordCount >= 3) {
        clearCommitTimer();
        setTimeout(() => forceCommit(), COMMIT_CONFIG.silenceAfterPunctuationMs);
        return;
      }
    }

    if (getWordCount(text) >= COMMIT_CONFIG.maxWordsBeforeCommit) {
      clearCommitTimer();
      setTimeout(() => forceCommit(), 300);
      return;
    }
  }, [clearCommitTimer, forceCommit, endsWithPunctuation, getWordCount]);

  const start = useCallback(async () => {
    isStoppingRef.current = false;
    lastPartialRef.current = "";
    setError(null);
    setStatus("requesting-mic");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 48000 });
      audioContextRef.current = audioContext;

      setStatus("connecting");

      const tokenResponse = await fetch("/api/elevenlabs/scribe-token", {
        method: "POST",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get token");
      }

      const { token } = await tokenResponse.json();

      const connection = Scribe.connect({
        token,
        modelId: "scribe_v2_realtime",
        commitStrategy: CommitStrategy.MANUAL,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      scribeConnectionRef.current = connection;

      connection.on(RealtimeEvents.SESSION_STARTED, () => {
        console.log("[SCRIBE] Session started");
        setStatus("listening");
      });

      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data: { text: string }) => {
        handlePartialTranscript(data.text || "");
      });

      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data: { text: string }) => {
        console.log("[SCRIBE] Committed:", data.text);
        clearCommitTimer();
        lastPartialRef.current = "";

        const text = data.text || "";
        if (text.trim()) {
          const transcript: Transcript = {
            id: `t-${Date.now()}`,
            text,
            timestamp: Date.now(),
          };
          setState((prev) => ({
            ...prev,
            partialTranscript: "",
            committedTranscripts: [...prev.committedTranscripts, transcript],
          }));
          fetchAndPlayTTS(text);
        }
      });

      connection.on(RealtimeEvents.ERROR, (error: unknown) => {
        console.error("[SCRIBE] Error:", error);
        setError("Transcription error. Please try again.");
      });

      connection.on(RealtimeEvents.CLOSE, () => {
        console.log("[SCRIBE] Connection closed");
        scribeConnectionRef.current = null;
        clearCommitTimer();

        if (!isStoppingRef.current) {
          setError("Connection lost. Please try again.");
        }
      });

    } catch (error) {
      console.error("[START] Error:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access.");
      } else {
        setError("Failed to start. Please try again.");
      }
    }
  }, [config, setError, setStatus, handlePartialTranscript, clearCommitTimer, forceCommit, fetchAndPlayTTS]);

  const stop = useCallback(() => {
    isStoppingRef.current = true;
    clearCommitTimer();

    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {}
      currentSourceRef.current = null;
    }

    if (scribeConnectionRef.current) {
      scribeConnectionRef.current.close();
      scribeConnectionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    lastPartialRef.current = "";

    setState({
      status: "idle",
      partialTranscript: "",
      committedTranscripts: [],
      error: null,
    });
  }, [clearCommitTimer]);

  return {
    ...state,
    start,
    stop,
  };
}
