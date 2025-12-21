
import React from 'react';
import { ViewState } from '../types.ts';
import { 
  Box, Cpu, Globe, Cloud, ShieldCheck, 
  Settings, Zap, Monitor, HardDrive, 
  Key, RefreshCw, AlertTriangle, Plus, Search
} from 'lucide-react';

const ResourcesView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const inventory = [
    { id: '1', name: 'Workstation Node A', type: 'Hardware', status: 'Operational', cost: '$4,200', icon: <Monitor size={18} /> },
    { id: '2', name: 'AWS Cloud Instance', type: 'Infrastructure', status: 'Active', cost: '$120/mo', icon: <Cloud size={18} /> },
    { id: '3', name: 'Adobe Design Suite', type: 'Software', status: 'License Active', cost: '$59/mo', icon: <Box size={18} /> },
    { id: '4', name: 'System SSH Keys', type: 'Security', status: 'Verified', cost: '-', icon: <Key size={18} /> },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <Box size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Resource Matrix v1.0</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tighter leading-none mb-2">Inventory Matrix</h1>
          <p className="text-gray-500 text-sm font-medium">Full-fidelity registry of hardware, software, and infrastructure assets.</p>
        </div>
        
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
           <Plus size={16} /> Add Asset
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {inventory.map(item => (
            <div key={item.id} className="card-professional p-8 flex flex-col gap-6 group hover:border-indigo-100">
               <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  {item.icon}
               </div>
               <div>
                  <h4 className="text-[15px] font-bold text-gray-900 tracking-tight leading-none mb-2">{item.name}</h4>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{item.type}</span>
                     <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">| {item.cost}</span>
                  </div>
               </div>
               <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {item.status}
                  </span>
                  <button className="text-gray-300 hover:text-black transition-colors"><Settings size={14}/></button>
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8">
            <section className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
               <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Lifecycle Alerts</h2>
               </div>
               <div className="p-8 flex flex-col items-center justify-center py-20 bg-slate-50/30">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50 mb-6">
                     <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No maintenance required</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-black">All resource nodes are operational</p>
               </div>
            </section>
         </div>

         <div className="lg:col-span-4">
            <section className="card-professional p-8">
               <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Cpu size={14} /> Global Distribution
               </h3>
               <div className="space-y-4">
                  {[
                    { label: 'Local Hardware', value: '14%' },
                    { label: 'Cloud Resources', value: '72%' },
                    { label: 'Software Licenses', value: '14%' },
                  ].map(row => (
                    <div key={row.label} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          <span>{row.label}</span>
                          <span>{row.value}</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: row.value }} />
                       </div>
                    </div>
                  ))}
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

export default ResourcesView;
