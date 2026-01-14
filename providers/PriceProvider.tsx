'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


interface IPriceData {
  price: number;
  currency: string;
  formattedPrice: string;
}

interface IPriceContext extends IPriceData {
  fetchPricing: () => Promise<void>;
}

const PriceContext = createContext<IPriceContext | null>(null);

export const PriceProvider = ({ children }: { children: React.ReactNode }) => {
  const [priceData, setPriceData] = useState<IPriceData>({
    price: 5,
    currency: "USD",
    formattedPrice: "$5",
  });

  async function fetchPricing() {
    try {
      const docRef = doc(db, 'pricing-per-country', 'default');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const price = typeof data?.price === 'number' ? data.price : 49;
        const currency = typeof data?.currency === 'string' ? data.currency : 'INR';
        const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '';
        setPriceData({
          price,
          currency,
          formattedPrice: `${symbol}${price}`,
        });
      } else {
        console.warn('Pricing document not found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  }

  useEffect(() => {
    fetchPricing();
  }, []);

  return (
    <PriceContext.Provider value={{ ...priceData, fetchPricing }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  return context;
};