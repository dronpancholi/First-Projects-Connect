import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import {
   Activity, Zap, Terminal, Plus, ArrowRight, Layers, X, Trash2, ChevronRight
} from 'lucide-react';
import { GlassPanel, GlassCard, GlassModal, GlassButton, GlassInput, GlassBadge } from './ui/LiquidGlass.tsx';

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
      <div className="space-y-8 animate-fade-in pb-20">
         {/* Header */}
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 text-amber-600 mb-2">
                  <Activity size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Automation Engine</span>
               </div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workflows</h1>
               <p className="text-gray-500 text-sm mt-1">Create event-driven automations and logical sequences.</p>
            </div>

            <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
               <Plus size={16} /> Deploy Logic
            </GlassButton>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Active Workflows */}
            <div className="lg:col-span-8">
               <GlassPanel>
                  <div className="px-6 py-4 border-b border-gray-100/50 flex justify-between items-center">
                     <h2 className="text-sm font-semibold text-gray-900">Active Workflows</h2>
                     <GlassBadge variant="success">{automations.filter(a => a.isActive).length} Active</GlassBadge>
                  </div>
                  <div className="divide-y divide-gray-50">
                     {automations.length === 0 && (
                        <div className="p-16 text-center">
                           <Zap size={48} className="mx-auto text-gray-200 mb-4" />
                           <p className="text-gray-400">No workflows deployed yet</p>
                           <button
                              onClick={() => setShowModal(true)}
                              className="text-sm text-blue-600 font-medium mt-2 hover:underline"
                           >
                              Create your first workflow
                           </button>
                        </div>
                     )}
                     {automations.map(rule => (
                        <div key={rule.id} className="p-5 hover:bg-white/50 transition-all flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${rule.isActive
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-400'
                                 }`}>
                                 <Zap size={20} />
                              </div>
                              <div>
                                 <h4 className="text-base font-semibold text-gray-900 mb-1">{rule.name}</h4>
                                 <div className="flex items-center gap-3 text-xs">
                                    <span className="text-gray-500">{rule.trigger}</span>
                                    <ArrowRight size={12} className="text-amber-500" />
                                    <span className="font-medium text-gray-900">{rule.action}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <GlassBadge variant={rule.isActive ? 'success' : 'default'}>
                                 {rule.isActive ? 'Active' : 'Disabled'}
                              </GlassBadge>
                              <button
                                 onClick={() => deleteAutomation(rule.id)}
                                 className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </GlassPanel>
            </div>

            {/* Status Panel */}
            <div className="lg:col-span-4 space-y-6">
               <GlassCard className="bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="p-6 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12">
                        <Terminal size={80} />
                     </div>
                     <div className="relative z-10">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-6 flex items-center gap-2">
                           <Activity size={14} /> Engine Status
                        </h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center border-b border-white/10 pb-3">
                              <span className="text-sm text-gray-400">Total Rules</span>
                              <span className="text-xl font-bold text-white">{automations.length}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/10 pb-3">
                              <span className="text-sm text-gray-400">Success Rate</span>
                              <span className="text-xl font-bold text-green-400">99%</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Latency</span>
                              <span className="text-xl font-bold text-amber-400">4ms</span>
                           </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                           <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">System Healthy</span>
                        </div>
                     </div>
                  </div>
               </GlassCard>

               <GlassCard className="bg-gradient-to-br from-amber-400 to-orange-500">
                  <div className="p-6 text-gray-900">
                     <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Layers size={14} /> Quick Actions
                     </h3>
                     <div className="space-y-2">
                        {['Data Sync', 'Health Check', 'Clear Queue'].map(t => (
                           <button
                              key={t}
                              className="w-full flex items-center justify-between p-3 bg-white/30 hover:bg-white/50 border border-black/5 rounded-xl text-sm font-medium transition-colors"
                           >
                              {t} <ChevronRight size={14} />
                           </button>
                        ))}
                     </div>
                  </div>
               </GlassCard>
            </div>

         </div>

         {/* Deploy Modal */}
         {showModal && (
            <GlassModal onClose={() => setShowModal(false)}>
               <form onSubmit={handleDeploy}>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-bold text-gray-900">Deploy Workflow</h3>
                           <p className="text-sm text-gray-500 mt-1">Create an automated trigger-action sequence</p>
                        </div>
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                           <X size={24} />
                        </button>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow Name</label>
                           <GlassInput
                              type="text"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              placeholder="e.g. Deploy Notifier"
                              autoFocus
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger (When This Happens)</label>
                           <GlassInput
                              type="text"
                              value={trigger}
                              onChange={e => setTrigger(e.target.value)}
                              placeholder="e.g. Task Completed"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Action (Do This)</label>
                           <GlassInput
                              type="text"
                              value={action}
                              onChange={e => setAction(e.target.value)}
                              placeholder="e.g. Send Notification"
                           />
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                        <GlassButton type="button" onClick={() => setShowModal(false)}>
                           Cancel
                        </GlassButton>
                        <GlassButton type="submit" variant="primary">
                           Deploy Workflow
                        </GlassButton>
                     </div>
                  </div>
               </form>
            </GlassModal>
         )}
      </div>
   );
};

export default AutomationEngine;
