import React, { useState } from "react";
import { MacAppLayout } from "@/components/MacAppLayout";
import { Shield, Eye, Cpu, Radio, Sparkles, Sliders, PlayCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function CeremonySetup() {
  const [agents, setAgents] = useState([
    {
      id: "AGN-STND",
      ritual: "Asynchronous Standup Synapse",
      strategy: "Continuous Commit & Slack Logs Translation",
      cadence: "Real-time stream evaluation",
      state: "ONLINE",
      confidence: "99.4%"
    },
    {
      id: "AGN-RETR",
      ritual: "Continuous Retrospective Matrix",
      strategy: "Heuristic Friction Node Extraction",
      cadence: "Triggered on milestone boundary failure",
      state: "STANDBY",
      confidence: "96.1%"
    },
    {
      id: "AGN-REFN",
      ritual: "Backlog Predictive Refinement Agent",
      strategy: "Static Dependency Graph Mapping",
      cadence: "Every 1,000 telemetry cycles",
      state: "ONLINE",
      confidence: "98.8%"
    }
  ]);

  return (
    <MacAppLayout windowTitle="Autonomous Ritual Synapse Core">
      <Helmet>
        <title>Ritual Synapse Core - Spark-Agile</title>
      </Helmet>

      <div className="space-y-8 animate-fade-in">
        
        {/* The Glass Chassis Hero banner */}
        <div className="p-6 rounded-2xl border border-white/[0.03] bg-gradient-to-b from-white/[0.02] via-white/[0.01] to-transparent shadow-sovereign-card relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neutral-400 animate-pulse" />
                <h2 className="text-sm font-semibold tracking-wider text-white uppercase font-mono">Zero-Human Orchestration</h2>
              </div>
              <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                Traditional agile ceremonies are dead. These autonomous backend workers process live development telemetry streams silently, generating real-time execution clarity while removing administrative burden completely.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] bg-white/[0.03] border border-white/[0.05] px-3 py-2 rounded-xl text-neutral-400">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> ENGINE RADAR RESPONSIVE
            </div>
          </div>
        </div>

        {/* Glass Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">Autonomous Worker Allocations</h3>
            <span className="text-[9px] font-mono text-neutral-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">3 MODULES ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className="group p-6 rounded-2xl border border-white/[0.02] bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] shadow-sovereign-card hover:border-white/[0.08] hover:bg-white/[0.01] transition-all duration-300 relative overflow-hidden"
              >
                {/* Micro border reflection line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] font-mono tracking-wider text-neutral-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 opacity-80">
                        {agent.id}
                      </span>
                      <h4 className="text-sm font-medium tracking-wide text-neutral-200 group-hover:text-white transition-colors">
                        {agent.ritual}
                      </h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-400">
                        <span className="text-neutral-500 font-mono text-[11px] uppercase tracking-wider mr-1">STRATEGY:</span> {agent.strategy}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-500">
                        FREQUENCY MATRIX: {agent.cadence}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-white/5 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500">CONFIDENCE:</span>
                      <span className="text-xs font-semibold text-neutral-300">{agent.confidence}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      agent.state === "ONLINE" 
                        ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" 
                        : "bg-neutral-500/5 text-neutral-400 border-white/5"
                    }`}>
                      {agent.state}
                    </span>
                  </div>
                </div>

                {/* Lower interaction ribbon */}
                <div className="mt-5 pt-4 border-t border-white/[0.02] flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-neutral-600" /> Runtime Engine Pipeline Verifiably Linked
                  </span>
                  <button className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors group-hover:translate-x-0.5 transition-transform duration-300">
                    Audit Synapse Telemetry <PlayCircle className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MacAppLayout>
  );
}
