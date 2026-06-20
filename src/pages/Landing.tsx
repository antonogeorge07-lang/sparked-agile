import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Compass, Terminal, Cpu, ArrowRight, Activity, Zap } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen bg-[#050507] text-neutral-200 font-sans antialiased relative overflow-hidden flex flex-col justify-between p-6">
      <Helmet>
        <title>Spark Agile // Autonomous Execution Telemetry</title>
      </Helmet>

      {/* Decorative Dark Glass Light Passes */}
      <div className="absolute top-0 left-1/2 w-[800px] h-[350px] bg-white/[0.01] rounded-full blur-[140px] -translate-x-1/2 pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-neutral-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      {/* 🌐 TOP NAVIGATION PERIMETER HEADER */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-white/[0.03] pb-4 relative z-20 font-mono text-[10px]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="tracking-[0.3em] font-bold text-neutral-200">SPARK AGILE // SECURE CORE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-neutral-500 hidden sm:inline">SYSTEM STATUS: NOMINAL</span>
          <button 
            onClick={() => navigate("/auth")}
            className="px-3 py-1.5 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] rounded-lg text-neutral-300 transition-all duration-200"
          >
            Access Console
          </button>
        </div>
      </header>

      {/* 🔮 HERO APERITIF SECTION */}
      <main className="max-w-4xl w-full mx-auto text-center space-y-8 my-auto relative z-20 py-12">
        
        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.04] bg-white/[0.02] text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
          <Cpu className="w-3 h-3 text-neutral-400" /> Beyond Project Management Infrastructure
        </div>

        {/* The One Line Truth Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] max-w-3xl mx-auto">
            Detect execution failure before it becomes visible.
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed font-light">
            Bypass manual framework logging entirely. Spark Agile listens silently to code repository telemetry and infrastructure webhooks to map real-time delivery risk.
          </p>
        </div>

        {/* Action Call Grid */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => navigate("/auth")}
            className="w-full sm:w-auto px-6 py-2.5 bg-neutral-200 text-[#050507] hover:bg-white font-medium rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(255,255,255,0.1)]"
          >
            Initialize Environment <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate("/about")}
            className="w-full sm:w-auto px-6 py-2.5 border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] text-neutral-300 font-medium rounded-xl text-sm transition-all duration-200"
          >
            Read Technical Philosophy
          </button>
        </div>

        {/* Three Pillar System Previews */}
        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          
          <div className="p-5 rounded-2xl border border-white/[0.02] bg-gradient-to-b from-white/[0.02] to-transparent space-y-2">
            <div className="flex items-center gap-2 text-neutral-300">
              <Compass className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-mono tracking-wider uppercase font-semibold">01 // Radar Intelligence</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
              No task charts or burndowns. A simplified executive stream showing what milestones are decaying in real time.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/[0.02] bg-gradient-to-b from-white/[0.02] to-transparent space-y-2">
            <div className="flex items-center gap-2 text-neutral-300">
              <Terminal className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-mono tracking-wider uppercase font-semibold">02 // Zero Maintenance</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
              Eliminates the human data entry tax. The system listens directly to commit rhythms, pipeline hashes, and logs.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/[0.02] bg-gradient-to-b from-white/[0.02] to-transparent space-y-2">
            <div className="flex items-center gap-2 text-neutral-300">
              <Activity className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-mono tracking-wider uppercase font-semibold">03 // Cross-Flow Frameworks</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
              Normalizes Scrum velocity, Kanban capacity ratios, and Waterfall gates into unified structural stability data.
            </p>
          </div>

        </div>

      </main>

      {/* 🔐 ANCHOR FOOTER STACK */}
      <footer className="max-w-7xl w-full mx-auto border-t border-white/[0.02] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px] text-neutral-500 relative z-20">
        <div className="flex items-center gap-4">
          <span>DESIGN PHILOSOPHY: INDUSTRIAL OBSIDIAN</span>
          <span>SOVEREIGN DIGITAL ASSET // OWNED COMPONENT</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/privacy" className="hover:text-neutral-400 transition-colors">PRIVACY MATRIX</a>
          <a href="/terms" className="hover:text-neutral-400 transition-colors">SERVICE AGREEMENT</a>
        </div>
      </footer>

    </div>
  );
}
