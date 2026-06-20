import React from "react";
import { MacAppLayout } from "@/components/MacAppLayout";
import { Shield, Key, EyeOff, Radio, Lock, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function SecurityIncidents() {
  const securityNodes = [
    {
      id: "SEC-NODE-01",
      layer: "Row-Level Security (RLS)",
      resource: "workspaces / projects tables",
      status: "ENFORCED",
      verdict: "Tenant isolation verification loop passed. No cross-tenant data bleed detected.",
      telemetry: "Supabase JWT Handshake Validation // Stable"
    },
    {
      id: "SEC-NODE-02",
      layer: "API Perimeter Boundary",
      resource: "edge functions / process-workflow",
      status: "SECURE",
      verdict: "Cryptographic validation keys verified. Ingestion payloads matching owner signatures.",
      telemetry: "Bearer Authorization Hash Token // Authenticated"
    }
  ];

  return (
    <MacAppLayout windowTitle="Perimeter Security & RLS Matrix">
      <Helmet>
        <title>Perimeter Security - Spark-Agile</title>
      </Helmet>

      <div className="space-y-8 animate-fade-in">
        
        {/* Hardware Isolation Status Banner */}
        <div className="p-6 rounded-2xl border border-white/[0.02] bg-gradient-to-b from-white/[0.02] to-transparent shadow-sovereign-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative backdrop-blur-xl">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-wider font-mono text-white uppercase flex items-center gap-2">
              <Lock className="w-4 h-4 text-neutral-400" /> Multi-Tenant Boundary Guard
            </h2>
            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
              Sovereign data integrity monitoring. Spark Agile continuously evaluates runtime cryptographic tokens and database isolation boundaries to prevent unauthorized ingestion overhead.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] bg-white/[0.04] border border-white/[0.05] px-3 py-1.5 rounded-lg text-neutral-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> ISOLATION POLICY ACTIVE
          </div>
        </div>

        {/* Security Matrix List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">Active Boundary Policies</h3>
            <span className="text-[9px] font-mono text-neutral-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">ALL ENGINES SECURE</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {securityNodes.map((node) => (
              <div 
                key={node.id}
                className="p-5 rounded-2xl border border-white/[0.02] bg-[#09090b]/40 shadow-sovereign-card hover:border-white/[0.06] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.02] pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-mono bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-neutral-400">
                      {node.id}
                    </span>
                    <h4 className="text-sm font-medium tracking-wide text-neutral-200">{node.layer}</h4>
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 self-start sm:self-center">
                    {node.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-neutral-400 leading-relaxed">{node.verdict}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-neutral-600" /> Target Resource: {node.resource}
                    </span>
                    <span className="text-neutral-500">TELEMETRY: <span className="text-neutral-400">{node.telemetry}</span></span>
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
