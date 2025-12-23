
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import { 
  Users, Mail, UserPlus, Search, 
  MessageSquare, ExternalLink, ShieldCheck, 
  Globe, Phone, MoreVertical, Briefcase, Filter, X, Trash2
} from 'lucide-react';

const CRMView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { stakeholders, addStakeholder, deleteStakeholder, projects } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    await addStakeholder({ name, role, email, company } as any);
    setName(''); setRole(''); setEmail(''); setCompany('');
    setShowModal(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-12">
        <div>
          <div className="flex items-center gap-3 text-yellow-600 mb-3">
             <Users size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Network CRM Active</span>
          </div>
          <h1 className="text-5xl font-display font-black text-gray-900 tracking-tighter leading-none mb-3">Identity Registry</h1>
          <p className="text-gray-500 text-sm font-medium">Professional stakeholder database and collaborator network.</p>
        </div>
        
        <div className="flex gap-4">
           <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-yellow-100/20"
          >
             <UserPlus size={18} className="text-yellow-400" /> Register Stakeholder
          </button>
        </div>
      </header>

      {stakeholders.length === 0 ? (
        <div className="p-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/20 flex flex-col items-center">
           <Users size={64} className="text-gray-100 mb-8" />
           <h3 className="text-2xl font-black text-gray-300 tracking-tighter uppercase mb-4">No Registered Identities</h3>
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-sm leading-relaxed">Populate your professional network by registering collaborators and project stakeholders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stakeholders.map(person => (
             <div key={person.id} className="card-professional p-10 flex flex-col items-center text-center group rounded-[2.5rem]">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-gray-900 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-all text-2xl font-black shadow-2xl border-4 border-white">
                     {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-lg" />
                </div>
                <h3 className="text-[18px] font-black text-gray-900 tracking-tight leading-none mb-2">{person.name}</h3>
                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-6">{person.role}</p>
                
                <div className="w-full space-y-3 py-6 border-t border-gray-50">
                   <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-gray-500">
                      <Briefcase size={14} className="text-gray-200" /> {person.company || 'Independent'}
                   </div>
                   <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-gray-500 truncate">
                      <Mail size={14} className="text-gray-200" /> {person.email}
                   </div>
                </div>

                <div className="flex gap-3 mt-6">
                   <button onClick={() => deleteStakeholder(person.id)} className="p-3 rounded-xl bg-gray-50 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                      <Trash2 size={18} />
                   </button>
                   <button className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                      Profile
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl border border-white/20 overflow-hidden">
              <form onSubmit={handleAdd}>
                <div className="p-12 bg-gray-900 text-white flex justify-between items-center">
                   <div>
                     <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">Register Identity</h3>
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Ecosystem stakeholder authorization</p>
                   </div>
                   <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={32}/></button>
                </div>
                <div className="p-12 space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                        <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Function</label>
                        <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Lead Engineer" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Primary Contact (Email)</label>
                      <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="identity@node.io" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Organization</label>
                      <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Nova Systems" />
                   </div>
                </div>
                <div className="p-12 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-6">
                   <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 font-black uppercase text-xs">Abort</button>
                   <button type="submit" className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all">Confirm Registry</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CRMView;
