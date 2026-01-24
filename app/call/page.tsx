"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

export default function CallHomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartCall = async () => {
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Please sign in first");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      console.log(token);

      const res = await fetch("/api/video/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: "rvBT5BsEgMqOC7NqRmSk",
          chatRequestId: "znsfc27aXKAFHD9xDsfw",
        }),
      });

      const data = await res.json();

      console.log(data);
      if (res.ok) {
        router.push(`/call/${data.roomId}`);
      } else {
        setError(data.error || "Failed to create room");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Please sign in first");
        setLoading(false);
        return;
      }

      // Verify room exists before navigating
      const token = await user.getIdToken();
      const verifyRes = await fetch(`/api/video/rooms/${roomId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!verifyRes.ok) {
        setError("Room not found or no longer available");
        setLoading(false);
        return;
      }

      router.push(`/call/${roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-gradient-to-br from-purple-600 to-purple-800">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2">
          1-to-1 Video Call
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Connect with someone via high-quality video
        </p>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {mode === null ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode("create")}
              disabled={loading}
              className="flex flex-col items-center gap-3 p-6 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl">➕</div>
              <h3 className="font-semibold text-gray-800 text-sm">Start New</h3>
              <p className="text-xs text-gray-600 text-center">
                Create new room
              </p>
            </button>

            <button
              onClick={() => setMode("join")}
              disabled={loading}
              className="flex flex-col items-center gap-3 p-6 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl">🔗</div>
              <h3 className="font-semibold text-gray-800 text-sm">Join Call</h3>
              <p className="text-xs text-gray-600 text-center">Enter room ID</p>
            </button>
          </div>
        ) : mode === "create" ? (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 text-center text-sm">
              Click below to create a new room. You'll receive a room ID to
              share with others.
            </p>
            <button
              onClick={handleStartCall}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating room..." : "Create Room"}
            </button>
            <button
              onClick={() => setMode(null)}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 text-center text-sm">
              Enter the room ID provided by the call organizer:
            </p>
            <input
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleJoinRoom();
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 transition disabled:bg-gray-100"
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading || !roomId.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>
            <button
              onClick={() => {
                setMode(null);
                setRoomId("");
              }}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
