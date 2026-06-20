import React from 'react';
import MacAppLayout from '../components/MacAppLayout';

export default function Privacy() {
  return (
    <MacAppLayout>
      <div className="max-w-3xl mx-auto py-12 space-y-12 relative z-10">
        
        <div className="space-y-2 border-b border-slate-300 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Privacy Sovereignty</h1>
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest font-bold">Effective Continuity Matrix // Node 2026.1</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-slate-700 font-sans">
          
          <section className="space-y-3">
            <h2 className="text-base font-sans font-extrabold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-blue-500 rounded-full shadow-sm"></span> 1. Autonomous Isolation Layer
            </h2>
            <p className="pl-4 text-slate-600 leading-relaxed">
              Our data pipeline guarantees total sovereignty. All intercepted code telemetry, head_commit parameters, and developer sprint logs remain strictly isolated. Raw metrics are parsed immediately by serverless edge routines, ensuring zero-storage preservation of proprietary engineering code.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-sans font-extrabold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-blue-500 rounded-full shadow-sm"></span> 2. Decentralized Vector Sandboxing
            </h2>
            <p className="pl-4 text-slate-600 leading-relaxed">
              To verify alignment safely under the multi-agent debate loop, the semantic vectors generated from your sprint profiles are stored inside localized context nodes. No data aggregation or cross-tenant processing is executed, ensuring total security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-sans font-extrabold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-blue-500 rounded-full shadow-sm"></span> 3. Legal and Regulatory Exemption
            </h2>
            <p className="pl-4 text-slate-600 leading-relaxed">
              The interface framework and styling parameters executed on this domain utilize standard, open-source Tailwind classes and public-domain CSS3 specifications. This implementation represents complete, independent visual development entirely unlinked to third-party proprietary design assets or layout patents.
            </p>
          </section>

        </div>

      </div>
    </MacAppLayout>
  );
}