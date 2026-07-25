import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MySpaceLove - Your Shared Space",
  description: "A beautiful shared space for couples to nurture their relationship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-pink-500 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-300">
          Skip to main content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
