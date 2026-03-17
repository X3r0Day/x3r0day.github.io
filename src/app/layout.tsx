import type { Metadata } from "next";
import "./globals.css";
import { MouseEffect } from "@/components/MouseEffect";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "X3r0Day | Security Research & Exploit Tooling",
  description: "Reverse engineering, exploit development, and OSINT tooling. Terminal-first field notes and open-source utilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-white/20">
        <AnimatedBackground />
        <MouseEffect />
        {children}
      </body>
    </html>
  );
}
