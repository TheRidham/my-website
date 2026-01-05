"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

function Layout({ children }: { children: React.ReactNode }) {
  //route protection
  const router = useRouter();
  const { user, loading } = useAuth();
  console.log("user:", user);
  useEffect(() => {
    if (loading) return;
    if (!loading && user) {
      router.push("/home")
    }
  }, [user, loading]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  return <div><AnimatedSection animation="fade-up" delay={200}>{children}</AnimatedSection></div>;
}

export default Layout;
