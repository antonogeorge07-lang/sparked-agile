import React from "react";
import { MacAppLayout } from "@/components/MacAppLayout";
import { Activity, Radio, AlertOctagon, TrendingUp, Cpu } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function FlowMetrics() {
  const anomalies = [
    {
      id: "ANM-901",
      node: "Production Gateway Edge Routes",
      metric: "Stalled Token Accumulation",
      severity: "HIGH VARIANCE",
      desc: "Work item velocity has dropped significantly. Code telemetry registers a 3.4x spike in queue stagnation over the past 3 SAAI platform evaluation loops.",
      signal: "WIP Ratio Balance Mismatch // Ingest Quarantined"
    },
    {
      id: "ANM-704",
      node: "Schema Migration Worker Node",
      metric: "Pipeline Ingestion Latency",
      severity: "NOMINAL DEVIATION",
      desc: "Row-Level Security configurations took 14 minutes longer than usual to verify in staging environments. Automatic correction trace initiated.",
      signal: "Supabase Webhook Ingest Status: Stabilizing"
    }
  ];

  return (
    <MacAppLayout windowTitle="Velocity Anomaly Diagnostics">
      <Helmet>
        <title>Anomaly Metrics - Spark-Agile</title>
      </Helmet>

      <div className="space-y-8 animate-fade-in">
        
        {/* Core Prediction Math Banner */}
        <div className="p-6 rounded-2xl border border-white/[0.02] bg-gradient-to-br from-white/[0.02] to-transparent shadow-sovereign-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-wider font-mono text-white uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neutral-400" /> Mathematical Failure Vectoring
            </h2>
            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
              Spark Agile measures delivery velocity by mapping standard task frameworks directly against active codebase changes, pinpointing systemic blockers instantly.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] bg-white/[0.04] border border-white/[0.05] px-3 py-1.5 rounded-lg text-neutral-300">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" /> SCANNING PRODUCTION LOGS
          </div>
        </div>

        {/* Diagnostic Anomaly List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">System Divergence Logs</h3>
            <span className="text-[9px] font-mono text-neutral-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">2 RECEPTOR TRIGGERS</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {anomalies.map((anom) => (
              <div 
                key={anom.id}
                className="group p-5 rounded-2xl border border-white/[0.02] bg-[#09090b]/40 shadow-sovereign-card hover:border-white/[0.06] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.02] pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-mono bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-neutral-400">
                      {anom.id}
                    </span>
                    <h4 className="text-sm font-medium tracking-wide text-neutral-200">{anom.node}</h4>
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/5 text-amber-400 border border-amber-500/10 self-start sm:self-center">
                    {anom.severity}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-neutral-400 leading-relaxed">{anom.desc}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                    <span className="flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-neutral-600" /> {anom.metric}
                    </span>
                    <span className="text-neutral-400">SIGNAL VALUE: {anom.signal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MacAppLayout>
  );
}
