'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for new token-based auth first
    const token = localStorage.getItem('token');
    
    // Fallback to old auth method
    const isAuthenticated = localStorage.getItem('authenticated');

    if (token || isAuthenticated === 'true') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}