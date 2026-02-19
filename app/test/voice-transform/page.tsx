"use client";

import { useEffect, useState } from "react";
import { useVoiceTransform } from "@/hooks/useVoiceTransform";
import type { VoiceTransformConfig, VoiceSettings, VoiceOption } from "@/types/voice-transform";

export default function VoiceTransformTestPage() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [stability, setStability] = useState<number>(0.5);
  const [similarityBoost, setSimilarityBoost] = useState<number>(0.75);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isExpanded, setIsExpanded] = useState(false);

  const voiceSettings: VoiceSettings = {
    stability,
    similarityBoost,
    speed,
  };

  const config: VoiceTransformConfig = {
    voiceId: selectedVoice || undefined,
    voiceSettings,
  };

  const {
    status,
    partialTranscript,
    committedTranscripts,
    error,
    start,
    stop,
  } = useVoiceTransform(config);

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

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
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
        setSpeed(0.2);
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

  const getStatusText = () => {
    switch (status) {
      case "requesting-mic":
        return "Requesting microphone...";
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

  const isRunning = status !== "idle";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Voice Transform Test</h1>
        <p className="text-gray-400 mb-6">
          Speak into your microphone. Your voice will be transcribed and played back
          with a transformed voice.
        </p>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Voice Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Voice
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    disabled={isRunning}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {voices.map((voice) => (
                      <option key={voice.voice_id || voice.name || `voice-${Math.random()}`} value={voice.voice_id}>
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
                    disabled={isRunning}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Emotional (0.0)</span>
                    <span>Stable (1.0)</span>
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
                    disabled={isRunning}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Less (0.0)</span>
                    <span>More (1.0)</span>
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
                    disabled={isRunning}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Slow (0.7x)</span>
                    <span>Fast (1.2x)</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Presets</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePreset("natural")}
                    disabled={isRunning}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Natural
                  </button>
                  <button
                    onClick={() => handlePreset("expressive")}
                    disabled={isRunning}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Expressive
                  </button>
                  <button
                    onClick={() => handlePreset("fast")}
                    disabled={isRunning}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Fast
                  </button>
                  <button
                    onClick={() => handlePreset("serious")}
                    disabled={isRunning}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Serious
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Status & Transcripts
              </h2>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                <span className="text-sm font-medium text-gray-300">{getStatusText()}</span>
              </div>

              <button
                onClick={isRunning ? stop : start}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                  isRunning
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isRunning ? "Stop Recording" : "Start Recording"}
              </button>

              <div className="mt-6 space-y-4">
                {partialTranscript && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">
                      Partial Transcript
                    </h3>
                    <p className="text-gray-300 italic bg-gray-900/50 px-4 py-2 rounded-lg">
                      {partialTranscript}
                    </p>
                  </div>
                )}

                {committedTranscripts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">
                      Committed Transcripts ({committedTranscripts.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {committedTranscripts.slice().reverse().map((transcript) => (
                        <div
                          key={transcript.id}
                          className="bg-gray-900/50 border border-gray-700 px-4 py-3 rounded-lg"
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
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              About
            </h2>
              <div className="space-y-3 text-sm text-gray-400">
                <p>
                  <strong>Stability:</strong> Lower = more expressive, Higher =
                  more consistent
                </p>
                <p>
                  <strong>Similarity:</strong> Higher = closer to original
                  voice
                </p>
                <p>
                  <strong>Speed:</strong> <span>&lt;</span> 1.0 = slower, <span>&gt;</span> 1.0 = faster
                </p>
                <div className="border-t border-gray-700 pt-3 mt-4">
                  <h3 className="font-semibold text-gray-300 mb-2">Commit Strategy</h3>
                  <ul className="space-y-1 text-gray-400 list-disc list-inside">
                    <li>
                      Ends with . ? ! + 3+ words → 400ms delay
                    </li>
                    <li>20+ words → 300ms safety commit</li>
                    <li>No new speech for 2.5s → Force commit</li>
                  </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
