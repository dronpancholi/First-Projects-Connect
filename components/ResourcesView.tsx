
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import { 
  Box, Cpu, Globe, Cloud, ShieldCheck, 
  Settings, Zap, Monitor, HardDrive, 
  Key, RefreshCw, AlertTriangle, Plus, Search, X, Trash2,
  // Added missing Database icon
  Database
} from 'lucide-react';

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
      case 'hardware': return <Monitor size={22} />;
      case 'infrastructure': return <Cloud size={22} />;
      case 'software': return <Box size={22} />;
      default: return <Database size={22} />;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-12">
        <div>
          <div className="flex items-center gap-3 text-yellow-600 mb-3">
             <Box size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inventory Matrix active</span>
          </div>
          <h1 className="text-5xl font-display font-black text-gray-900 tracking-tighter leading-none mb-3">Resource Vault</h1>
          <p className="text-gray-500 text-sm font-medium">Registry of hardware nodes, license keys, and infrastructure deployments.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-yellow-100/20"
        >
           <Plus size={18} className="text-yellow-400" /> Register Asset
        </button>
      </header>

      {resources.length === 0 ? (
        <div className="p-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/20 flex flex-col items-center">
           <Cpu size={64} className="text-gray-100 mb-8" />
           <h3 className="text-2xl font-black text-gray-300 tracking-tighter uppercase mb-4">No Inventory Nodes</h3>
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-sm leading-relaxed">Establish your resource matrix by registering your hardware and software assets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
           {resources.map(item => (
              <div key={item.id} className="card-professional p-10 flex flex-col gap-8 group rounded-[2.5rem] hover:translate-y-[-8px] transition-all">
                 <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-all shadow-2xl border-2 border-white">
                    {getIcon(item.type)}
                 </div>
                 <div>
                    <h4 className="text-[18px] font-black text-gray-900 tracking-tighter leading-none mb-3 truncate">{item.name}</h4>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">{item.type}</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {item.status}
                    </span>
                    <button onClick={() => deleteResource(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all"><Trash2 size={18}/></button>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* Asset Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl border border-white/20 overflow-hidden">
              <form onSubmit={handleAdd}>
                <div className="p-12 bg-gray-900 text-white flex justify-between items-center">
                   <div>
                     <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">Register Asset</h3>
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Inventory matrix authorization</p>
                   </div>
                   <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={32}/></button>
                </div>
                <div className="p-12 space-y-8">
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Asset Identifier</label>
                      <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. GPU Workstation 01" />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Resource Type</label>
                        <select className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-xs font-black uppercase" value={type} onChange={e => setType(e.target.value as any)}>
                           <option value="software">Software</option>
                           <option value="hardware">Hardware</option>
                           <option value="infrastructure">Infrastructure</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Current Status</label>
                        <select className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-xs font-black uppercase" value={status} onChange={e => setStatus(e.target.value as any)}>
                           <option value="active">Active</option>
                           <option value="maintenance">Maintenance</option>
                           <option value="expired">Expired</option>
                        </select>
                      </div>
                   </div>
                </div>
                <div className="p-12 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-6">
                   <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 font-black uppercase text-xs">Abort</button>
                   <button type="submit" className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all">Establish Node</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesView;
