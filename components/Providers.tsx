'use client';

import { PriceProvider } from '@/providers/PriceProvider';
import { PromptsProvider } from '@/providers/PromptsProvider';
import { ChatProvider } from '@/providers/ChatProvider';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PriceProvider>
      <PromptsProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </PromptsProvider>
    </PriceProvider>
  );
}
