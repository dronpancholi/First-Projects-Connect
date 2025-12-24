import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import {
   Box, Cpu, Cloud, Monitor, Plus, X, Trash2, Database
} from 'lucide-react';
import { GlassCard, GlassPanel, GlassModal, GlassButton, GlassInput, GlassSelect, GlassBadge } from './ui/LiquidGlass.tsx';

const ResourcesView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
   const { resources, addResource, deleteResource } = useStore();
   const [showModal, setShowModal] = useState(false);
   const [name, setName] = useState('');
   const [type, setType] = useState<'hardware' | 'software' | 'subscription'>('software');
   const [status, setStatus] = useState<'active' | 'maintenance' | 'expired'>('active');

   const handleAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) return;
      await addResource({ name, type, status } as any);
      setName('');
      setShowModal(false);
   };

   const getIcon = (t: string) => {
      switch (t) {
         case 'hardware': return <Monitor size={20} />;
         case 'infrastructure': return <Cloud size={20} />;
         case 'software': return <Box size={20} />;
         default: return <Database size={20} />;
      }
   };

   const getStatusBadge = (s: string) => {
      switch (s) {
         case 'active': return <GlassBadge variant="success">Active</GlassBadge>;
         case 'maintenance': return <GlassBadge variant="warning">Maintenance</GlassBadge>;
         case 'expired': return <GlassBadge variant="danger">Expired</GlassBadge>;
         default: return <GlassBadge>{s}</GlassBadge>;
      }
   };

   return (
      <div className="space-y-8 animate-fade-in pb-20">
         {/* Header */}
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 text-blue-600 mb-2">
                  <Box size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Resource Management</span>
               </div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Resources</h1>
               <p className="text-gray-500 text-sm mt-1">Hardware, software, and infrastructure inventory.</p>
            </div>

            <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
               <Plus size={16} /> Add Resource
            </GlassButton>
         </header>

         {resources.length === 0 ? (
            <div className="glass-card-subtle p-16 text-center rounded-3xl border-2 border-dashed">
               <Cpu size={48} className="mx-auto text-gray-200 mb-6" />
               <h3 className="text-lg font-semibold text-gray-400 mb-2">No resources yet</h3>
               <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                  Track your hardware, software, and infrastructure assets.
               </p>
               <GlassButton variant="primary" onClick={() => setShowModal(true)}>
                  Add First Resource
               </GlassButton>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {resources.map(item => (
                  <GlassCard key={item.id} className="group">
                     <div className="p-6 flex flex-col gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                           {getIcon(item.type)}
                        </div>

                        {/* Info */}
                        <div>
                           <h4 className="text-base font-semibold text-gray-900 mb-1 truncate">{item.name}</h4>
                           <span className="text-xs font-medium text-blue-600 uppercase">{item.type}</span>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                           {getStatusBadge(item.status)}
                           <button
                              onClick={() => deleteResource(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  </GlassCard>
               ))}
            </div>
         )}

         {/* Add Resource Modal */}
         {showModal && (
            <GlassModal onClose={() => setShowModal(false)}>
               <form onSubmit={handleAdd}>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-bold text-gray-900">Add Resource</h3>
                           <p className="text-sm text-gray-500 mt-1">Register a new asset</p>
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
                           <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
                           <GlassInput
                              type="text"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              placeholder="e.g. MacBook Pro M3"
                              autoFocus
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                              <GlassSelect value={type} onChange={e => setType(e.target.value as any)}>
                                 <option value="software">Software</option>
                                 <option value="hardware">Hardware</option>
                                 <option value="infrastructure">Infrastructure</option>
                              </GlassSelect>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                              <GlassSelect value={status} onChange={e => setStatus(e.target.value as any)}>
                                 <option value="active">Active</option>
                                 <option value="maintenance">Maintenance</option>
                                 <option value="expired">Expired</option>
                              </GlassSelect>
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                        <GlassButton type="button" onClick={() => setShowModal(false)}>
                           Cancel
                        </GlassButton>
                        <GlassButton type="submit" variant="primary">
                           Add Resource
                        </GlassButton>
                     </div>
                  </div>
               </form>
            </GlassModal>
         )}
      </div>
   );
};

export default ResourcesView;
