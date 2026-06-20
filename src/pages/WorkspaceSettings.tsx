import React from "react";
import { MacAppLayout } from "@/components/MacAppLayout";
import { Settings, Cpu, HardDrive, Key, RefreshCw, Layers } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function WorkspaceSettings() {
  return (
    <MacAppLayout windowTitle="Node Configuration Center">
      <Helmet>
        <title>Node Configuration - Spark-Agile</title>
      </Helmet>

      <div className="space-y-8 animate-fade-in">
        
        {/* Core Settings Shell Overview */}
        <div className="p-6 rounded-2xl border border-white/[0.02] bg-gradient-to-b from-white/[0.02] to-transparent shadow-sovereign-card relative backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-wider font-mono text-white uppercase flex items-center gap-2">
                <Settings className="w-4 h-4 text-neutral-400" /> System Parameter Matrices
              </h2>
              <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                Control the ingestion bounds, cryptographic handshake frequencies, and cloud database parameters for this dedicated operational node.
              </p>
            </div>
          </div>
        </div>

        {/* Configurations Grid Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Glass Card 1: Ingestion Keys */}
          <div className="p-6 rounded-2xl border border-white/[0.02] bg-[#09090b]/40 shadow-sovereign-card relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            <div className="flex items-center gap-2 border-b border-white/[0.02] pb-3">
              <Key className="w-4 h-4 text-neutral-400" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-300">Telemetry Ingest Tokens</h3>
            </div>
            
            <div className="space-y-3 font-mono">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 uppercase">Primary Core Secret Key</label>
                <div className="flex items-center justify-between bg-black/40 border border-white/[0.03] p-2 rounded-xl text-xs text-neutral-300">
                  <span>saai_live_pk_••••••••••••••••7d63</span>
                  <button className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-neutral-400 hover:text-white transition-colors">Reveal</button>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                Used to authorize raw streaming telemetry payloads hitting the edge ingestion routes.
              </p>
            </div>
          </div>

          {/* Glass Card 2: Environment Profile Node */}
          <div className="p-6 rounded-2xl border border-white/[0.02] bg-[#09090b]/40 shadow-sovereign-card relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            <div className="flex items-center gap-2 border-b border-white/[0.02] pb-3">
              <Layers className="w-4 h-4 text-neutral-400" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-300">Node Profile Isolation</h3>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/[0.02]">
                <span className="text-neutral-500">DATABASE BOUNDARY</span>
                <span className="text-neutral-300">Isolated Tenant Block</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/[0.02]">
                <span className="text-neutral-500">EDGE RUNTIME STATE</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" /> OPTIMIZED
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-500">COMPILER TARGET</span>
                <span className="text-neutral-300">Vite // React-v7</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </MacAppLayout>
  );
}
