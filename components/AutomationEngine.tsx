import React, { useState } from 'react';
import { Activity, Plus, X, Play, Pause, Trash2, Zap, Clock, RefreshCw } from 'lucide-react';
import { GlassCard, GlassPanel, GlassModal, GlassButton, GlassInput, GlassBadge } from './ui/LiquidGlass.tsx';
import { ViewState } from '../types.ts';

interface Workflow {
   id: string;
   name: string;
   description: string;
   trigger: string;
   status: 'active' | 'paused' | 'draft';
   lastRun: string;
}

const AutomationEngine: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
   const [workflows, setWorkflows] = useState<Workflow[]>([
      { id: '1', name: 'Daily Backup', description: 'Backup all project files', trigger: 'Schedule: Daily at 3 AM', status: 'active', lastRun: '2024-01-15 03:00' },
      { id: '2', name: 'Client Notifier', description: 'Send updates when tasks complete', trigger: 'Event: Task Done', status: 'active', lastRun: '2024-01-14 15:32' },
      { id: '3', name: 'Report Generator', description: 'Weekly progress reports', trigger: 'Schedule: Weekly', status: 'paused', lastRun: '2024-01-08 09:00' },
   ]);

   const [showModal, setShowModal] = useState(false);
   const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '', trigger: '' });

   const handleAddWorkflow = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newWorkflow.name) return;
      setWorkflows([...workflows, {
         id: Date.now().toString(),
         ...newWorkflow,
         status: 'draft',
         lastRun: 'Never'
      }]);
      setNewWorkflow({ name: '', description: '', trigger: '' });
      setShowModal(false);
   };

   const toggleStatus = (id: string) => {
      setWorkflows(workflows.map(w => {
         if (w.id === id) {
            return { ...w, status: w.status === 'active' ? 'paused' : 'active' };
         }
         return w;
      }));
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'active': return 'success';
         case 'paused': return 'warning';
         default: return 'default';
      }
   };

   const stats = {
      total: workflows.length,
      active: workflows.filter(w => w.status === 'active').length,
      paused: workflows.filter(w => w.status === 'paused').length,
   };

   return (
      <div className="space-y-8 animate-fade-in pb-20">
         {/* Header */}
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 text-pink-400 mb-3">
                  <Activity size={18} />
                  <span className="text-xs font-semibold uppercase tracking-widest">Automation Hub</span>
               </div>
               <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Flows</h1>
               <p className="text-white/50 text-sm">Automate repetitive tasks and workflows.</p>
            </div>

            <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
               <Plus size={18} /> New Workflow
            </GlassButton>
         </header>

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="bg-gradient-to-br from-pink-500/20 to-rose-500/20">
               <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                     style={{ boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)' }}>
                     <Zap size={22} className="text-pink-400" />
                  </div>
                  <div>
                     <p className="text-3xl font-bold text-white">{stats.total}</p>
                     <p className="text-sm text-white/50">Total Workflows</p>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="bg-gradient-to-br from-green-500/20 to-emerald-500/20">
               <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                     style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)' }}>
                     <Play size={22} className="text-green-400" />
                  </div>
                  <div>
                     <p className="text-3xl font-bold text-white">{stats.active}</p>
                     <p className="text-sm text-white/50">Running</p>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="bg-gradient-to-br from-amber-500/20 to-orange-500/20">
               <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                     style={{ boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)' }}>
                     <Pause size={22} className="text-amber-400" />
                  </div>
                  <div>
                     <p className="text-3xl font-bold text-white">{stats.paused}</p>
                     <p className="text-sm text-white/50">Paused</p>
                  </div>
               </div>
            </GlassCard>
         </div>

         {/* Workflows List */}
         <GlassPanel>
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
               <RefreshCw size={20} className="text-white/60" />
               <h2 className="text-lg font-semibold text-white">Automation Flows</h2>
            </div>
            <div className="divide-y divide-white/5">
               {workflows.length === 0 && (
                  <div className="p-12 text-center">
                     <Activity size={48} className="mx-auto text-white/20 mb-4" />
                     <p className="text-white/40">No workflows configured</p>
                  </div>
               )}
               {workflows.map(workflow => (
                  <div key={workflow.id} className="p-5 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                     <div className={`w-12 h-12 rounded-xl glass-card flex items-center justify-center ${workflow.status === 'active' ? 'bg-green-500/20' : 'bg-amber-500/20'
                        }`}>
                        {workflow.status === 'active'
                           ? <Play size={20} className="text-green-400" />
                           : <Pause size={20} className="text-amber-400" />
                        }
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-medium text-white">{workflow.name}</h3>
                           <GlassBadge variant={getStatusColor(workflow.status)}>
                              {workflow.status}
                           </GlassBadge>
                        </div>
                        <p className="text-sm text-white/40">{workflow.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                           <span className="flex items-center gap-1">
                              <Zap size={12} /> {workflow.trigger}
                           </span>
                           <span className="flex items-center gap-1">
                              <Clock size={12} /> Last: {workflow.lastRun}
                           </span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                           onClick={() => toggleStatus(workflow.id)}
                           className={`p-2 rounded-lg transition-colors ${workflow.status === 'active'
                                 ? 'text-amber-400 hover:bg-amber-500/20'
                                 : 'text-green-400 hover:bg-green-500/20'
                              }`}
                        >
                           {workflow.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button
                           onClick={() => setWorkflows(workflows.filter(w => w.id !== workflow.id))}
                           className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </GlassPanel>

         {/* Add Workflow Modal */}
         {showModal && (
            <GlassModal onClose={() => setShowModal(false)}>
               <form onSubmit={handleAddWorkflow}>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-bold text-white">New Workflow</h3>
                           <p className="text-sm text-white/50 mt-1">Create an automation flow</p>
                        </div>
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                           <X size={24} />
                        </button>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Workflow Name</label>
                           <GlassInput
                              value={newWorkflow.name}
                              onChange={e => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                              placeholder="e.g. Auto-deploy Pipeline"
                              autoFocus
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Description</label>
                           <GlassInput
                              value={newWorkflow.description}
                              onChange={e => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                              placeholder="What does this workflow do?"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Trigger</label>
                           <GlassInput
                              value={newWorkflow.trigger}
                              onChange={e => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                              placeholder="e.g. Schedule: Daily at 9 AM"
                           />
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                        <GlassButton type="button" onClick={() => setShowModal(false)}>
                           Cancel
                        </GlassButton>
                        <GlassButton type="submit" variant="primary">
                           Create Workflow
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
