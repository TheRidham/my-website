"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  {
    label: "Insights Settings",
    value: "insightsSettings",
    href: "/customize/insightsSettings",
  },
  {
    label: "Intelligence Settings",
    value: "intelligenceSettings",
    href: "/customize/intelligenceSettings",
  },
];

export function CustomTabs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const activeTab = tabs.find(tab =>
    pathname.startsWith(tab.href)
  )?.value;

  return (
    <Tabs value={activeTab}>
      <TabsList className="w-full" variant={'line'}>
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={tab.href} className="flex-1 py-6 text-center">
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}