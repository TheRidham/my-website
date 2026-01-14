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
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";

type UserData = {
  email: string | null;
  name: string | null;
  photoUrl: string | null;
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with actual Firebase call:
        if (!user?.uid) {
          throw new Error("User UID is missing");
        }
        if (user.isAnonymous) {
          const randomNumber = Math.floor(Math.random() * 10000);
          setUserData({
            name: `guest${randomNumber}`,
            email: `guest${randomNumber}@gmail.com`,
            photoUrl:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=guest123",
          });
        } else {
          setUserData({
            name: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
          });
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
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }
  console.log(user);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Avatar */}
      <div className="relative h-60 bg-linear-to-br from-amber-100 via-purple-100 to-pink-100">
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
                  src={userData?.photoUrl as string}
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
            <InfoRow label="Name" value={userData?.name as string} />
            {/* <InfoRow label="Age" value={userData?.age?.toString()} /> */}
            {/* <InfoRow label="Gender" value={userData?.gender} /> */}
            <InfoRow label="Email" value={userData?.email as string} />
            {/* <InfoRow label="Phone" value={userData?.phone} /> */}
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
              href="/wallet"
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
  href
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string
}) {
  return (
    <Link
      href={href || "/profile"}
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
    </Link>
  );
}
