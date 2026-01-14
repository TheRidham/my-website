'use client';

import { PriceProvider } from '@/providers/PriceProvider';
import { PromptsProvider } from '@/providers/PromptsProvider';
import { ChatProvider } from '@/providers/ChatProvider';
import { PaymentProvider } from '@/providers/PaymentProvider';
import AuthOverlay from '@/components/AuthOverlay';
import React, { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  useEffect(() => {
    // Show auth overlay once after 3 seconds
    const timer = setTimeout(() => {
      setShowAuthOverlay(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseOverlay = () => {
    setShowAuthOverlay(false);
  };

  return (
    <PriceProvider>
      <PromptsProvider>
        <PaymentProvider>
          <ChatProvider>
            {showAuthOverlay && <AuthOverlay onClose={handleCloseOverlay} />}
            {children}
          </ChatProvider>
        </PaymentProvider>
      </PromptsProvider>
    </PriceProvider>
  );
}
