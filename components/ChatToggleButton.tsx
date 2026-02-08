import React from "react";
import { MessageCircle } from "lucide-react";

interface ChatToggleButtonProps {
  onClick: () => void;
  advisorImage?: string;
}

export default function ChatToggleButton({
  onClick,
  advisorImage = "https://firebasestorage.googleapis.com/v0/b/jai-ai-30103.firebasestorage.app/o/profilePhotos%2Fd9dd1082-440c-439b-9113-9c2c344d0693.jpg?alt=media&token=205a0856-3170-4fd8-ba89-8c3e406806d7",
}: ChatToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-4 text-gray-400 rounded-full transition-all duration-300 z-40 group bg-accent/10 backdrop-blur-sm border border-primary cursor-pointer hover:scale-95"
      title="Open chat with advisor"
      aria-label="Open chat sidebar"
    >
      <div className="relative flex items-center justify-center w-16 h-16">
        

        {/* Circular Text using SVG */}
        <svg
          className="absolute inset-0 w-full h-full rotate-90 group-hover:rotate-270 transition-transform duration-700 ease-out"
          viewBox="0 0 100 100"
        >
          <defs>
            <path
              id="circlePath"
              d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
            />
            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <text
            className="text-[12px] fill-primary  transition-all duration-300 font-bold tracking-wider"
            style={{ letterSpacing: "0.15em" }}
          >
            <textPath
              href="#circlePath"
              startOffset="50%"
              textAnchor="middle"
            >
              CLICK TO CHAT
            </textPath>
          </text>
        </svg>

        {/* Center Icon/Content */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden transition-all duration-300 z-10">
          <img
            src={advisorImage}
            alt="Chat advisor"
            className="w-full h-full object-cover transition-transform duration-300"
          />
        </div>

      </div>
    </button>
  );
}
