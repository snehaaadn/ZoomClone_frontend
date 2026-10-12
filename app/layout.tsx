import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoom Workplace - Video Conferencing, Web Meetings & Chat",
  description: "Replicate Zoom Workplace with instant meetings, scheduling, WebRTC calling, and real-time collaboration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F9FA] text-[#131619] font-sans">
        {children}
      </body>
    </html>
  );
}
