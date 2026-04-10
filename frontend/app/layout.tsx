import type { Metadata } from "next";
import "./globals.css";
<<<<<<< HEAD
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "OmniSolve Command Center",
  description: "AI-powered Smart Highway Command Center",
=======

export const metadata: Metadata = {
  title: "HackAuth — Drop-in Auth for Hackathons",
  description: "Beautiful, ready-to-use authentication UI for your next hackathon project.",
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <html lang="en" data-theme="dark" suppressHydrationWarning>
=======
    <html lang="en" data-theme="dark">
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
<<<<<<< HEAD
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Inline script: read saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('omni-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', t);
              } catch(_) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
=======
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22
    </html>
  );
}
