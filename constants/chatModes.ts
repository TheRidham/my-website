export type SpeedMode = 'quick' | 'thoughtful';
export type PrivacyMode = 'forYou' | 'anonymized';

export interface ChatModeConfig {
  functionName: string;
  saveToDb: boolean;
  showInHistory: boolean;
}

export const CHAT_MODES: Record<SpeedMode, Record<PrivacyMode, ChatModeConfig>> = {
  quick: {
    forYou: {
      functionName: 'streamChatSSE_withMemory',
      saveToDb: true,
      showInHistory: true,
    },
    anonymized: {
      functionName: 'streamChatSSE',
      saveToDb: false,
      showInHistory: false,
    },
  },
  thoughtful: {
    forYou: {
      functionName: 'streamChatSSE_testgpt',
      saveToDb: true,
      showInHistory: true,
    },
    anonymized: {
      functionName: 'streamChatSSE_testgpt_noMemory',
      saveToDb: false,
      showInHistory: false,
    },
  },
};

export const DEFAULT_SPEED_MODE: SpeedMode = 'quick';
export const DEFAULT_PRIVACY_MODE: PrivacyMode = 'forYou';
