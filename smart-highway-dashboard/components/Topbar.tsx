export default function Topbar() {
  return (
    <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm">
      <div>
        <h1 className="text-2xl font-semibold text-white">Command Center</h1>
        <p className="text-sm text-slate-400 mt-1">Live System Monitoring & AI Support</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-emerald-500 font-medium">All Systems Nominal</span>
        </div>
      </div>
    </header>
  );
}