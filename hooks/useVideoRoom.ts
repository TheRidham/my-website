import { connect, Room, RemoteParticipant, RemoteTrack, Track } from "twilio-video";
import { useLayoutEffect, useRef, useState, useCallback } from "react";
import { getAuth } from "firebase/auth";

export function useVideoRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<"waiting" | "connecting" | "active" | "ended">("waiting");
  const [connecting, setConnecting] = useState<boolean>(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const localTracksRef = useRef<HTMLMediaElement[]>([]);
  const remoteTracksRef = useRef<HTMLMediaElement[]>([]);
  const joinInProgressRef = useRef(false);

  const cleanupTracks = useCallback(() => {
    // Must clear innerHTML FIRST before React tries to unmount
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = "";
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = "";
    }

    // Clear the track references
    localTracksRef.current = [];
    remoteTracksRef.current = [];
  }, []);

  const disconnectRoom = useCallback(() => {
    if (roomRef.current) {
      try {
        // Detach all local participant tracks
        try {
          roomRef.current.localParticipant.tracks.forEach((pub) => {
            try {
              if ("detach" in pub.track) {
                pub.track.detach();
              }
            } catch (e) {
              // Ignore individual track errors
            }
          });
        } catch (e) {
          // Ignore local tracks error
        }

        // Detach all remote participant tracks
        try {
          roomRef.current.participants.forEach((participant) => {
            try {
              participant.tracks.forEach((pub) => {
                try {
                  if (pub.track && "detach" in pub.track) {
                    pub.track.detach();
                  }
                } catch (e) {
                  // Ignore individual track errors
                }
              });
            } catch (e) {
              // Ignore participant errors
            }
          });
        } catch (e) {
          // Ignore remote tracks error
        }

        roomRef.current.disconnect();
      } catch (e) {
        console.error("Error disconnecting room:", e);
      }
      roomRef.current = null;
      setRoom(null);
    }
    cleanupTracks();
  }, [cleanupTracks]);

  const joinRoom = useCallback(async (): Promise<void> => {
    if (joinInProgressRef.current || roomRef.current) {
      console.log("Join already in progress or already connected");
      return;
    }

    joinInProgressRef.current = true;
    setConnecting(true);
    setStatus("connecting");
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) throw new Error("Not signed in");

      const idToken = await user.getIdToken();

      const joinRes = await fetch(`/api/video/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ roomId }),
      });

      if (!joinRes.ok) {
        const errorData = await joinRes.json();
        throw new Error(errorData.error || "Failed to join room");
      }

      const tokenRes = await fetch(`/api/video/rooms/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ roomId }),
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        throw new Error(errorData.error || "Failed to get token");
      }

      const { token }: { token: string } = await tokenRes.json();

      const joinedRoom = await connect(token, {
        name: roomId,
        audio: { echoCancellation: true },
        video: { width: 640, height: 480 },
        networkQuality: { local: 2, remote: 2 },
      });

      roomRef.current = joinedRoom;
      setRoom(joinedRoom);

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
      };

      const detachTrack = (track: Track | RemoteTrack) => {
        if ("detach" in track) {
          track.detach().forEach((el) => {
            // Twilio already removes from DOM, just clean up our reference
            remoteTracksRef.current = remoteTracksRef.current.filter(t => t !== el);
          });
        }
      };

      const handleParticipant = (participant: RemoteParticipant) => {
        console.log("Handling participant:", participant.sid);
        setParticipants((prevParticipants) => [
          ...prevParticipants,
          participant,
        ]);

        participant.tracks.forEach((publication) => {
          console.log("Publication:", publication.trackName, "subscribed:", publication.isSubscribed);
          if (publication.track && publication.isSubscribed) {
            attachTrack(publication.track);
          }
          // Note: Twilio automatically subscribes to tracks by default.
          // If not yet subscribed, the 'trackSubscribed' event will fire when ready.
        });

        participant.on("trackSubscribed", attachTrack);
        participant.on("trackUnsubscribed", detachTrack);
      };

      joinedRoom.participants.forEach(handleParticipant);
      joinedRoom.on("participantConnected", (participant) => {
        console.log("Participant connected:", participant.sid);
        handleParticipant(participant);
        setStatus("active");  // Update status when someone joins
      });
      joinedRoom.on("participantDisconnected", (participant) => {
        setParticipants((prevParticipants) =>
          prevParticipants.filter((p) => p !== participant)
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
    } finally {
      joinInProgressRef.current = false;
      setConnecting(false);
    }
  }, [roomId]);

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

  useLayoutEffect(() => {
    return () => {
      disconnectRoom();
    };
  }, [disconnectRoom]);

  return {
    joinRoom,
    leaveRoom,
    status,
    connecting,
    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMic,
    localVideoRef,
    remoteVideoRef,
    participants,
    error,
  };
}