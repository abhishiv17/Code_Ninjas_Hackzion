import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';

// Loading the Inter font for a clean, modern dashboard look
const inter = Inter({ subsets: ["latin"] });

// This metadata populates the <head> of your document
export const metadata: Metadata = {
  title: "Control Grid | Command Center",
  description: "AI-Powered Highway Management with Live Monitoring & Support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={inter.className}>
        <Auth0Provider>
          <ErrorBoundary>
            <LanguageProvider>
              <ThemeProvider>
                <AppProvider>
                  <DashboardProvider>
                    {children}
                  </DashboardProvider>
                </AppProvider>
              </ThemeProvider>
            </LanguageProvider>
          </ErrorBoundary>
        </Auth0Provider>
      </body>
    </html>
  );
}