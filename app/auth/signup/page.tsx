"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      console.log("userSnap:",userSnap);
      if (userSnap.exists()) {
        // User already has a profile, redirect to home
        console.log("exist one");
        router.push("/home");
      } else {
        // New user, create new profile
        console.log("new one")
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          hasClaimedFreeCash: false,
          walletBalance: 0,
          age: null,
          gender: null,
          phone: null,
          createdAt: serverTimestamp(),
        });
        router.push("/home");
      }
    } catch (err: any) {
      console.error("Error signing up with Google:", err);

      let errorMessage = "Failed to sign up with Google. Please try again.";

      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-up cancelled. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with the same email address.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      console.log(user);
      console.log("User signed in anonymously:", user);

      // Anonymous users go directly to home
      router.push("/home");
    } catch (err: any) {
      console.error("Error signing up anonymously:", err);

      let errorMessage = "Failed to sign up anonymously. Please try again.";

      if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Anonymous authentication is not enabled.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-800 p-4 bg-white">
      <div className="w-full max-w-md rounded-xl p-8 bg-white shadow-2xl shadow-blue-200 border border-blue-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Create Account
        </h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className={`w-full py-3 px-4 cursor-pointer rounded-lg text-gray-800 font-semibold transition-all flex items-center justify-center gap-3 border border-gray-300 ${
              loading
                ? "bg-white/70 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <span>Signing up...</span>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center my-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleAnonymousSignup}
            disabled={loading}
            className={`w-full py-3 px-4 cursor-pointer rounded-lg font-semibold transition-all flex items-center justify-center gap-3 border ${
              loading
                ? "bg-gray-100 cursor-not-allowed text-gray-400 border-gray-300"
                : "bg-gray-800 text-white hover:bg-gray-700 border-gray-800"
            }`}
          >
            {loading ? (
              <span>Signing up...</span>
            ) : (
              <>
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Continue as Guest</span>
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-700 mt-4">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Log in
            </a>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600 bg-red-100 p-2 rounded border border-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
