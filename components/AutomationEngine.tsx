
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import { 
  Activity, Zap, ShieldCheck, Terminal, 
  Settings, Play, Plus, Clock, Info, 
  ToggleLeft as Toggle, ArrowRight, Layers, Database, X, Trash2,
  // Added missing ChevronRight icon
  ChevronRight
} from 'lucide-react';

const AutomationEngine: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { automations, addAutomation, deleteAutomation } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  const [name, setName] = useState('');

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trigger || !action || !name) return;
    await addAutomation({ trigger, action, name, isActive: true } as any);
    setName(''); setTrigger(''); setAction('');
    setShowModal(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-12">
        <div>
          <div className="flex items-center gap-3 text-yellow-600 mb-3">
             <Activity size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Logic Orchestrator active</span>
          </div>
          <h1 className="text-5xl font-display font-black text-gray-900 tracking-tighter leading-none mb-3">Workflow Engine</h1>
          <p className="text-gray-500 text-sm font-medium">Orchestrate cross-node automations and event-driven logical sequences.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-yellow-100/20"
        >
           <Plus size={18} className="text-yellow-400" /> Deploy Logic
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Active Logic Registry */}
        <div className="lg:col-span-8">
           <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-10 py-8 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-500">Active Workflow Sequences</h2>
              </div>
              <div className="divide-y divide-gray-50">
                 {automations.length === 0 && (
                    <div className="p-32 text-center opacity-10">
                       <Zap size={64} className="mx-auto mb-6" />
                       <p className="text-[10px] font-black uppercase tracking-[0.5em]">No logical rules deployed</p>
                    </div>
                 )}
                 {automations.map(rule => (
                    <div key={rule.id} className="p-10 hover:bg-yellow-50/20 transition-all flex items-center justify-between group">
                       <div className="flex items-center gap-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${rule.isActive ? 'bg-yellow-400 border-white text-black shadow-lg shadow-yellow-100' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                             <Zap size={24} />
                          </div>
                          <div>
                             <h4 className="text-[18px] font-black text-gray-900 tracking-tighter leading-none mb-3">{rule.name}</h4>
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{rule.trigger}</span>
                                <ArrowRight size={12} className="text-yellow-500" />
                                <span className="text-[10px] font-black uppercase text-gray-900 tracking-widest">{rule.action}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${rule.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                             {rule.isActive ? 'Operational' : 'Disabled'}
                          </div>
                          <button onClick={() => deleteAutomation(rule.id)} className="opacity-0 group-hover:opacity-100 p-2.5 text-gray-300 hover:text-rose-500 transition-all">
                             <Trash2 size={20} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Synthesis Status Panel */}
        <div className="lg:col-span-4 space-y-10">
           <section className="card-professional p-10 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 scale-150 rotate-12">
                 <Terminal size={120} />
              </div>
              <div className="relative z-10">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-10">System Orchestrator Status</h3>
                 <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-[13px] font-medium text-gray-400">Total Logic Nodes</span>
                       <span className="text-2xl font-black text-white">{automations.length}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-[13px] font-medium text-gray-400">Success Coefficient</span>
                       <span className="text-2xl font-black text-emerald-400">0.99</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[13px] font-medium text-gray-400">Latency Profile</span>
                       <span className="text-2xl font-black text-yellow-400">4ms</span>
                    </div>
                 </div>
                 <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Engine Healthy</span>
                 </div>
              </div>
           </section>

           <section className="card-professional p-10 rounded-[2.5rem] bg-yellow-400 text-black">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                 <Layers size={16} /> Synthesis Hub
              </h3>
              <div className="space-y-4">
                 {['Data Synchronizer', 'Uptime Monitor', 'Event Dispatcher'].map(t => (
                    <div key={t} className="w-full flex items-center justify-between p-4 bg-white/20 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-widest">
                       {t} <ChevronRight size={14} />
                    </div>
                 ))}
              </div>
           </section>
        </div>

      </div>

      {/* Logic Deployment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl border border-white/20 overflow-hidden">
              <form onSubmit={handleDeploy}>
                <div className="p-12 bg-gray-900 text-white flex justify-between items-center">
                   <div>
                     <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">Deploy Logic</h3>
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Autonomous sequence authorization</p>
                   </div>
                   <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={32}/></button>
                </div>
                <div className="p-12 space-y-8">
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Rule Identifier</label>
                      <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pipeline Uptime Sentinel" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Trigger (IF)</label>
                      <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="text" value={trigger} onChange={e => setTrigger(e.target.value)} placeholder="e.g. Deployment Failure" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Action (THEN)</label>
                      <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="text" value={action} onChange={e => setAction(e.target.value)} placeholder="e.g. Notify Operational Channel" />
                   </div>
                </div>
                <div className="p-12 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-6">
                   <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 font-black uppercase text-xs">Abort</button>
                   <button type="submit" className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all">Establish Trigger</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AutomationEngine;
