import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FareHawk - Track Flight Prices & Get Deal Alerts",
  description:
    "Find the cheapest flights, track prices over time, and get instant alerts when prices drop. Save hundreds on your next trip.",
  manifest: "/manifest.json",
  themeColor: "#0a0a1a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FareHawk",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakarta.variable} ${sora.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
