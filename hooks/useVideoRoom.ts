import {
  connect,
  Room,
  RemoteParticipant,
  RemoteTrack,
  RemoteAudioTrack,
  Track,
} from "twilio-video";
import { useLayoutEffect, useRef, useState, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export interface UseVideoRoomOptions {
  roomId?: string;
  advisorId?: string;
}

export function useVideoRoom(options: UseVideoRoomOptions = {}) {
  const { roomId: initialRoomId, advisorId } = options;
  const [room, setRoom] = useState<Room | null>(null);
  const [roomId, setRoomId] = useState<string | null>(initialRoomId || null);
  const [status, setStatus] = useState<
    "waiting" | "connecting" | "active" | "ended"
  >("waiting");
  const [connecting, setConnecting] = useState<boolean>(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const localTracksRef = useRef<HTMLMediaElement[]>([]);
  const remoteTracksRef = useRef<HTMLMediaElement[]>([]);
  const remoteAudioTracksRef = useRef<RemoteAudioTrack[]>([]);
  const joinInProgressRef = useRef(false);

  const cleanupTracks = useCallback(() => {
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = "";
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = "";
    }

    localTracksRef.current = [];
    remoteTracksRef.current = [];
    remoteAudioTracksRef.current = [];
  }, []);

  const createRoom = useCallback(
    async (
      advisorIdParam: string,
      paymentDetails?: {
        amount: number;
        status: "pending" | "success" | "failed";
        transactionId?: string;
        method?: "wallet" | "card" | "upi" | "dodo";
      },
      chatRequestId?: string,
      roomIdParam?: string,
    ): Promise<string> => {
      try {
        const createVideoRoom = httpsCallable(functions, "createVideoRoom");
        const result = await createVideoRoom({
          advisorId: advisorIdParam,
          chatRequestId: chatRequestId,
          roomId: roomIdParam,
          payment: paymentDetails,
        });
        console.log("result of room creation: ", result);
        const { roomId: newRoomId } = result.data as { roomId: string };
        setRoomId(newRoomId);
        return newRoomId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create room";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const disconnectRoom = useCallback(() => {
    if (roomRef.current) {
      try {
        try {
          roomRef.current.localParticipant.tracks.forEach((pub) => {
            try {
              if ("detach" in pub.track) {
                pub.track.detach();
              }
            } catch (e) {}
          });
        } catch (e) {}

        try {
          roomRef.current.participants.forEach((participant) => {
            try {
              participant.tracks.forEach((pub) => {
                try {
                  if (pub.track && "detach" in pub.track) {
                    pub.track.detach();
                  }
                } catch (e) {}
              });
            } catch (e) {}
          });
        } catch (e) {}

        roomRef.current.disconnect();
      } catch (e) {
        console.error("Error disconnecting room:", e);
      }
      roomRef.current = null;
      setRoom(null);
    }
    cleanupTracks();
  }, [cleanupTracks]);

  const joinRoom = useCallback(
    async (roomIdParam?: string): Promise<void> => {
      if (joinInProgressRef.current || roomRef.current) {
        console.log("Join already in progress or already connected");
        return;
      }

      const targetRoomId = roomIdParam || roomId;
      if (!targetRoomId) {
        setError("No room ID provided");
        return;
      }

      joinInProgressRef.current = true;
      setConnecting(true);
      setStatus("connecting");
      setError(null);

      try {
        const joinVideoRoom = httpsCallable(functions, "joinVideoRoom");
        const generateVideoToken = httpsCallable(
          functions,
          "generateVideoToken",
        );

        const joinRes = await joinVideoRoom({ roomId: targetRoomId });

        const joinData = joinRes.data as { success?: boolean };
        if (joinData?.success !== true) {
          throw new Error("Failed to join room");
        } else {
          console.log("room is joined!");
        }

        const tokenRes = await generateVideoToken({ roomId: targetRoomId });
        const tokenData = tokenRes.data as { token?: string };
        if (!tokenData.token) {
          throw new Error("Failed to join room");
        } else {
          console.log("token is generated");
        }
        //@ts-ignore
        const { token }: { token: string } = tokenData;

        const joinedRoom = await connect(token, {
          name: targetRoomId,
          audio: { echoCancellation: true },
          video: { width: 640, height: 480 },
          networkQuality: { local: 2, remote: 2 },
        });

        roomRef.current = joinedRoom;
        setRoom(joinedRoom);
        setRoomId(targetRoomId);

        joinedRoom.localParticipant.tracks.forEach((pub) => {
          if (pub.track && "attach" in pub.track && localVideoRef.current) {
            const mediaElement = pub.track.attach();
            mediaElement.style.width = "100%";
            mediaElement.style.height = "100%";
            mediaElement.style.objectFit = "cover";
            localVideoRef.current.appendChild(mediaElement);
            localTracksRef.current.push(mediaElement);
          }
        });

        const attachTrack = (track: Track | RemoteTrack) => {
          if (remoteVideoRef.current && "attach" in track) {
            const mediaElement = track.attach();
            mediaElement.style.width = "100%";
            mediaElement.style.height = "100%";
            mediaElement.style.objectFit = "cover";
            remoteVideoRef.current.appendChild(mediaElement);
            remoteTracksRef.current.push(mediaElement);
            console.log("Track attached:", track.kind, track.name);
          }

          if (track.kind === "audio" && "mediaStreamTrack" in track) {
            const audioTrack = track as RemoteAudioTrack;
            remoteAudioTracksRef.current.push(audioTrack);
            console.log("Remote audio track stored:", track.name);
          }
        };

        const detachTrack = (track: Track | RemoteTrack) => {
          if ("detach" in track) {
            track.detach().forEach((el) => {
              remoteTracksRef.current = remoteTracksRef.current.filter(
                (t) => t !== el,
              );
            });
          }

          if (track.kind === "audio") {
            remoteAudioTracksRef.current = remoteAudioTracksRef.current.filter(
              (t) => t !== track,
            );
          }
        };

        const handleParticipant = (participant: RemoteParticipant) => {
          console.log("Handling participant:", participant.sid);
          setParticipants((prevParticipants) => [
            ...prevParticipants,
            participant,
          ]);

          participant.tracks.forEach((publication) => {
            console.log(
              "Publication:",
              publication.trackName,
              "subscribed:",
              publication.isSubscribed,
            );
            if (publication.track && publication.isSubscribed) {
              attachTrack(publication.track);
            }
          });

          participant.on("trackSubscribed", attachTrack);
          participant.on("trackUnsubscribed", detachTrack);
        };

        joinedRoom.participants.forEach(handleParticipant);
        joinedRoom.on("participantConnected", (participant) => {
          console.log("Participant connected:", participant.sid);
          handleParticipant(participant);
          setStatus("active");
        });
        joinedRoom.on("participantDisconnected", (participant) => {
          setParticipants((prevParticipants) =>
            prevParticipants.filter((p) => p !== participant),
          );
          const isActive = joinedRoom.participants.size > 0;
          setStatus(isActive ? "active" : "waiting");
        });

        setStatus(joinedRoom.participants.size > 0 ? "active" : "waiting");
      } catch (err) {
        console.error("Failed to join Twilio room:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to join room";
        setError(errorMessage);
        setStatus("ended");

        joinInProgressRef.current = false;
      } finally {
        joinInProgressRef.current = false;
        setConnecting(false);
      }
    },
    [roomId],
  );

  const leaveRoom = useCallback((): void => {
    joinInProgressRef.current = false;
    disconnectRoom();
    setParticipants([]);
    setStatus("ended");
  }, [disconnectRoom]);

  const toggleCamera = useCallback((): void => {
    if (!roomRef.current) return;
    const newState = !cameraEnabled;

    roomRef.current.localParticipant.videoTracks.forEach((pub) => {
      pub.track.enable(newState);
    });

    if (!newState && localVideoRef.current) {
      localVideoRef.current.innerHTML = "";
      localTracksRef.current = [];
    } else if (
      newState &&
      localVideoRef.current &&
      localTracksRef.current.length === 0
    ) {
      roomRef.current.localParticipant.videoTracks.forEach((pub) => {
        if (pub.track && "attach" in pub.track) {
          const mediaElement = pub.track.attach();
          mediaElement.style.width = "100%";
          mediaElement.style.height = "100%";
          mediaElement.style.objectFit = "cover";
          localVideoRef.current?.appendChild(mediaElement);
          localTracksRef.current.push(mediaElement);
        }
      });
    }

    setCameraEnabled(newState);
  }, [cameraEnabled]);

  const toggleMic = useCallback((): void => {
    if (!roomRef.current) return;
    const newState = !micEnabled;
    roomRef.current.localParticipant.audioTracks.forEach((pub) => {
      pub.track.enable(newState);
    });
    setMicEnabled(newState);
  }, [micEnabled]);

  const getRemoteAudioStream = useCallback((): MediaStream | null => {
    const audioTracks = remoteAudioTracksRef.current;
    if (audioTracks.length === 0) {
      console.log("No remote audio tracks available");
      return null;
    }

    const mediaStreamTracks = audioTracks
      .map((track) => track.mediaStreamTrack)
      .filter(Boolean);

    if (mediaStreamTracks.length === 0) {
      console.log("No media stream tracks available");
      return null;
    }

    return new MediaStream(mediaStreamTracks);
  }, []);

  const toggleRemoteAudio = useCallback((): void => {
    const newState = !remoteAudioEnabled;

    remoteTracksRef.current.forEach((element) => {
      if (element instanceof HTMLAudioElement) {
        element.muted = !newState;
      }
    });

    setRemoteAudioEnabled(newState);
  }, [remoteAudioEnabled]);

  const setRemoteAudioMuted = useCallback((muted: boolean): void => {
    remoteTracksRef.current.forEach((element) => {
      if (element instanceof HTMLAudioElement) {
        element.muted = muted;
      }
    });

    setRemoteAudioEnabled(!muted);
  }, []);

  useLayoutEffect(() => {
    return () => {
      disconnectRoom();
    };
  }, [disconnectRoom]);

  return {
    joinRoom,
    leaveRoom,
    createRoom,
    status,
    connecting,
    cameraEnabled,
    micEnabled,
    remoteAudioEnabled,
    toggleCamera,
    toggleMic,
    toggleRemoteAudio,
    setRemoteAudioMuted,
    getRemoteAudioStream,
    localVideoRef,
    remoteVideoRef,
    participants,
    error,
    roomId,
  };
}
