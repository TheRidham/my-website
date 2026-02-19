export type VoiceTransformStatus =
  | "idle"
  | "requesting-mic"
  | "connecting"
  | "listening"
  | "error";

export interface Transcript {
  id: string;
  text: string;
  timestamp: number;
}

export interface VoiceTransformState {
  status: VoiceTransformStatus;
  partialTranscript: string;
  committedTranscripts: Transcript[];
  error: string | null;
}

export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  speed: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface VoiceTransformConfig {
  voiceId?: string;
  voiceSettings?: VoiceSettings;
}

export interface VoiceOption {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  labels?: string[];
}

export interface UseVoiceTransformReturn extends VoiceTransformState {
  start: () => Promise<void>;
  stop: () => void;
}
