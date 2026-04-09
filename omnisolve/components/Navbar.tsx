import { Activity, ShieldAlert, Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-wider text-white">OMNI<span className="text-blue-500">SOLVE</span></h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Command Center</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-300">System Online</span>
        </div>
        <div className="h-6 w-px bg-white/10"></div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <ShieldAlert className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20"></div>
      </div>
    </nav>
  );
}
