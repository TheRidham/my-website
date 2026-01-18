export default function CardSwipeLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-40 bg-emerald-100 rounded-xl">
      {/* Container / Terminal Slot */}
      <div className="relative flex items-center justify-center">
        {/* The Card */}
        {/* We use specific animation delays and translation to mimic the swipe */}
        <div className="z-10 w-16 h-10 bg-linear-to-br from-emerald-500 to-primary rounded-md shadow-lg border border-emerald-400 relative animate-[bounce_1s_infinite]">
          {/* Card Chip */}
          <div className="absolute top-2 left-2 w-3 h-2 bg-yellow-400 rounded-[1px] opacity-80"></div>
          {/* Card Text Lines */}
          <div className="absolute bottom-2 left-2 w-8 h-1 bg-white/30 rounded-full"></div>
        </div>

        {/* The Terminal Base (Visual anchor) */}
        <div className="absolute -bottom-3 w-20 h-4 bg-blue-800 rounded-full blur-sm opacity-20 animate-pulse"></div>
      </div>

      <div className="mt-6 text-sm font-medium text-primary animate-pulse">
        Processing Payment...
      </div>
    </div>
  );
}
