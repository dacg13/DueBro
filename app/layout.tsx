import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppSplashScreen } from "@/components/shared/AppSplashScreen";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DueBro — Student Deadline Tracker",
  description:
    "See everything you owe and know what's actually at risk before it's too late. The student deadline tracker with explainable deadline risk intelligence.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DueBro",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <body className="min-h-full bg-void-950 text-signal-white antialiased selection:bg-signal-white selection:text-void-950 flex flex-col font-sans">
        <AppSplashScreen />
        {children}
      </body>
    </html>
  );
}
