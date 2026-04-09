"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { SimulationProvider } from '@/contexts/SimulationContext'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative z-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 scroll-smooth">
            <SimulationProvider>
              {children}
            </SimulationProvider>
          </main>
      </div>
    </>
  )
}
