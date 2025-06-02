import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
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
  title: "EliteBuilders | AI Builders Competition Platform",
  description: "A competitive arena where solo developers craft and submit AI-powered MVPs against real-world challenges from top companies.",
  keywords: ["AI", "competition", "developers", "challenges", "hiring", "builders", "machine learning"],
  authors: [{ name: "EliteBuilders Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elitebuilders.ai",
    title: "EliteBuilders | AI Builders Competition Platform",
    description: "A competitive arena where solo developers craft and submit AI-powered MVPs against real-world challenges from top companies.",
    siteName: "EliteBuilders",
  },
  twitter: {
    card: "summary_large_image",
    title: "EliteBuilders | AI Builders Competition Platform",
    description: "A competitive arena where solo developers craft and submit AI-powered MVPs against real-world challenges from top companies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen noise-bg`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
