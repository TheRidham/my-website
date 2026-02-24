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

function logDeviceInfo() {
  console.log("[DEVICE INFO] Browser:", navigator.userAgent);
  console.log("[DEVICE INFO] Platform:", navigator.platform);
  console.log("[DEVICE INFO] Hardware Concurrency:", navigator.hardwareConcurrency);
  console.log("[DEVICE INFO] Memory:", (navigator as any).deviceMemory);
  console.log("[DEVICE INFO] Connection:", (navigator as any).connection?.effectiveType);
  console.log("[DEVICE INFO] Touch Support:", 'ontouchstart' in window);
}

function checkNetworkConnectivity(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
}

async function waitForStreamReady(stream: MediaStream, timeout = 5000): Promise<boolean> {
  const tracks = stream.getAudioTracks();
  if (tracks.length === 0) {
    console.warn("[STREAM_READY] No audio tracks in stream");
    return false;
  }

  console.log(`[STREAM_READY] Waiting for ${tracks.length} audio tracks to be ready...`);
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const allLive = tracks.every(track => 
      track.readyState === 'live' && track.enabled
    );
    
    if (allLive) {
      console.log(`[STREAM_READY] All tracks ready after ${Date.now() - startTime}ms`);
      return true;
    }
    
    await new Promise(r => setTimeout(r, 100));
  }

  console.warn("[STREAM_READY] Timeout waiting for tracks to be ready");
  return false;
}

function validateStream(stream: MediaStream): { valid: boolean; reason?: string } {
  const audioTracks = stream.getAudioTracks();
  
  if (audioTracks.length === 0) {
    return { valid: false, reason: "No audio tracks" };
  }

  const liveTracks = audioTracks.filter(track => 
    track.readyState === 'live' && track.enabled
  );

  if (liveTracks.length === 0) {
    return { valid: false, reason: "No active audio tracks (not live or disabled)" };
  }

  return { valid: true };
}

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
  const networkEventListenersRef = useRef<{ online: () => void; offline: () => void } | null>(null);
  const connectionStartTimeRef = useRef<number>(0);
  const wasConnectedRef = useRef(false);
  const lastAudioSentRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Prevent multiple simultaneous starts
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      console.warn("[START] Already running - ignoring duplicate start");
      return;
    }

    isStoppingRef.current = false;
    isSessionReadyRef.current = false;
    lastPartialRef.current = "";
    setError(null);
    
    // Log device info for debugging
    logDeviceInfo();
    
    // Check network connectivity first
    if (!checkNetworkConnectivity()) {
      setError("No network connection. Please check your internet connection.");
      return;
    }
    
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
        
        // Validate stream BEFORE proceeding
        console.log("[START] Validating external stream...");
        const validation = validateStream(stream);
        if (!validation.valid) {
          throw new Error(`Audio stream validation failed: ${validation.reason}`);
        }

        // Wait for stream to be ready (critical for mobile Safari)
        console.log("[START] Waiting for stream to be ready...");
        const streamReady = await waitForStreamReady(stream, 5000);
        if (!streamReady) {
          throw new Error("Audio stream not ready. Please wait for the call to stabilize and try again.");
        }
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

      // Don't create AudioContext yet - wait until after token fetch
      // This prevents mobile browsers from suspending it during network delay

      setStatus("connecting");

      // Set up network change listeners
      const handleOnline = () => {
        console.log("[SCRIBE] Network connection restored");
        if (!scribeConnectionRef.current && !isStoppingRef.current) {
          console.log("[SCRIBE] Reconnecting after network restoration...");
          // Trigger reconnection if connection was lost
        }
      };
      
      const handleOffline = () => {
        console.log("[SCRIBE] Network connection lost");
        setError("Network connection lost. Please check your internet.");
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      networkEventListenersRef.current = { online: handleOnline, offline: handleOffline };

      // Fetch token with retry logic for mobile networks
      let tokenResponse: Response | null = null;
      let tokenRetryCount = 0;
      const maxTokenRetries = 3;

      while (tokenRetryCount < maxTokenRetries) {
        try {
          tokenResponse = await fetch("/api/elevenlabs/scribe-token", {
            method: "POST",
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });
          if (tokenResponse.ok) break;
        } catch (e) {
          tokenRetryCount++;
          if (tokenRetryCount >= maxTokenRetries) throw e;
          console.log(`[SCRIBE] Token fetch retry ${tokenRetryCount}/${maxTokenRetries}`);
          await new Promise(r => setTimeout(r, 1000 * tokenRetryCount));
        }
      }

      if (!tokenResponse || !tokenResponse.ok) {
        throw new Error("Failed to get token");
      }

      const { token } = await tokenResponse.json();

      // NOW create AudioContext - after token fetch, before WebSocket connection
      // This reduces time window where mobile browsers might suspend it
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Resume AudioContext immediately and keep it alive
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Keep AudioContext alive by playing a silent buffer periodically
      const keepAliveInterval = setInterval(() => {
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          const oscillator = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();
          gain.gain.value = 0; // Silent
          oscillator.connect(gain);
          gain.connect(audioContextRef.current.destination);
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 0.01);
        }
      }, 10000); // Every 10 seconds

      // Store interval for cleanup
      (audioContextRef as any)._keepAliveInterval = keepAliveInterval;

      let connection: ReturnType<typeof Scribe.connect>;
      let targetSampleRate = 16000;
      let audioFormat = AudioFormat.PCM_16000;
      let workletLoaded = false;

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

      // Track connection start time
      connectionStartTimeRef.current = Date.now();
      wasConnectedRef.current = false;

      // Set up connection timeout (15 seconds for mobile)
      const connectionTimeout = setTimeout(() => {
        if (scribeConnectionRef.current && !isSessionReadyRef.current) {
          console.error("[SCRIBE] Connection timeout - closing");
          connection.close();
          setError("Connection timeout. Please check your network and try again.");
        }
      }, 15000);

      connection.on(RealtimeEvents.OPEN, () => {
        console.log("[SCRIBE] WebSocket opened");
        clearTimeout(connectionTimeout);
      });

      connection.on(RealtimeEvents.SESSION_STARTED, async () => {
        console.log("[SCRIBE] Session started");
        isSessionReadyRef.current = true;
        wasConnectedRef.current = true; // Mark as successfully connected
        setStatus("listening");
        
        if (hasExternalStream) {
          try {
            console.log("[SCRIBE] Setting up AudioWorklet for external stream");
            
            // Load the AudioWorklet processor module with multiple path attempts
            const workletPaths = [
              '/voice-transform-processor.js',
              '/api/voice-transform-processor',
              './voice-transform-processor.js',
            ];
            
            let workletLoadError: Error | null = null;
            for (const path of workletPaths) {
              try {
                await audioContext.audioWorklet.addModule(path);
                console.log("[SCRIBE] AudioWorklet module loaded from:", path);
                workletLoaded = true;
                workletLoadError = null;
                break;
              } catch (e) {
                console.warn(`[SCRIBE] Failed to load from ${path}:`, e);
                workletLoadError = e instanceof Error ? e : new Error(String(e));
              }
            }
            
            if (!workletLoaded) {
              throw new Error(`Failed to load AudioWorklet module from all paths. Last error: ${workletLoadError?.message}`);
            }
            
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
            
            // Monitor audio track for iOS WebKit bug #180748 (track may get muted internally)
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
              audioTracks.forEach(track => {
                // Listen for track mute state changes
                const handleMuteChange = () => {
                  console.log("[TRACK STATE]", {
                    kind: track.kind,
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState,
                    timestamp: new Date().toISOString()
                  });
                  
                  // If track gets muted after starting, try to restart it
                  if (track.muted && isSessionReadyRef.current && !isStoppingRef.current) {
                    console.warn("[TRACK] Audio track muted unexpectedly, attempting restart...");
                    track.enabled = false;
                    setTimeout(() => {
                      track.enabled = true;
                      console.log("[TRACK] Track restarted");
                    }, 100);
                  }
                };
                
                track.addEventListener('mute', handleMuteChange);
                track.addEventListener('unmute', handleMuteChange);
                track.addEventListener('ended', handleMuteChange);
                
                // Store track for cleanup
                (track as any)._muteListeners = handleMuteChange;
              });
            }
            
            // Handling messages from the AudioWorklet processor
            workletNode.port.onmessage = (event) => {
              if (event.data.type === 'audioData') {
                if (isStoppingRef.current || !scribeConnectionRef.current || !isSessionReadyRef.current) {
                  return;
                }
                
                try {
                  // Log debug info if available
                  if (event.data.debug) {
                    console.log("[WORKLET AUDIO]", {
                      ...event.data.debug,
                      timestamp: new Date().toISOString()
                    });
                  }
                  
                  // Convert ArrayBuffer to base64
                  const base64 = arrayBufferToBase64(event.data.data);
                  
                  // Send to ElevenLabs
                  scribeConnectionRef.current.send({ audioBase64: base64 });
                  
                  // Update last audio sent time
                  lastAudioSentRef.current = Date.now();
                } catch (e) {
                  console.error("[WORKLET] Error sending audio:", e);
                }
              } else if (event.data.type === 'error') {
                console.error("[WORKLET] Processor error:", event.data.error);
              }
            };
            
            // Connect: source -> workletNode
            source.connect(workletNode);
            
            // Connect worklet to a silent buffer to keep it processing
            // Don't connect to destination as mobile browsers optimize away silent nodes
            const silentBuffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
            const silentSource = audioContext.createBufferSource();
            const silentGain = audioContext.createGain();
            silentGain.gain.value = 0;
            silentSource.buffer = silentBuffer;
            workletNode.connect(silentGain);
            
            // Tell the processor to start processing
            workletNode.port.postMessage({ type: 'start' });
            
            console.log("[SCRIBE] AudioWorklet processing started with sample rate:", targetSampleRate);
            
            // Set up heartbeat to keep connection alive
            // Send small audio packets every 5 seconds to prevent timeout
            heartbeatIntervalRef.current = setInterval(() => {
              if (scribeConnectionRef.current && isSessionReadyRef.current && !isStoppingRef.current) {
                try {
                  // Send a small silent packet to keep connection alive
                  const silentBuffer = new Int16Array(32).fill(0);
                  const base64 = arrayBufferToBase64(silentBuffer.buffer);
                  scribeConnectionRef.current.send({ audioBase64: base64 });
                  console.log("[HEARTBEAT] Sent keep-alive packet");
                } catch (e) {
                  console.error("[HEARTBEAT] Error sending keep-alive:", e);
                }
              }
            }, 5000); // Every 5 seconds
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
        
        let errorMessage = "Transcription error. Please try again.";
        if (error instanceof Error) {
          if (error.message.includes('stream')) {
            errorMessage = "Audio stream error. The audio connection may not be stable. Please wait a moment and try again.";
          } else if (error.message.includes('timeout')) {
            errorMessage = "Connection timeout. Please check your network and try again.";
          } else if (error.message.includes('validation')) {
            errorMessage = "Audio stream not ready. Please wait for the call to stabilize and try again.";
          } else {
            errorMessage = error.message;
          }
        }
        setError(errorMessage);
      });

      connection.on(RealtimeEvents.AUTH_ERROR, (error: unknown) => {
        if (isStoppingRef.current) return;
        
        console.error("[SCRIBE] Auth Error:", error);
        setError("Authentication error. Please try again.");
      });

      connection.on(RealtimeEvents.CLOSE, () => {
        const connectionDuration = Date.now() - connectionStartTimeRef.current;
        console.log(`[SCRIBE] Connection closed after ${connectionDuration}ms`);
        scribeConnectionRef.current = null;
        clearCommitTimer();

        if (!isStoppingRef.current) {
          setError("Connection lost. Please try again.");
          
          // Only auto-reconnect if connection was working for at least 30 seconds
          // This prevents infinite loops on immediate failures
          const connectionWasWorking = wasConnectedRef.current && connectionDuration > 30000;
          
          if (connectionWasWorking && streamRef.current && hasExternalStream) {
            console.log("[SCRIBE] Connection was working - attempting automatic reconnection...");
            setTimeout(() => {
              if (!isStoppingRef.current && !scribeConnectionRef.current) {
                console.log("[SCRIBE] Retrying connection...");
                start(externalStream);
              }
            }, 2000);
          } else {
            console.log("[SCRIBE] Not auto-reconnecting - connection was not stable or failed immediately");
          }
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
    wasConnectedRef.current = false;
    connectionStartTimeRef.current = 0;
    clearCommitTimer();

    // Clear heartbeat interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Remove network event listeners
    if (networkEventListenersRef.current) {
      window.removeEventListener('online', networkEventListenersRef.current.online);
      window.removeEventListener('offline', networkEventListenersRef.current.offline);
      networkEventListenersRef.current = null;
    }

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

    // Clean up audio track event listeners
    if (streamRef.current) {
      const tracks = streamRef.current.getAudioTracks();
      tracks.forEach(track => {
        const listener = (track as any)._muteListeners;
        if (listener) {
          track.removeEventListener('mute', listener);
          track.removeEventListener('unmute', listener);
          track.removeEventListener('ended', listener);
        }
      });
    }

    // Clear keep-alive interval
    if (audioContextRef.current && (audioContextRef.current as any)._keepAliveInterval) {
      clearInterval((audioContextRef.current as any)._keepAliveInterval);
      delete (audioContextRef.current as any)._keepAliveInterval;
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
