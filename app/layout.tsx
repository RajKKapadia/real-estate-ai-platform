import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "RealEstateAI — AI Agent Platform",
  description:
    "Multi-tenant SaaS platform for real estate builders to deploy AI agents via website chat and WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          signInForceRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
