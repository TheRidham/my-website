"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  connect,
  createLocalAudioTrack,
  createLocalVideoTrack,
  Room,
  Participant,
} from "twilio-video";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";

interface VideoCallProps {
  roomName: string;
  calleeId: string;
  isCaller: boolean;
  onCallEnd?: () => void;
}

export default function VideoCall({
  roomName,
  calleeId,
  isCaller,
  onCallEnd,
}: VideoCallProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const joinRoom = async () => {
      try {
        if (!auth.currentUser) {
          setError("User not authenticated");
          return;
        }

        // Get Firebase ID token
        const idToken = await getIdToken(auth.currentUser);

        // Get Twilio token from backend
        const response = await fetch("/api/twilio/join", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calleeId,
            isCaller,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get video token");
        }

        const { token, roomName: returnedRoomName } = await response.json();

        // Create audio and video tracks
        const audioTrack = await createLocalAudioTrack();
        const videoTrack = await createLocalVideoTrack({
          width: 640,
          height: 480,
        });

        // Connect to room
        const room = await connect(token, {
          name: returnedRoomName,
          audio: true,
          video: { width: 640, height: 480 },
          tracks: [audioTrack, videoTrack],
          networkQuality: {
            local: 1,
            remote: 1,
          },
        });

        setRoom(room);
        setParticipants(Array.from(room.participants.values()));

        // Handle participant join
        const participantSubscribed = (participant: Participant) => {
          setParticipants((participants) => [...participants, participant]);
        };

        // Handle participant leave
        const participantUnsubscribed = (participant: Participant) => {
          setParticipants((participants) =>
            participants.filter((p) => p !== participant)
          );
        };

        room.on("participantConnected", participantSubscribed);
        room.on("participantDisconnected", participantUnsubscribed);

        setIsConnecting(false);
      } catch (err) {
        console.error("Error joining room:", err);
        setError(err instanceof Error ? err.message : "Failed to join call");
        setIsConnecting(false);
      }
    };

    joinRoom();

    return () => {
      room?.disconnect();
    };
  }, [roomName, calleeId, isCaller]);

  const handleEndCall = async () => {
    room?.disconnect();
    
    // Notify backend to end session
    if (auth.currentUser) {
      const idToken = await getIdToken(auth.currentUser);
      try {
        await fetch("/api/session/end", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roomName }),
        });
      } catch (error) {
        console.error("Error ending session:", error);
      }
    }

    onCallEnd?.();
  };

  const handleToggleMute = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach((trackPublication) => {
        if (isMuted) {
          trackPublication.track.enable();
        } else {
          trackPublication.track.disable();
        }
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach((trackPublication) => {
        if (isVideoOff) {
          trackPublication.track.enable();
        } else {
          trackPublication.track.disable();
        }
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  if (isConnecting) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex flex-col relative">
      {/* Remote Participant Video */}
      <div className="flex-1 relative overflow-hidden">
        {participants.length > 0 ? (
          <ParticipantVideo key={participants[0].sid} participant={participants[0]} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white text-center">
              Waiting for participant to join...
            </p>
          </div>
        )}
      </div>

      {/* Local Video */}
      <div className="absolute bottom-20 right-4 w-32 h-32 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
        <div ref={videoRef} className="w-full h-full" />
        {room && (
          <ParticipantVideo
            key={room.localParticipant.sid}
            participant={room.localParticipant}
            isLocal
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full bg-gray-700 hover:bg-gray-600"
          onClick={handleToggleMute}
        >
          {isMuted ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleEndCall}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full bg-gray-700 hover:bg-gray-600"
          onClick={handleToggleVideo}
        >
          {isVideoOff ? (
            <VideoOff className="h-6 w-6" />
          ) : (
            <Video className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface ParticipantVideoProps {
  participant: Participant;
  isLocal?: boolean;
}

function ParticipantVideo({ participant, isLocal }: ParticipantVideoProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoTrack = useParticipantTracks(participant, "video");
  const audioTrack = useParticipantTracks(participant, "audio");

  useEffect(() => {
    setMediaStreamTrack(videoTrack.track, videoRef);
  }, [videoTrack]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioTrack.track && audioElement) {
      audioElement.srcObject = new MediaStream([audioTrack.track.mediaStreamTrack]);
      return () => {
        audioElement.srcObject = null;
      };
    }
  }, [audioTrack]);

  return (
    <div className="w-full h-full bg-gray-900">
      <div ref={videoRef} className="w-full h-full" />
      <audio ref={audioRef} autoPlay={true} muted={isLocal} />
    </div>
  );
}

const useParticipantTracks = (
  participant: Participant,
  videoType: "video" | "audio"
) => {
  const [tracks, setTracks] = useState(() => {
    const videoKind = videoType;
    return videoKind === "video"
      ? participant.videoTracks
      : participant.audioTracks;
  });

  useEffect(() => {
    setTracks((videoKind) =>
      videoType === "video"
        ? participant.videoTracks
        : participant.audioTracks
    );

    const trackSubscribed = () => {
      setTracks((videoKind) =>
        videoType === "video"
          ? participant.videoTracks
          : participant.audioTracks
      );
    };

    const trackUnsubscribed = () => {
      setTracks((videoKind) =>
        videoType === "video"
          ? participant.videoTracks
          : participant.audioTracks
      );
    };

    participant.on("trackSubscribed", trackSubscribed);
    participant.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setTracks(new Map());
      participant.removeAllListeners();
    };
  }, [participant, videoType]);

  return [...tracks.values()][0] || new Map();
};

function setMediaStreamTrack(
  track: any,
  videoRef: React.RefObject<HTMLDivElement | null>
) {
  const videoElement = document.createElement("video");
  videoElement.autoplay = true;
  videoElement.muted = false;
  videoElement.width = 640;
  videoElement.height = 480;
  videoElement.className = "w-full h-full object-cover";

  if (videoRef.current) {
    videoRef.current.innerHTML = "";
    videoRef.current.appendChild(videoElement);
  }

  if (track) {
    const mediaStreamTrack = track.mediaStreamTrack;
    videoElement.srcObject = new MediaStream([mediaStreamTrack]);
  }
}
