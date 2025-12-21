
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import { 
  Users, Mail, UserPlus, Search, 
  MessageSquare, ExternalLink, ShieldCheck, 
  Globe, Phone, MoreVertical, Briefcase, Filter
} from 'lucide-react';

const CRMView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects } = useStore();

  const stakeholders = [
    { id: '1', name: 'John Devlin', role: 'CTO', company: 'Nova Systems', email: 'j.devlin@nova.io', status: 'Active' },
    { id: '2', name: 'Sarah Chen', role: 'Lead Architect', company: 'Quantum Labs', email: 's.chen@quantum.com', status: 'External' },
    { id: '3', name: 'Markus Weber', role: 'Director', company: 'Web3 Core', email: 'm.weber@web3.de', status: 'Strategic' },
    { id: '4', name: 'Anya Rossi', role: 'Project Manager', company: 'Solaris', email: 'a.rossi@solaris.it', status: 'Client' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <Users size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">CRM Module v2.0</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tighter leading-none mb-2">Stakeholder Hub</h1>
          <p className="text-gray-500 text-sm font-medium">Manage project collaborators, stakeholders, and strategic partners.</p>
        </div>
        
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all">
             <Filter size={14} /> Segment
          </button>
           <button 
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
             <UserPlus size={16} /> Register Identity
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stakeholders.map(person => (
           <div key={person.id} className="card-professional p-8 flex flex-col items-center text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-xl font-bold shadow-inner">
                   {person.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-1">{person.name}</h3>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">{person.role}</p>
              
              <div className="w-full flex flex-col gap-3 py-4 border-t border-gray-50">
                 <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                    <Briefcase size={12} className="text-gray-300" /> {person.company}
                 </div>
                 <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                    <Mail size={12} className="text-gray-300" /> {person.email}
                 </div>
              </div>

              <div className="flex gap-2 mt-4">
                 <button className="p-2.5 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <MessageSquare size={16} />
                 </button>
                 <button className="p-2.5 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Phone size={16} />
                 </button>
                 <button className="p-2.5 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <ExternalLink size={16} />
                 </button>
              </div>
           </div>
        ))}
      </div>

      {/* Stakeholder Analytics */}
      <section className="bg-gray-50 rounded-2xl p-10 border border-gray-100">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4">
               <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Contacts</h4>
               <p className="text-3xl font-display font-bold text-gray-900 tracking-tighter">128</p>
               <p className="text-[10px] text-gray-500 font-medium">Synced from professional registries.</p>
            </div>
            <div className="space-y-4">
               <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Collaborator Health</h4>
               <p className="text-3xl font-display font-bold text-gray-900 tracking-tighter">92%</p>
               <p className="text-[10px] text-gray-500 font-medium">Active engagement score across nodes.</p>
            </div>
            <div className="space-y-4">
               <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Geographic Spread</h4>
               <div className="flex gap-2">
                  <span className="text-[9px] font-bold px-2 py-1 bg-white rounded border border-gray-200">US</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-white rounded border border-gray-200">EU</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-white rounded border border-gray-200">ASIA</span>
               </div>
               <p className="text-[10px] text-gray-500 font-medium mt-2">Global distribution system.</p>
            </div>
         </div>
      </section>
    </div>
  );
};

export default CRMView;
