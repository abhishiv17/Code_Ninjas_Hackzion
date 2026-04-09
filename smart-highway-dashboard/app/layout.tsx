import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// Loading the Inter font for a clean, modern dashboard look
const inter = Inter({ subsets: ["latin"] });

// This metadata populates the <head> of your document
export const metadata: Metadata = {
  title: "SmartHighway OS | Command Center",
  description: "Live System Monitoring & AI Support Terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* antialiased makes the font rendering smoother.
        The background and text colors act as a fallback to globals.css
      */}
      <body className={`${inter.className} antialiased bg-[#0f172a] text-slate-50`}>
        <ErrorBoundary>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}