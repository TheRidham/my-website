"use client";

import Jaiya from "@/components/Jaiya/Index";
import React, { useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useChat } from "@/providers/ChatProvider";
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const aiAdvisorRoutes = [
  "nutrition",
  "fitness",
  "mental",
  "general",
  "sexual",
  "chronic",
  "skin",
  "addiction",
  "relationship",
];

function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const { activeChat, resetChat, isSidebarOpen, setIsSidebarOpen, switchChat } =
    useChat();

  const categoryKey = params.category as string;
  const subcategoryTitle = params.subcategory
    ? decodeURIComponent(params.subcategory as string)
    : undefined;

  const firstSegment = pathname.split("/")[1];
  const showButton = aiAdvisorRoutes.includes(firstSegment);
  console.log("showButton", showButton);

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );

  return (
    <section className="flex h-screen overflow-hidden">
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

        {/* Desktop Toggle Button (Inside Sidebar when open) */}
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="flex absolute right-4 top-5 p-2.5 text-gray-400 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all z-40"
            title="Close sidebar"
          >
            <PanelLeftOpen size={22} />
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
        {!isSidebarOpen &&
          (showButton ? (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex absolute left-4 top-5 p-2.5 text-gray-400 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all z-40"
              title="Close sidebar"
            >
              <PanelLeftClose size={22} />
            </button>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-4 top-4 text-gray-400 hover:text-primary hover:bg-emerald-50 rounded-full transition-all z-40 shadow-md border border-gray-100 bg-white group"
              title="Open sidebar"
            >
              <div className="relative flex items-center justify-center w-14 h-14">
                {/* Circular Text using SVG */}
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <path
                      id="circlePath"
                      d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
                    />
                  </defs>
                  <text
                    className="text-[12px] fill-gray-800 group-hover:fill-primary transition-colors font-bold"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    <textPath
                      href="#circlePath"
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      CLICK TO CHAT • CLICK TO CHAT •
                    </textPath>
                  </text>
                </svg>

                {/* Center Icon/Content */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                  <img
                src={
                  "https://firebasestorage.googleapis.com/v0/b/jai-ai-30103.firebasestorage.app/o/profilePhotos%2Fd9dd1082-440c-439b-9113-9c2c344d0693.jpg?alt=media&token=205a0856-3170-4fd8-ba89-8c3e406806d7"
                }
                alt="human-advisor"
                className="w-8 h-8 rounded-full object-cover"
                />
                </div>
              </div>
            </button>
          ))}

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
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </section>
  );
}

export default Layout;
