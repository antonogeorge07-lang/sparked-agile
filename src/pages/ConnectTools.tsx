import React, { useState } from 'react';
import MacAppLayout from '../components/MacAppLayout';

interface ToolNode {
  id: string;
  name: string;
  desc: string;
  type: string;
  active: boolean;
}

export default function ConnectTools() {
  const [query, setQuery] = useState('');
  const [tools, setTools] = useState<ToolNode[]>([
    { id: 'git', name: 'GitHub Telemetry Stream', desc: 'Listens to head_commit payloads to index repository telemetry lines', type: 'webhook', active: true },
    { id: 'supabase', name: 'Supabase Live Database', desc: 'Syncs continuous workspace configuration data structures', type: 'storage', active: true },
    { id: 'jira', name: 'Atlassian Jira Epic Link', desc: 'Pulls backlog issues for semantic multi-agent alignment testing', type: 'backlog', active: false }
  ]);

  const toggleNode = (id: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const filteredTools = tools.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <MacAppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 font-sans">
            Integration Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono font-bold">Configure active environment listeners securely.</p>
        </div>

        <div className="sa-glass-card p-6 space-y-6">
          <div className="sa-glare-overlay"></div>
          
          <div className="sa-input-wrapper relative z-10">
            <input 
              type="text" 
              placeholder="🔍 Find Design Patterns & Active Integration Nodes..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sa-input w-full px-6 py-4 text-xs tracking-wider font-mono placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-4 relative z-10">
            {filteredTools.map((tool) => (
              <div 
                key={tool.id} 
                className="flex items-center justify-between p-5 bg-white/40 border border-white rounded-2xl hover:bg-white/60 transition-all duration-300 shadow-sm relative overflow-hidden group"
              >
                <div className="sa-glare-overlay"></div>
                <div className="space-y-1 relative z-10">
                  <p className={`text-sm font-extrabold tracking-wide transition-colors ${tool.active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {tool.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{tool.desc}</p>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 border rounded-full uppercase ${
                    tool.active 
                      ? 'text-blue-600 bg-blue-50/80 border-blue-200' 
                      : 'text-slate-500 bg-white border-slate-200'
                  }`}>
                    {tool.type}
                  </span>
                  
                  <div 
                    onClick={() => toggleNode(tool.id)}
                    className={`sa-toggle-track shadow-sm ${tool.active ? 'state-engaged' : ''}`}
                  >
                    <div className="sa-toggle-handle"></div>
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