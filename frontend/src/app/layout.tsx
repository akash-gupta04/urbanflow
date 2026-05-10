import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import PreferencesRoot from "@/components/PreferencesRoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UrbanFlow — City OS",
    template: "%s · UrbanFlow",
  },
  description:
    "UrbanFlow City OS — transit, emergency, assistant, sustainability, and inclusive controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--uf-bg)] text-[var(--uf-fg)] antialiased">
        <PreferencesRoot />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-teal-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-200"
        >
          Skip to main content
        </a>
        <Navbar />
        <div id="main" className="flex-1 outline-none" tabIndex={-1}>
          {children}
        </div>
      </body>
    </html>
  );
}
