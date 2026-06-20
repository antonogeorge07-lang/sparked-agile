import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function MacAppLayout({ children, windowTitle }: { children: React.ReactNode; windowTitle?: string }) {
  const location = useLocation();

  const navItems = [
    { path: '/briefing', label: 'TELEMETRY_BRIEFING' },
    { path: '/tools', label: 'CONNECT_TOOLS' },
    { path: '/privacy', label: 'PRIVACY_SOVEREIGNTY' }
  ];

  return (
    <div className="h-screen w-screen flex flex-col relative z-10 bg-[#f8fafc] overflow-hidden select-none">
      
      {/* 1. Deep Space Fluid Core Canvas with Physical Grain */}
      <div className="absolute inset-0 sa-ambient-mesh -z-20 overflow-hidden pointer-events-none">
        <div className="sa-glass-noise z-10"></div>
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-cyan-300/30 filter blur-[120px] sa-aurora-alpha"></div>
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full bg-indigo-300/25 filter blur-[130px] sa-aurora-beta"></div>
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] rounded-full bg-orange-200/20 filter blur-[100px]"></div>
      </div>

      {/* 2. Chrome Top Nav Controller Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/80 bg-white/50 backdrop-blur-md relative z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-400 cursor-pointer hover:scale-110 transition-all shadow-sm flex items-center justify-center text-[8px] text-red-800 font-bold font-mono">✕</div>
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 cursor-pointer hover:scale-110 transition-all shadow-sm"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-green-400 cursor-pointer hover:scale-110 transition-all shadow-sm"></div>
          <span className="ml-4 text-[11px] tracking-widest text-slate-600 font-mono uppercase font-bold">SPARK-AGILE // CONTROL_CENTER_NODE_01</span>
        </div>
        
        <nav className="flex gap-1 bg-white/40 border border-white p-1 rounded-full shadow-sm">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/briefing');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${
                  isActive 
                    ? 'text-slate-900 bg-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2ecc71] shadow-sm animate-pulse"></span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold hidden md:inline">SYSTEM_STATUS // ACTIVE</span>
        </div>
      </header>

      {/* 3. Fluid Scrolling Viewport Container */}
      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
export default MacAppLayout;
