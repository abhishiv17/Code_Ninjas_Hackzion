import { Zap, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col">
      <div className="p-6 flex items-center space-x-3 text-blue-500 font-bold text-xl">
        <Zap size={24} />
        <span>SmartHighway<br/><span className="text-sm text-blue-400">OS</span></span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <a href="#" className="flex items-center space-x-3 bg-blue-600/10 text-blue-500 px-4 py-3 rounded-lg border border-blue-500/20">
          <LayoutDashboard size={20} />
          <span>Command Center</span>
        </a>
        <a href="#" className="flex items-center space-x-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors">
          <MessageSquare size={20} />
          <span>IT Support (RAG)</span>
        </a>
        <a href="#" className="flex items-center space-x-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors">
          <Settings size={20} />
          <span>Configurations</span>
        </a>
      </nav>
    </aside>
  );
}