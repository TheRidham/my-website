"use client";

import React, { useState } from "react";
import { Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CallInitiatorProps {
  advisorId: string;
  advisorName: string;
  onCallInitiated: (roomName: string) => void;
}

export function CallInitiator({
  advisorId,
  advisorName,
  onCallInitiated,
}: CallInitiatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartCall = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a consistent room name
      const roomName = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Initiate the call (could send notification to advisor here)
      // For now, we'll just navigate to the video call
      onCallInitiated(roomName);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate call");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Phone className="h-4 w-4" />
        Start Video Call
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Video Call</DialogTitle>
            <DialogDescription>
              Start a video call with {advisorName}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleStartCall} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Start Call"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
