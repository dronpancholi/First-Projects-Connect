import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import {
   Users, Mail, UserPlus, Briefcase, X, Trash2
} from 'lucide-react';
import { GlassCard, GlassModal, GlassButton, GlassInput } from './ui/LiquidGlass.tsx';

const CRMView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
   const { stakeholders, addStakeholder, deleteStakeholder } = useStore();
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
      <div className="space-y-8 animate-fade-in pb-20">
         {/* Header */}
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 text-purple-600 mb-2">
                  <Users size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Stakeholder Network</span>
               </div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Directory</h1>
               <p className="text-gray-500 text-sm mt-1">Manage your professional network and collaborators.</p>
            </div>

            <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
               <UserPlus size={16} /> Add Stakeholder
            </GlassButton>
         </header>

         {stakeholders.length === 0 ? (
            <div className="glass-card-subtle p-16 text-center rounded-3xl border-2 border-dashed">
               <Users size={48} className="mx-auto text-gray-200 mb-6" />
               <h3 className="text-lg font-semibold text-gray-400 mb-2">No stakeholders yet</h3>
               <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                  Build your professional network by adding collaborators and project stakeholders.
               </p>
               <GlassButton variant="primary" onClick={() => setShowModal(true)}>
                  Add First Stakeholder
               </GlassButton>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {stakeholders.map(person => (
                  <GlassCard key={person.id} className="group">
                     <div className="p-6 flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="relative mb-4">
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-105 transition-transform">
                              {person.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 mb-0.5">{person.name}</h3>
                        <p className="text-xs font-medium text-blue-600 mb-4">{person.role}</p>

                        <div className="w-full space-y-2 py-4 border-t border-gray-100/50 text-left">
                           <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Briefcase size={12} className="text-gray-300" />
                              <span className="truncate">{person.company || 'Independent'}</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail size={12} className="text-gray-300" />
                              <span className="truncate">{person.email}</span>
                           </div>
                        </div>

                        <div className="flex gap-2 mt-4 w-full">
                           <button
                              onClick={() => deleteStakeholder(person.id)}
                              className="p-2.5 rounded-xl glass-button border-transparent text-gray-300 hover:text-red-500 hover:bg-red-50"
                           >
                              <Trash2 size={16} />
                           </button>
                           <button className="flex-1 py-2.5 glass-button glass-button-primary text-xs font-medium rounded-xl">
                              View Profile
                           </button>
                        </div>
                     </div>
                  </GlassCard>
               ))}
            </div>
         )}

         {/* Add Modal */}
         {showModal && (
            <GlassModal onClose={() => setShowModal(false)}>
               <form onSubmit={handleAdd}>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-bold text-gray-900">Add Stakeholder</h3>
                           <p className="text-sm text-gray-500 mt-1">Register a new collaborator</p>
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
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                              <GlassInput
                                 type="text"
                                 value={name}
                                 onChange={e => setName(e.target.value)}
                                 placeholder="John Doe"
                                 autoFocus
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</label>
                              <GlassInput
                                 type="text"
                                 value={role}
                                 onChange={e => setRole(e.target.value)}
                                 placeholder="Lead Engineer"
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                           <GlassInput
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="email@example.com"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company</label>
                           <GlassInput
                              type="text"
                              value={company}
                              onChange={e => setCompany(e.target.value)}
                              placeholder="Acme Inc."
                           />
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                        <GlassButton type="button" onClick={() => setShowModal(false)}>
                           Cancel
                        </GlassButton>
                        <GlassButton type="submit" variant="primary">
                           Add Stakeholder
                        </GlassButton>
                     </div>
                  </div>
               </form>
            </GlassModal>
         )}
      </div>
   );
};

export default CRMView;
