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

export interface UseVoiceTransformReturn extends VoiceTransformState {
  start: () => Promise<void>;
  stop: () => void;
}
