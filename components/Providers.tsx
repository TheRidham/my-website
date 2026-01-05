'use client';

import { PriceProvider } from '@/providers/PriceProvider';
import { PromptsProvider } from '@/providers/PromptsProvider';
import { ChatProvider } from '@/providers/ChatProvider';
import { PaymentProvider } from '@/providers/PaymentProvider';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PriceProvider>
      <PromptsProvider>
        <PaymentProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </PaymentProvider>
      </PromptsProvider>
    </PriceProvider>
  );
}
