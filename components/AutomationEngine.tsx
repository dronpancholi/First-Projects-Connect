
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import { 
  Activity, Zap, ShieldCheck, Terminal, 
  Settings, Play, Plus, Clock, Info, 
  ToggleLeft as Toggle, ArrowRight, Layers, Database
} from 'lucide-react';

const AutomationEngine: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const rules = [
    { id: '1', name: 'GitHub Deployment Trigger', trigger: 'Push to main', action: 'Notify Vercel node', active: true },
    { id: '2', name: 'Task Overdue Escalation', trigger: 'Task > 24h past due', action: 'Signal CRITICAL in Dashboard', active: true },
    { id: '3', name: 'Weekly Audit Generation', trigger: 'Mon 09:00 AM', action: 'Synthesize Executive Deck', active: false },
    { id: '4', name: 'Supabase Schema Sync', trigger: 'DB Schema Change', action: 'Update Local Types', active: true },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <Activity size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Automation Logic Engine</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tighter leading-none mb-2">Workflow Hub</h1>
          <p className="text-gray-500 text-sm font-medium">Define and orchestrate ecosystem-level automations and logic triggers.</p>
        </div>
        
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
           <Plus size={16} /> Deploy Workflow
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Logic Registry */}
        <div className="lg:col-span-8">
           <section className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Active Workflows</h2>
              </div>
              <div className="divide-y divide-gray-50">
                 {rules.map(rule => (
                    <div key={rule.id} className="p-6 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                       <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${rule.active ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                             <Zap size={18} />
                          </div>
                          <div>
                             <h4 className="text-[14px] font-bold text-gray-800 tracking-tight leading-none mb-2">{rule.name}</h4>
                             <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{rule.trigger}</span>
                                <ArrowRight size={10} className="text-gray-300" />
                                <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">{rule.action}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${rule.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                             {rule.active ? 'Operational' : 'Hibernating'}
                          </div>
                          <button className="text-gray-300 hover:text-black transition-colors"><Settings size={16} /></button>
                       </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Engine Status */}
        <div className="lg:col-span-4 space-y-8">
           <section className="card-professional p-8 bg-gray-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Terminal size={120} />
              </div>
              <div className="relative z-10">
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 mb-8">System Orchestrator</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-gray-400">Total Executions</span>
                       <span className="text-lg font-bold">14,204</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-gray-400">Runtime Success</span>
                       <span className="text-lg font-bold text-emerald-400">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-gray-400">Logic Nodes</span>
                       <span className="text-lg font-bold text-indigo-400">32 Active</span>
                    </div>
                 </div>
                 <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Engine Healthy</span>
                 </div>
              </div>
           </section>

           <section className="card-professional p-8 border-indigo-100 bg-indigo-50/30">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
                 <Layers size={14} /> Logic Templates
              </h3>
              <div className="space-y-3">
                 {['Data Ingest', 'Uptime Sentinel', 'Project Pulse'].map(t => (
                    <button key={t} className="w-full text-left px-4 py-3 bg-white border border-indigo-100 rounded-lg text-xs font-bold text-indigo-900 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                       {t}
                    </button>
                 ))}
              </div>
           </section>
        </div>

      </div>
    </div>
  );
};

export default AutomationEngine;
