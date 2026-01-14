"use client";

import Jaiya from "@/components/Jaiya/Index";
import BottomNav from "@/components/BottomNav";
import React, { useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useChat } from "@/providers/ChatProvider";
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const { activeChat, resetChat, isSidebarOpen, setIsSidebarOpen, switchChat } =
    useChat();

  const categoryKey = params.category as string;
  const subcategoryTitle = params.subcategory
    ? decodeURIComponent(params.subcategory as string)
    : undefined;

  useEffect(() => {
    if (categoryKey && subcategoryTitle) {
      switchChat({
        name: subcategoryTitle,
        categoryKey,
        subcategoryTitle,
      });
    } else if (!pathname.includes("/")) {
      if (pathname === "/") {
        resetChat();
      }
    }
  }, [categoryKey, subcategoryTitle, pathname, switchChat, resetChat]);

  //route protection handled by AuthOverlay
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );

  return (
    <section className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar (Left Section) */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-full md:relative md:z-auto h-full
          transition-all duration-300 ease-in-out flex flex-col bg-white border-r border-gray-200
          ${
            isSidebarOpen
              ? "translate-x-0 md:w-105"
              : "-translate-x-full md:translate-x-0 md:w-0"
          }
        `}
      >
        <div
          className={`flex-1 overflow-y-auto no-scrollbar ${
            !isSidebarOpen && "md:hidden"
          }`}
        >
          {children}
        </div>
        <div className={`shrink-0 md:hidden`}>
          <BottomNav />
        </div>

        {/* Desktop Toggle Button (Inside Sidebar when open) */}
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="hidden md:flex absolute right-4 top-5 p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all z-40"
            title="Close sidebar"
          >
            <PanelLeftClose size={22} />
          </button>
        )}
      </div>

      {/* Main Content (Right Section - Jaiya) */}
      <div
        className={`flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden transition-all duration-300 ${
          !isSidebarOpen ? "md:pl-0" : ""
        }`}
      >
        {/* Desktop Toggle Button (When sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="hidden md:flex absolute left-4 top-5 p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all z-50 shadow-sm border border-gray-100 bg-white"
            title="Open sidebar"
          >
            <PanelLeftOpen size={22} />
          </button>
        )}

        <div className="flex-1 h-full">
          <Jaiya
            isSidebarOpen={isSidebarOpen}
            advisorName={activeChat.advisorName}
            advisorAvatar={activeChat.advisorAvatar}
            categoryKey={activeChat.categoryKey}
            subcategoryTitle={activeChat.subcategoryTitle}
            onBack={resetChat}
          />
        </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </section>
  );
}

export default Layout;
