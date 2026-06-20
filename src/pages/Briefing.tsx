import React, { useState, useEffect, useRef } from 'react';
import MacAppLayout from '../components/MacAppLayout';

export default function Briefing() {
  const [velocity, setVelocity] = useState(42.8);
  const [isSimulating, setIsSimulating] = useState(false);
  const [delta, setDelta] = useState(0.14);
  const [logs, setLogs] = useState<string[]>([
    "🤖 [Agent_01]: Active system vector pipeline online",
    "🤖 [Agent_02]: Evaluating delivery delta metrics...",
    "⚙️ [RAG]: Indexing live environment logs"
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Kinetic Waveform Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    let animationId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 120;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cy = canvas.height / 2;
      const width = canvas.width;

      // Primary Flow Wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(44, 122, 242, 0.8)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let x = 0; x < width; x++) {
        const y = cy + Math.sin(x * 0.012 + offset) * 18 * Math.cos(x * 0.003);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary Risk Wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(242, 79, 44, 0.4)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x++) {
        const y = cy + Math.sin(x * 0.015 - offset * 1.5) * 12 * Math.sin(x * 0.002);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += 0.04;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Continuous Agentic Logs
  useEffect(() => {
    const mockLogs = [
      "🤖 [Agent_01]: Commits parsed cleanly.",
      "🤖 [Agent_02]: Target sprint metrics nominal.",
      "⚡ [Sys]: Vector indexing pipeline idle.",
      "🤖 [Agent_01]: Scanning backlog for risk parameters...",
      "⚙️ [Database]: Sync complete on active schemas.",
      "🤖 [Agent_03]: RAG validation loops match nominal status."
    ];

    const timer = setInterval(() => {
      const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      setLogs(prev => {
        const next = [...prev, randomLog];
        if (next.length > 4) next.shift(); 
        return next;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const triggerSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setVelocity(parseFloat((38 + Math.random() * 12).toFixed(1)));
      setDelta(parseFloat((Math.random() * 0.35).toFixed(2)));
      setIsSimulating(false);
    }, 900);
  };

  const completionRate = Math.min(Math.floor((velocity / 60) * 100), 100);
  const strokeOffset = 289 - (289 * completionRate) / 100;

  return (
    <MacAppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-300 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 font-sans">
              Delivery Telemetry Matrix
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 uppercase tracking-wider font-mono font-bold">Know your delivery truth, before you decide.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button className="sa-pill-btn sa-glow-frost text-xs uppercase font-mono tracking-wider active:scale-95">
              <span className="sa-capsule-specular"></span>
              Style Rules
            </button>
            <button 
              onClick={triggerSimulation}
              disabled={isSimulating}
              className="sa-pill-btn sa-glow-coral text-white text-xs uppercase font-mono tracking-wider active:scale-95"
            >
              <span className="sa-capsule-specular"></span>
              {isSimulating ? 'CALCULATING...' : 'Run Predictive Simulation'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Card 1: Circular Progress Glass Indicator */}
          <div className="sa-glass-card p-6 flex flex-col justify-between h-72 lg:col-span-4 group">
            <div className="sa-glare-overlay"></div>
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[10px] tracking-widest text-blue-600 bg-white/90 px-3 py-1 rounded-full border border-white uppercase font-mono font-bold shadow-sm">
                FLOW_VELOCITY
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">REF_NODE_01</span>
            </div>
            
            <div className="my-3 relative z-10 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className={`text-5xl font-black tracking-tight text-slate-900 transition-colors duration-300 ${isSimulating ? 'text-red-500' : ''}`}>
                  {isSimulating ? 'CALC...' : velocity}
                </span>
                <p className="text-[11px] text-slate-500 font-bold uppercase font-mono mt-1">pts / sprint</p>
              </div>

              {/* Animated SVG Ring */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="rgba(0,0,0,0.04)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="56" cy="56" r="46" 
                    stroke="url(#sa-blue-gradient)" 
                    strokeWidth="8" 
                    strokeDasharray="289" 
                    strokeDashoffset={isSimulating ? 289 : strokeOffset} 
                    strokeLinecap="round" 
                    fill="transparent" 
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="sa-blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#5296ff" />
                      <stop offset="100%" stop-color="#2c7af2" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-[12px] font-mono font-black text-slate-800">
                  {isSimulating ? '...' : `${completionRate}%`}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono relative z-10 border-t border-white/80 pt-3">
              <span>METRIC_STATUS: NOMINAL</span>
              <span className="text-emerald-600 font-bold">ACTIVE CADENCE</span>
            </div>
          </div>

          {/* Card 2: Simulated Live Debates Terminal */}
          <div className="sa-glass-card p-6 flex flex-col justify-between h-72 lg:col-span-4 group">
            <div className="sa-glare-overlay"></div>
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[10px] tracking-widest text-slate-700 bg-white/90 px-3 py-1 rounded-full border border-white uppercase font-mono font-bold shadow-sm">
                AGENTIC_SIMULATION
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">LIVE</span>
              </div>
            </div>

            <div className="my-3 flex-1 bg-white/50 border border-white p-4 rounded-2xl font-mono text-[10px] text-slate-700 space-y-2 overflow-hidden shadow-inner relative z-10">
              {logs.map((log, i) => (
                <div key={i} className="truncate last:font-bold last:text-blue-600 transition-all duration-300">
                  {log}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono border-t border-white/80 pt-3 relative z-10">
              <span>AGENTS ENGAGED: 04</span>
              <span className="text-blue-600 font-extrabold">{delta} DELTA</span>
            </div>
          </div>

          {/* Card 3: Live Refractive Signal Wave Canvas */}
          <div className="sa-glass-card p-6 flex flex-col justify-between h-72 lg:col-span-4 group">
            <div className="sa-glare-overlay"></div>
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[10px] tracking-widest text-slate-700 bg-white/90 px-3 py-1 rounded-full border border-white uppercase font-mono font-bold shadow-sm">
                SIGNAL_INTEGRATION
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">DOCKER_VPC</span>
            </div>

            <div className="h-28 flex items-center justify-center my-2 relative z-10">
              <canvas ref={canvasRef} className="w-full h-full opacity-90"></canvas>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono border-t border-white/80 pt-3 relative z-10">
              <span>REFRACTION CORE</span>
              <span className="text-slate-900 font-extrabold">45 ms SYNC</span>
            </div>
          </div>

        </div>
      </div>
    </MacAppLayout>
  );
}