'use client';

import { PriceProvider } from '@/providers/PriceProvider';
import { PromptsProvider } from '@/providers/PromptsProvider';
import { ChatProvider } from '@/providers/ChatProvider';
import { PaymentProvider } from '@/providers/PaymentProvider';
import AuthOverlay from '@/components/AuthOverlay';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    
    // Show auth overlay once after 3 seconds, but only if user is not authenticated
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowAuthOverlay(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

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
