"use client";

import React, { useEffect, useRef, useState } from "react";
import Video, { Room, Participant } from "twilio-video";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";

interface VideoCallProps {
  calleeId: string;
  isCaller: boolean;
  onCallEnd?: () => void;
}

export default function VideoCall({
  calleeId,
  isCaller,
  onCallEnd,
}: VideoCallProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [remoteParticipant, setRemoteParticipant] =
    useState<Participant | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Join room on mount ----
  useEffect(() => {
    let activeRoom: Room;

    const joinRoom = async () => {
      try {
        if (!auth.currentUser) throw new Error("Not authenticated");

        const idToken = await getIdToken(auth.currentUser);

        const res = await fetch("/api/twilio/join", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ calleeId, isCaller }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to join call");
        }

        const { token, roomName } = await res.json();

        activeRoom = await Video.connect(token, {
          name: roomName,
          audio: true,
          video: { width: 640, height: 480 },
        });

        setRoom(activeRoom);

        // Existing participant (callee joins late case)
        activeRoom.participants.forEach(setRemoteParticipant);

        activeRoom.on("participantConnected", setRemoteParticipant);
        activeRoom.on("participantDisconnected", () =>
          setRemoteParticipant(null)
        );
      } catch (err: any) {
        setError(err.message);
      }
    };

    joinRoom();

    return () => {
      activeRoom?.disconnect();
    };
  }, [calleeId, isCaller]);

  // ---- Controls ----
  const toggleMute = () => {
    if (!room) return;
    room.localParticipant.audioTracks.forEach((pub) =>
      isMuted ? pub.track.enable() : pub.track.disable()
    );
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!room) return;
    room.localParticipant.videoTracks.forEach((pub) =>
      isVideoOff ? pub.track.enable() : pub.track.disable()
    );
    setIsVideoOff(!isVideoOff);
  };

  const endCall = () => {
    room?.disconnect();
    onCallEnd?.();
  };

  // ---- UI ----
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black relative">
      {/* Remote video */}
      <div className="w-full h-full">
        {remoteParticipant ? (
          <ParticipantView participant={remoteParticipant} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            Waiting for participant…
          </div>
        )}
      </div>

      {/* Local preview */}
      {room && (
        <div className="absolute bottom-24 right-4 w-40 h-40 rounded-lg overflow-hidden border border-gray-600">
          <ParticipantView participant={room.localParticipant} isLocal />
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 w-full flex justify-center gap-4">
        <Button onClick={toggleMute} variant="secondary" size="icon">
          {isMuted ? <MicOff /> : <Mic />}
        </Button>

        <Button onClick={endCall} variant="destructive" size="icon">
          <PhoneOff />
        </Button>

        <Button onClick={toggleVideo} variant="secondary" size="icon">
          {isVideoOff ? <VideoOff /> : <VideoIcon />}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* --------------------- Participant Renderer ------------------------ */
/* ------------------------------------------------------------------ */

function ParticipantView({
  participant,
  isLocal = false,
}: {
  participant: Participant;
  isLocal?: boolean;
}) {
  const videoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoPub = Array.from(participant.videoTracks.values())[0];
    const audioPub = Array.from(participant.audioTracks.values())[0];

    if (videoPub?.track && videoRef.current) {
      const el = videoPub.track.attach();
      el.muted = isLocal;
      el.className = "w-full h-full object-cover";
      videoRef.current.appendChild(el);

      return () => {
        videoPub.track?.detach().forEach((e) => e.remove());
      };
    }
  }, [participant, isLocal]);

  useEffect(() => {
    const audioPub = Array.from(participant.audioTracks.values())[0];

    if (audioPub?.track && audioRef.current) {
      const el = audioPub.track.attach();
      audioRef.current.appendChild(el);

      return () => {
        audioPub.track?.detach().forEach((e) => e.remove());
      };
    }
  }, [participant]);

  return (
    <div className="w-full h-full bg-black">
      <div ref={videoRef} className="w-full h-full" />
      <div ref={audioRef} />
    </div>
  );
}
