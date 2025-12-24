import React, { useState } from 'react';
import { Users, Plus, X, Phone, Mail, Trash2, Building2 } from 'lucide-react';
import { GlassCard, GlassPanel, GlassModal, GlassButton, GlassInput, GlassBadge } from './ui/LiquidGlass.tsx';
import { ViewState } from '../types.ts';

interface Contact {
   id: string;
   name: string;
   role: string;
   company: string;
   email: string;
   phone: string;
   status: 'lead' | 'active' | 'inactive';
}

const CRMView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
   const [contacts, setContacts] = useState<Contact[]>([
      { id: '1', name: 'Alice Chen', role: 'CEO', company: 'TechCorp', email: 'alice@tech.com', phone: '+1 555-0101', status: 'active' },
      { id: '2', name: 'Bob Smith', role: 'CTO', company: 'DevStudio', email: 'bob@dev.com', phone: '+1 555-0102', status: 'lead' },
      { id: '3', name: 'Carol White', role: 'Designer', company: 'DesignLab', email: 'carol@design.com', phone: '+1 555-0103', status: 'active' },
   ]);

   const [showModal, setShowModal] = useState(false);
   const [newContact, setNewContact] = useState({ name: '', role: '', company: '', email: '', phone: '', status: 'lead' as const });

   const handleAddContact = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newContact.name) return;
      setContacts([...contacts, { id: Date.now().toString(), ...newContact }]);
      setNewContact({ name: '', role: '', company: '', email: '', phone: '', status: 'lead' });
      setShowModal(false);
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'active': return 'success';
         case 'lead': return 'warning';
         default: return 'default';
      }
   };

   const stats = {
      total: contacts.length,
      active: contacts.filter(c => c.status === 'active').length,
      leads: contacts.filter(c => c.status === 'lead').length,
   };

   return (
      <div className="space-y-8 animate-fade-in pb-20">
         {/* Header */}
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 text-cyan-400 mb-3">
                  <Users size={18} />
                  <span className="text-xs font-semibold uppercase tracking-widest">Relationship Manager</span>
               </div>
               <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Directory</h1>
               <p className="text-white/50 text-sm">Manage contacts, clients, and stakeholders.</p>
            </div>

            <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
               <Plus size={18} /> Add Contact
            </GlassButton>
         </header>

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
               <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                     style={{ boxShadow: '0 8px 32px rgba(34, 211, 238, 0.3)' }}>
                     <Users size={22} className="text-cyan-400" />
                  </div>
                  <div>
                     <p className="text-3xl font-bold text-white">{stats.total}</p>
                     <p className="text-sm text-white/50">Total Contacts</p>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="bg-gradient-to-br from-green-500/20 to-emerald-500/20">
               <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                     style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)' }}>
                     <Users size={22} className="text-green-400" />
                  </div>
                  <div>
                     <p className="text-3xl font-bold text-white">{stats.active}</p>
                     <p className="text-sm text-white/50">Active Clients</p>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="bg-gradient-to-br from-amber-500/20 to-orange-500/20">
               <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                     style={{ boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)' }}>
                     <Users size={22} className="text-amber-400" />
                  </div>
                  <div>
                     <p className="text-3xl font-bold text-white">{stats.leads}</p>
                     <p className="text-sm text-white/50">Leads</p>
                  </div>
               </div>
            </GlassCard>
         </div>

         {/* Contacts List */}
         <GlassPanel>
            <div className="p-6 border-b border-white/10">
               <h2 className="text-lg font-semibold text-white">All Contacts</h2>
            </div>
            <div className="divide-y divide-white/5">
               {contacts.length === 0 && (
                  <div className="p-12 text-center">
                     <Users size={48} className="mx-auto text-white/20 mb-4" />
                     <p className="text-white/40">No contacts yet</p>
                  </div>
               )}
               {contacts.map(contact => (
                  <div key={contact.id} className="p-5 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                     <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-lg font-semibold text-white">
                        {contact.name.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-medium text-white truncate">{contact.name}</h3>
                           <GlassBadge variant={getStatusColor(contact.status)}>
                              {contact.status}
                           </GlassBadge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                           <span className="flex items-center gap-1">
                              <Building2 size={12} /> {contact.company}
                           </span>
                           <span>{contact.role}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`mailto:${contact.email}`} className="p-2 text-white/40 hover:text-blue-400 transition-colors">
                           <Mail size={18} />
                        </a>
                        <a href={`tel:${contact.phone}`} className="p-2 text-white/40 hover:text-green-400 transition-colors">
                           <Phone size={18} />
                        </a>
                        <button
                           onClick={() => setContacts(contacts.filter(c => c.id !== contact.id))}
                           className="p-2 text-white/40 hover:text-red-400 transition-colors"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </GlassPanel>

         {/* Add Contact Modal */}
         {showModal && (
            <GlassModal onClose={() => setShowModal(false)}>
               <form onSubmit={handleAddContact}>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-bold text-white">Add Contact</h3>
                           <p className="text-sm text-white/50 mt-1">Add a new person to your directory</p>
                        </div>
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                           <X size={24} />
                        </button>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Name</label>
                           <GlassInput
                              value={newContact.name}
                              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                              placeholder="Full name"
                              autoFocus
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Company</label>
                           <GlassInput
                              value={newContact.company}
                              onChange={e => setNewContact({ ...newContact, company: e.target.value })}
                              placeholder="Company name"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Role</label>
                           <GlassInput
                              value={newContact.role}
                              onChange={e => setNewContact({ ...newContact, role: e.target.value })}
                              placeholder="Job title"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Email</label>
                           <GlassInput
                              type="email"
                              value={newContact.email}
                              onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                              placeholder="email@example.com"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Phone</label>
                           <GlassInput
                              value={newContact.phone}
                              onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                              placeholder="+1 555-0000"
                           />
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                        <GlassButton type="button" onClick={() => setShowModal(false)}>
                           Cancel
                        </GlassButton>
                        <GlassButton type="submit" variant="primary">
                           Add Contact
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
