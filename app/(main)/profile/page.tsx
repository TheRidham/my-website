"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit2,
  MessageSquare,
  RefreshCw,
  Wallet,
  User,
  LogOut,
  Lock,
  CheckCircle,
  LogIn,
} from "lucide-react";

import { useRouter } from "next/navigation";
import userAvatar from "@/constant/userAvatar";

import { db, auth } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

// Mock Firebase functions - replace with your actual Firebase imports
const mockAuth = {
  currentUser: {
    uid: "12345",
    phoneNumber: "+911234567890",
    isAnonymous: false,
  },
};

type UserData = {
  age: number;
  phone: string;
  email: string;
  gender: string;
  name: string;
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with actual Firebase call:
        if (!user?.uid) {
          throw new Error("User UID is missing");
        }
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        if (data) {
          setUserData(data as UserData);
        }
      } catch (err) {
        console.warn("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      // Replace with actual Firebase signOut:
      await signOut(auth);
      router.push("/auth/signup");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  // Login Prompt Screen
  if (requiresAuth && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 opacity-5 rounded-b-[3rem]"></div>

        <div className="relative max-w-md w-full">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-indigo-100">
              <Lock className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Profile Locked
          </h1>
          <p className="text-gray-600 text-center mb-8 px-4">
            Sign in to access your profile and unlock all features
          </p>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            {[
              "Personalized AI recommendations",
              "Access to premium advisors",
              "Save your chat history",
              "Manage your wallet & payments",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Sign In Button */}
          <button
            onClick={() => alert("Redirecting to login...")}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
          >
            <LogIn className="w-5 h-5" />
            Sign In to Continue
          </button>

          {/* Guest Button */}
          <button
            onClick={() => alert("Continuing as guest...")}
            className="w-full text-indigo-600 font-medium py-3 hover:text-indigo-700 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Avatar */}
      <div className="relative h-60 bg-gradient-to-br from-amber-100 via-purple-100 to-pink-100">
        {/* Back Button */}
        <div>
          <button
            onClick={() => window.history.back()}
            className="ml-4 mt-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center justify-between">
          <div className="mb-6">
            <div className="w-30 h-30 rounded-full bg-white flex items-center justify-center ring-4 ring-white">
              <div className="w-30 h-30 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={
                    userData?.gender === "Male"
                      ? userAvatar.maleAvatar
                      : userAvatar.femaleAvatar
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => alert("Navigate to edit profile")}
            className=" bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 font-semibold"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-12">
        {/* Personal Details */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Personal Details
          </h2>

          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            <InfoRow label="Name" value={userData?.name} />
            <InfoRow label="Age" value={userData?.age?.toString()} />
            <InfoRow label="Gender" value={userData?.gender} />
            <InfoRow label="Email" value={userData?.email} />
            <InfoRow label="Phone" value={userData?.phone} />
          </div>
        </div>

        {/* Basic Settings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Basic Settings
          </h2>

          <div className="space-y-3">
            <SettingButton
              icon={<MessageSquare className="w-5 h-5" />}
              label="Chat History"
              onClick={() => alert("Navigate to chat history")}
            />
            <SettingButton
              icon={<RefreshCw className="w-5 h-5" />}
              label="Update Service"
              onClick={() => alert("Navigate to update service")}
            />
            <SettingButton
              icon={<Wallet className="w-5 h-5" />}
              label="My Wallet"
              onClick={() => alert("Navigate to wallet")}
            />
            <SettingButton
              icon={<User className="w-5 h-5" />}
              label="Manage Account"
              onClick={() => alert("Navigate to manage account")}
            />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 bg-white border-2 border-red-100 text-red-600 py-4 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-3 font-semibold shadow-sm cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

// Info Row Component
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900 font-semibold">{value || "N/A"}</span>
    </div>
  );
}

// Setting Button Component
function SettingButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white px-5 py-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-700 group-hover:text-indigo-600 transition-colors">
          {icon}
        </div>
        <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
          {label}
        </span>
      </div>
      <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
