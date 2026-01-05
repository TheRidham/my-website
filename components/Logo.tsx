export default function Logo() {
  return (
    <div className="flex flex-col items-start select-none scale-100 origin-top-left">
      <div className="bg-linear-to-r from-teal-400 to-blue-500 text-white italic font-bold text-xl px-4 pb-1 pt-0.5 rounded-2xl tracking-wide transform -rotate-1 shadow-sm">
        Quik
      </div>
      <div className="relative mt-2 ml-2">
        <h1 className="text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-blue-500 font-bold text-xl tracking-tight leading-none">
          Advice
        </h1>

        <div className="absolute -top-1.5 left-[51.5%] flex items-end">
          <svg
            className="w-3.5 h-3.5 text-teal-500 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>

          <svg
            className="w-2.5 h-2.5 text-teal-500 fill-current mb-1.5 -ml-0.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>

          <svg
            className="w-1.5 h-1.5 text-teal-500 fill-current mb-2.5 -ml-0.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
