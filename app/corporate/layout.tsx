import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className={`${dmSans.variable} font-sans`}>
      {children}
    </section>
  );
}
