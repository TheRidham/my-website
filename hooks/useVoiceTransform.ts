"use client";
import { useCallback, useRef, useState } from "react";
import { Scribe, RealtimeEvents, CommitStrategy, AudioFormat } from "@elevenlabs/client";
import type {
  VoiceTransformStatus,
  Transcript,
  VoiceTransformConfig,
  UseVoiceTransformReturn,
  UseVoiceTransformOptions,
} from "@/types/voice-transform";

const COMMIT_CONFIG = {
  silenceAfterPunctuationMs: 400,
  maxSilenceMs: 2500,
  maxWordsBeforeCommit: 20,
  punctuationMarks: [".", "?", "!", "。", "।"],
};

function getSupportedSampleRate(actualRate: number): { format: AudioFormat; rate: number } {
  const supportedRates = [
    { format: AudioFormat.PCM_48000, rate: 48000 },
    { format: AudioFormat.PCM_44100, rate: 44100 },
    { format: AudioFormat.PCM_24000, rate: 24000 },
    { format: AudioFormat.PCM_22050, rate: 22050 },
    { format: AudioFormat.PCM_16000, rate: 16000 },
    { format: AudioFormat.PCM_8000, rate: 8000 },
  ];
  
  const closest = supportedRates.reduce((prev, curr) => 
    Math.abs(curr.rate - actualRate) < Math.abs(prev.rate - actualRate) ? curr : prev
  );
  
  return closest;
}

export function useVoiceTransform(
  config?: VoiceTransformConfig,
  options?: UseVoiceTransformOptions,
): UseVoiceTransformReturn {
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
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isExternalStreamRef = useRef(false);
  const isSessionReadyRef = useRef(false);

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

  const arrayBufferToBase64 = useCallback((buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  const start = useCallback(async (externalStream?: MediaStream) => {
    isStoppingRef.current = false;
    isSessionReadyRef.current = false;
    lastPartialRef.current = "";
    setError(null);

    const hasExternalStream = !!externalStream;
    isExternalStreamRef.current = hasExternalStream;

    if (!hasExternalStream) {
      setStatus("requesting-mic");
    } else {
      setStatus("connecting");
    }

    try {
      let stream: MediaStream;

      if (externalStream) {
        stream = externalStream;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1,
          },
        });
      }
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Resume AudioContext if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      setStatus("connecting");

      const tokenResponse = await fetch("/api/elevenlabs/scribe-token", {
        method: "POST",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get token");
      }

      const { token } = await tokenResponse.json();

      let connection: ReturnType<typeof Scribe.connect>;
      let targetSampleRate = 16000;
      let audioFormat = AudioFormat.PCM_16000;

      if (hasExternalStream) {
        const actualSampleRate = audioContext.sampleRate;
        const supported = getSupportedSampleRate(actualSampleRate);
        targetSampleRate = supported.rate;
        audioFormat = supported.format;
        
        console.log(`[SCRIBE] Using sample rate ${targetSampleRate} (actual: ${actualSampleRate})`);
        
        connection = Scribe.connect({
          token,
          modelId: "scribe_v2_realtime",
          commitStrategy: CommitStrategy.MANUAL,
          audioFormat,
          sampleRate: targetSampleRate,
        });
      } else {
        connection = Scribe.connect({
          token,
          modelId: "scribe_v2_realtime",
          commitStrategy: CommitStrategy.MANUAL,
          microphone: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      scribeConnectionRef.current = connection;

      connection.on(RealtimeEvents.OPEN, () => {
        console.log("[SCRIBE] WebSocket opened");
      });

      connection.on(RealtimeEvents.SESSION_STARTED, async () => {
        console.log("[SCRIBE] Session started");
        isSessionReadyRef.current = true;
        setStatus("listening");
        
        if (hasExternalStream) {
          try {
            console.log("[SCRIBE] Setting up AudioWorklet for external stream");
            
            // Load the AudioWorklet processor module
            await audioContext.audioWorklet.addModule('/voice-transform-processor.js');
            console.log("[SCRIBE] AudioWorklet module loaded");
            
            // Create audio source from stream
            const source = audioContext.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            
            // Create AudioWorklet node with target sample rate
            const workletNode = new AudioWorkletNode(audioContext, 'voice-transform-processor', {
              processorOptions: {
                targetSampleRate: targetSampleRate,
              },
            });
            audioWorkletNodeRef.current = workletNode;
            
            // Handle messages from the AudioWorklet processor
            workletNode.port.onmessage = (event) => {
              if (event.data.type === 'audioData') {
                if (isStoppingRef.current || !scribeConnectionRef.current || !isSessionReadyRef.current) {
                  return;
                }
                
                try {
                  // Convert ArrayBuffer to base64
                  const base64 = arrayBufferToBase64(event.data.data);
                  
                  // Send to ElevenLabs
                  scribeConnectionRef.current.send({ audioBase64: base64 });
                } catch (e) {
                  console.error("[WORKLET] Error sending audio:", e);
                }
              } else if (event.data.type === 'error') {
                console.error("[WORKLET] Processor error:", event.data.error);
              }
            };
            
            // Connect: source -> workletNode -> destination (silent)
            source.connect(workletNode);
            
            // Create silent gain node so worklet keeps processing
            const silentGain = audioContext.createGain();
            silentGain.gain.value = 0;
            workletNode.connect(silentGain);
            silentGain.connect(audioContext.destination);
            
            // Tell the processor to start processing
            workletNode.port.postMessage({ type: 'start' });
            
            console.log("[SCRIBE] AudioWorklet processing started with sample rate:", targetSampleRate);
          } catch (error) {
            console.error("[SCRIBE] Failed to setup AudioWorklet:", error);
            setError("Failed to setup audio processing. Please try again.");
          }
        }
      });

      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data: { text: string }) => {
        try {
          handlePartialTranscript(data.text || "");
        } catch (error) {
          console.error("[PARTIAL_TRANSCRIPT] Error:", error);
        }
      });

      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data: { text: string }) => {
        try {
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
            if (options?.autoPlay !== false) {
              fetchAndPlayTTS(text);
            }
          }
        } catch (error) {
          console.error("[COMMITTED_TRANSCRIPT] Error:", error);
        }
      });

      connection.on(RealtimeEvents.ERROR, (error: unknown) => {
        if (isStoppingRef.current) return;
        
        console.error("[SCRIBE] Error:", error);
        setError("Transcription error. Please try again.");
      });

      connection.on(RealtimeEvents.AUTH_ERROR, (error: unknown) => {
        if (isStoppingRef.current) return;
        
        console.error("[SCRIBE] Auth Error:", error);
        setError("Authentication error. Please try again.");
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
  }, [config, options?.autoPlay, setError, setStatus, handlePartialTranscript, clearCommitTimer, fetchAndPlayTTS, arrayBufferToBase64]);

  const stop = useCallback(async () => {
    isStoppingRef.current = true;
    isSessionReadyRef.current = false;
    clearCommitTimer();

    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {}
      currentSourceRef.current = null;
    }

    if (audioWorkletNodeRef.current) {
      try {
        // Stop the worklet processor
        audioWorkletNodeRef.current.port.postMessage({ type: 'stop' });
        audioWorkletNodeRef.current.disconnect();
        console.log("[STOP] AudioWorklet disconnected");
      } catch (e) {
        console.error("[STOP] Error disconnecting AudioWorklet:", e);
      }
      audioWorkletNodeRef.current = null;
    }

    if (mediaStreamSourceRef.current) {
      try {
        mediaStreamSourceRef.current.disconnect();
      } catch {}
      mediaStreamSourceRef.current = null;
    }

    if (scribeConnectionRef.current) {
      scribeConnectionRef.current.close();
      scribeConnectionRef.current = null;
    }

    if (!isExternalStreamRef.current && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;

    if (audioContextRef.current) {
      try {
        // Only close if not already closed
        if (audioContextRef.current.state !== 'closed') {
          await audioContextRef.current.close();
        }
      } catch (error) {
        console.error("[STOP] Error closing AudioContext:", error);
      }
      audioContextRef.current = null;
    }

    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    lastPartialRef.current = "";
    isExternalStreamRef.current = false;

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
