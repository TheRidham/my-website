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
    <>
      <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17732513189"></script>
      <script>
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'AW-17732513189');`}
      </script>
<<<<<<< HEAD
      <script
        dangerouslySetInnerHTML={{
          __html: `function gtag_report_conversion(url) {
            var callback = function () {
              if (typeof(url) != 'undefined') {
                window.location = url;
              }
            };
            gtag('event', 'conversion', {
                'send_to': 'AW-17732513189/OrccCIms0ekbEKXbwodC',
                'value': 1.0,
                'currency': 'INR',
                'event_callback': callback
            });
            return false;
          }`,
        }}
      />
      <section className={`${dmSans.variable} font-sans`}>
        {children}
      </section>
    </>
  );
}
