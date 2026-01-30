"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [greetings, setGreetings] = useState("Good Morning!!!");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    name: string | null;
    email: string | null;
    photoUrl: string | null;
    hasClaimedFreeCash?: boolean;
  } | null>(null);

  useEffect(() => {
    const updateGreetings = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        setGreetings("Good Morning!");
      } else if (currentHour < 17) {
        setGreetings("Good Afternoon!");
      } else setGreetings("Good Evening!");
    };

    updateGreetings();
  }, []);

  const {user, loading} = useAuth();

  useEffect(() => {
    if(loading) return;
    const init = async () => {
      try {
        if (!user?.uid) {
          throw new Error("User UID is missing");
        } else {
          if (user.isAnonymous) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              setUserData({
                name: userData.name,
                email: userData.email,
                photoUrl:
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=guest123",
              });
            }
          } else {
            setUserData({
              name: user.displayName,
              email: user.email,
              photoUrl: user.photoURL,
              hasClaimedFreeCash: false,
            });
          }
        }
        setIsLoading(false);
        return;
      } catch (err) {
        console.log("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [user, loading]);

  if(isLoading) <p>....loading</p>

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-5 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3.5">
          <Link href={"/profile"}>
            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 overflow-hidden shadow-sm">
              {/* <Image src="/user-avatar.png" alt="User" width={44} height={44} className="object-cover" /> */}
              <img
                src={userData?.photoUrl as string}
                alt="profile"
                width={44}
                height={44}
              />
            </div>
          </Link>
          <div className="flex flex-col">
            <p className="text-[11px] text-primary font-bold uppercase tracking-wider">
              {greetings}
            </p>
            <p className="text-lg font-extrabold text-gray-900 leading-tight">
              {userData?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-8 border-b border-gray-200 bg-white">
        <Link
          href="/"
          className={`pb-3 text-[14px] font-bold transition-all relative ${
            pathname === "/"
              ? "text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Home
          {pathname === "/" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          )}
        </Link>
        <Link
          href="/allAdvisors"
          className={`pb-3 text-[14px] font-bold transition-all relative ${
            pathname === "/allAdvisors"
              ? "text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Advisors
          {pathname === "/allAdvisors" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          )}
        </Link>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}

export default Layout;
