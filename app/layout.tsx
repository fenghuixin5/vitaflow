import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./updates.css";
import "./motion.css";
import "./immersive.css";
import "./refinement.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://haohao-eat-life-kitchen.fenghuixin5.chatgpt.site"),
  title: "VITA FLOW · Eat Well, Move Well, Live Well",
  description: "把饮食、身体状态、运动、压力与生活安排放进一个真正属于你的日常系统。",
  openGraph: {
    title: "VITA FLOW",
    description: "A Life Operating System that grows with you.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "VITA FLOW · A Life Operating System" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
