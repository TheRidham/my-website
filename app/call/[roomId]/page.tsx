"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useVideoRoom } from "@/hooks/useVideoRoom";
import { useVoiceTransform } from "@/hooks/useVoiceTransform";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type { VoiceOption } from "@/types/voice-transform";

export default function CallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roomId } = useParams() as { roomId: string };
  const advisorName = searchParams.get("advisorName") || "Advisor";
  const [authReady, setAuthReady] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [stability, setStability] = useState<number>(0.5);
  const [similarityBoost, setSimilarityBoost] = useState<number>(0.75);
  const [speed, setSpeed] = useState<number>(1.0);
  const [voiceTransformEnabled, setVoiceTransformEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    joinRoom,
    leaveRoom,
    localVideoRef,
    remoteVideoRef,
    toggleCamera,
    toggleMic,
    cameraEnabled,
    micEnabled,
    setRemoteAudioMuted,
    getRemoteAudioStream,
    status,
    connecting,
    error,
  } = useVideoRoom({ roomId });

  const voiceSettings = {
    stability,
    similarityBoost,
    speed,
  };

  const {
    status: voiceTransformStatus,
    partialTranscript,
    committedTranscripts,
    error: voiceTransformError,
    start: startVoiceTransform,
    stop: stopVoiceTransform,
  } = useVoiceTransform(
    {
      voiceId: selectedVoice || undefined,
      voiceSettings,
    },
    { autoPlay: true }
  );

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch("/api/elevenlabs/voices");
        if (response.ok) {
          const data = await response.json();

          const voicesArray = (data.voices || []).map((v: any) => ({
            voice_id: v.voiceId,
            name: v.name,
            category: v.category,
            description: v.description,
            labels: v.labels,
          }));

          setVoices(voicesArray);

          if (!selectedVoice && voicesArray.length > 0 && voicesArray[0].voice_id) {
            setSelectedVoice(voicesArray[0].voice_id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch voices:", err);
      }
    };
    fetchVoices();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authReady && !hasJoined) {
      joinRoom();
      setHasJoined(true);
    }

    return () => {
      const cleanup = async () => {
        try {
          const leaveVideoRoom = httpsCallable(functions, "leaveVideoRoom");
          const res = await leaveVideoRoom({ roomId });
          const data = res.data as { success?: boolean };
          if (data?.success !== true) {
            throw new Error("Failed to leave room");
          } else {
            console.log("room is leaved!");
          }
        } catch (error) {
          console.error("Error leaving room on unmount:", error);
        }
      };
      cleanup();
    };
  }, [authReady, hasJoined, joinRoom, roomId]);

  const handleVoiceTransformToggle = useCallback(() => {
    if (voiceTransformEnabled) {
      stopVoiceTransform();
      setRemoteAudioMuted(false);
      setVoiceTransformEnabled(false);
    } else {
      if (status === "active") {
        const stream = getRemoteAudioStream();
        if (stream) {
          setRemoteAudioMuted(true);
          setVoiceTransformEnabled(true);
          // Increased timeout for mobile browsers to process user gesture
          setTimeout(() => {
            startVoiceTransform(stream);
          }, 1000);
        }
      }
    }
  }, [voiceTransformEnabled, status, getRemoteAudioStream, setRemoteAudioMuted, startVoiceTransform, stopVoiceTransform]);

  useEffect(() => {
    return () => {
      stopVoiceTransform();
    };
  }, [stopVoiceTransform]);

  const handleLeave = async () => {
    try {
      stopVoiceTransform();
      const leaveVideoRoom = httpsCallable(functions, "leaveVideoRoom");
      const res = await leaveVideoRoom({ roomId });
      const data = res.data as { success?: boolean };
      if (data?.success !== true) {
        throw new Error("Failed to leave room");
      } else {
        console.log("room is leaved!");
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
    leaveRoom();
    router.push("/allAdvisors");
  };

  const handlePreset = (preset: "natural" | "expressive" | "fast" | "serious") => {
    switch (preset) {
      case "natural":
        setStability(0.5);
        setSimilarityBoost(0.75);
        setSpeed(1.0);
        break;
      case "expressive":
        setStability(0.3);
        setSimilarityBoost(0.75);
        setSpeed(0.9);
        break;
      case "fast":
        setStability(0.5);
        setSimilarityBoost(0.75);
        setSpeed(1.1);
        break;
      case "serious":
        setStability(0.7);
        setSimilarityBoost(0.8);
        setSpeed(1.0);
        break;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "waiting":
        return "text-yellow-600 bg-yellow-100";
      case "connecting":
        return "text-blue-600 bg-blue-100";
      case "active":
        return "text-green-600 bg-green-100";
      case "ended":
        return "text-red-600 bg-red-100";
      default:
        return "";
    }
  };

  const getVoiceTransformStatusColor = () => {
    switch (voiceTransformStatus) {
      case "listening":
        return "bg-green-500";
      case "connecting":
      case "requesting-mic":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getVoiceTransformStatusText = () => {
    switch (voiceTransformStatus) {
      case "requesting-mic":
        return "Requesting audio...";
      case "connecting":
        return "Connecting...";
      case "listening":
        return "Listening";
      case "error":
        return "Error";
      default:
        return "Idle";
    }
  };

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 font-semibold">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-7xl mx-auto min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Video Chat with {advisorName}</h2>
        <p className="text-gray-600">
          Status:{" "}
          <span
            className={`px-3 py-1 rounded font-semibold ${getStatusColor()}`}
          >
            {status}
          </span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col gap-2 bg-gray-100 rounded-lg overflow-hidden relative">
              <h3 className="text-lg font-semibold px-4 py-3 bg-gray-200">You</h3>
              <div
                className="relative flex-1 min-h-64 bg-black flex items-center justify-center overflow-hidden"
                ref={localVideoRef}
                suppressHydrationWarning
              >
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-10">
                    <div className="text-center">
                      <p className="text-white font-semibold text-lg">📹</p>
                      <p className="text-gray-400 text-sm mt-2">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>
              {connecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
                  <div className="text-white text-center">
                    <div className="animate-spin mb-2">⏳</div>
                    <p>Connecting...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 bg-gray-100 rounded-lg overflow-hidden relative">
              <h3 className="text-lg font-semibold px-4 py-3 bg-gray-200">
                {advisorName}
              </h3>
              <div
                className="relative flex-1 min-h-64 bg-black flex items-center justify-center overflow-hidden"
                ref={remoteVideoRef}
                suppressHydrationWarning
              />
              {status === "waiting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
                  <p className="text-white font-semibold text-center">
                    Waiting for other participant...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={toggleCamera}
              disabled={connecting}
              className={`px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${
                cameraEnabled
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {cameraEnabled ? "📹 Camera On" : "📹 Camera Off"}
            </button>
            <button
              onClick={toggleMic}
              disabled={connecting}
              className={`px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${
                micEnabled
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {micEnabled ? "🎤 Unmuted" : "🎤 Muted"}
            </button>
            <button
              onClick={handleVoiceTransformToggle}
              disabled={connecting || status !== "active"}
              className={`px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${
                voiceTransformEnabled
                  ? "bg-purple-500 hover:bg-purple-600 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
            >
              {voiceTransformEnabled ? "🎙️ Voice Transform ON" : "🎙️ Voice Transform"}
            </button>
            <button
              onClick={handleLeave}
              disabled={connecting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              🚪 Leave Call
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Voice Transform Settings</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-sm text-gray-400 hover:text-white"
              >
                {showSettings ? "Hide" : "Show"}
              </button>
            </div>

            {voiceTransformError && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-3 py-2 rounded-lg mb-4 text-sm">
                {voiceTransformError}
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${getVoiceTransformStatusColor()}`} />
              <span className="text-sm font-medium text-gray-300">{getVoiceTransformStatusText()}</span>
            </div>

            {showSettings && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Voice
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={voiceTransformEnabled}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    {voices.map((voice) => (
                      <option key={voice.voice_id || voice.name} value={voice.voice_id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stability: {stability.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={stability}
                    onChange={(e) => setStability(parseFloat(e.target.value))}
                    disabled={voiceTransformEnabled}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Emotional</span>
                    <span>Stable</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Similarity: {similarityBoost.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={similarityBoost}
                    onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                    disabled={voiceTransformEnabled}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Less</span>
                    <span>More</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Speed: {speed.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.2"
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    disabled={voiceTransformEnabled}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Quick Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePreset("natural")}
                      disabled={voiceTransformEnabled}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Natural
                    </button>
                    <button
                      onClick={() => handlePreset("expressive")}
                      disabled={voiceTransformEnabled}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Expressive
                    </button>
                    <button
                      onClick={() => handlePreset("fast")}
                      disabled={voiceTransformEnabled}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Fast
                    </button>
                    <button
                      onClick={() => handlePreset("serious")}
                      disabled={voiceTransformEnabled}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Serious
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4 text-white flex-1 overflow-hidden flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Transcripts</h2>

            {partialTranscript && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Partial
                </h3>
                <p className="text-gray-300 italic bg-gray-900/50 px-3 py-2 rounded-lg">
                  {partialTranscript}
                </p>
              </div>
            )}

            {committedTranscripts.length > 0 && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Committed ({committedTranscripts.length})
                </h3>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {committedTranscripts.slice().reverse().map((transcript) => (
                    <div
                      key={transcript.id}
                      className="bg-gray-900/50 border border-gray-700 px-3 py-2 rounded-lg"
                    >
                      <p className="text-white text-sm mb-1">{transcript.text}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transcript.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!partialTranscript && committedTranscripts.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                {voiceTransformEnabled ? "Waiting for speech..." : "Enable voice transform to see transcripts"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
