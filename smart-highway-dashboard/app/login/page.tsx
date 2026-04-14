import React from 'react';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0f172a] bg-[url('/bg-grid.svg')]">
      <div className="w-full max-w-md p-8 bg-white border border-slate-200 shadow-2xl rounded-2xl dark:bg-slate-900/80 dark:border-slate-800 backdrop-blur-xl flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">ControlGrid Access</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8">Secure enterprise SSO portal. Authenticate to access the Live System Dashboard.</p>
        
        <a href="/auth/login" className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
          Login with SSO
        </a>
      </div>
    </div>
  );
}
