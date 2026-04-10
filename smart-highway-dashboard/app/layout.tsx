import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";

// Loading the Inter font for a clean, modern dashboard look
const inter = Inter({ subsets: ["latin"] });

// This metadata populates the <head> of your document
export const metadata: Metadata = {
  title: "SmartHighway OS | AI Command Center",
  description: "AI-Powered Highway Management with Live Monitoring & Support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${inter.className} antialiased bg-[#0f172a] text-slate-50`}>
        <ErrorBoundary>
          <AppProvider>
            <DashboardProvider>
              {children}
            </DashboardProvider>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}