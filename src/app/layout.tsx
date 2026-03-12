import type { Metadata } from "next";
import "./globals.css";
import { MouseEffect } from "@/components/MouseEffect";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Creative Portfolio",
  description: "Ultra animated interactive portfolio",
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
