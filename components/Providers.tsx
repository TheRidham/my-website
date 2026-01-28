"use client";

import { PriceProvider } from "@/providers/PriceProvider";
import { PromptsProvider } from "@/providers/PromptsProvider";
import { ChatProvider } from "@/providers/ChatProvider";
import { PaymentProvider } from "@/providers/PaymentProvider";
import AuthOverlay from "@/components/AuthOverlay";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/corporate", "/about"];

export function Providers({ children }: { children: React.ReactNode }) {
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;

    // Skip showing auth overlay for public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      setShowAuthOverlay(false); // Reset overlay state when on public route
      return;
    }

    // Show auth overlay once after 3 seconds, but only if user is not authenticated
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowAuthOverlay(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Reset overlay if user becomes authenticated
      setShowAuthOverlay(false);
    }
  }, [isAuthenticated, isLoading, pathname]);

  const handleCloseOverlay = () => {
    setShowAuthOverlay(false);
  };

  return (
    <>
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
    </>
  );
}
