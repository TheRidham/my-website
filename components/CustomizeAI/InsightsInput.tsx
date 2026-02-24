"use client";

import { X, Loader2 } from "lucide-react";
import { useState, FormEvent, useEffect, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface InsightsInputProps {
  placeholder?: string;
}

export default function InsightsInput({
  placeholder = "Add a health insight",
}: InsightsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [healthInsights, setHealthInsights] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch insights from database on mount and when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const savedInsights = data?.healthInsights || [];
          setHealthInsights(savedInsights);
        }
      } catch (error) {
        console.error("Error fetching health insights:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save insights to database
  const saveInsights = useCallback(
    async (updatedInsights: string[]) => {
      if (!auth.currentUser) {
        console.error("User not authenticated");
        return;
      }

      try {
        setIsSaving(true);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          healthInsights: updatedInsights,
          lastUpdated: new Date(),
        });
      } catch (error) {
        console.error("Error saving health insights:", error);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const handleAddInsight = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const updatedInsights = [...healthInsights, inputValue.trim()];
      setHealthInsights(updatedInsights);
      saveInsights(updatedInsights);
      setInputValue("");
    }
  };

  const handleRemoveInsight = (index: number) => {
    const updatedInsights = healthInsights.filter((_, i) => i !== index);
    setHealthInsights(updatedInsights);
    saveInsights(updatedInsights);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading healthInsights...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleAddInsight} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={isSaving}
          className="flex-1 rounded-md border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
          Add
        </button>
      </form>

      {healthInsights.length > 0 && <h5>Your Health Insights: </h5>}
      {healthInsights.length > 0 && (
        <ul className="space-y-2">
          {healthInsights.map((insight, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              <span className="text-primary">•</span>
              <span>{insight}</span>
              <button
                type="button"
                onClick={() => handleRemoveInsight(index)}
                disabled={isSaving}
                className="text-xs text-destructive cursor-pointer hover:bg-destructive/10 p-1 disabled:opacity-50"
              >
                <X size={18}/>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}