import React from "react";

export default function SectionCard({
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start gap-3 mb-1">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
                {title}
              </h2>
              {badge && (
                <span className="bg-primary/15 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}
