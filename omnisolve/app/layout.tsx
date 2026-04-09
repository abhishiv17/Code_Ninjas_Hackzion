import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { SimulationProvider } from '@/contexts/SimulationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OmniSolve Command Center',
  description: 'AI-powered Smart Highway Command Center',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground h-screen overflow-hidden flex relative`}>
        {/* Ambient Gradient Background Layer */}
        <div className="absolute inset-0 z-[-2] bg-background"></div>
        <div className="absolute inset-0 z-[-1] opacity-40 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1)_0%,transparent_50%)] dark:opacity-40 opacity-10"></div>
        {/* Subtle Noise Texture overlay (optional depth effect) */}
        <div className="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none dark:opacity-[0.03] opacity-[0.01]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        <Sidebar />
        <div className="flex-1 flex flex-col ml-64 overflow-hidden relative z-0">
           <Navbar />
           <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 scroll-smooth">
             <SimulationProvider>
               {children}
             </SimulationProvider>
           </main>
        </div>
      </body>
    </html>
  )
}
