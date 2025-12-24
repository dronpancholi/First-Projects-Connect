import React, { useState } from 'react';
import { FolderOpen, Plus, X, ExternalLink, Trash2, Upload, Filter } from 'lucide-react';
import { GlassCard, GlassPanel, GlassModal, GlassButton, GlassInput, GlassSelect, GlassBadge } from './ui/LiquidGlass.tsx';
import { ViewState } from '../types.ts';

interface Resource {
   id: string;
   name: string;
   type: 'document' | 'image' | 'video' | 'link' | 'other';
   url: string;
   size: string;
   createdAt: string;
}

const ResourcesView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
   const [resources, setResources] = useState<Resource[]>([
      { id: '1', name: 'Brand Guidelines.pdf', type: 'document', url: '#', size: '2.4 MB', createdAt: '2024-01-15' },
      { id: '2', name: 'Logo Assets.zip', type: 'image', url: '#', size: '15.2 MB', createdAt: '2024-01-14' },
      { id: '3', name: 'Product Demo.mp4', type: 'video', url: '#', size: '128.5 MB', createdAt: '2024-01-12' },
      { id: '4', name: 'API Documentation', type: 'link', url: 'https://docs.example.com', size: '-', createdAt: '2024-01-10' },
   ]);

   const [showModal, setShowModal] = useState(false);
   const [filter, setFilter] = useState<string>('all');
   const [newResource, setNewResource] = useState({ name: '', type: 'link' as const, url: '' });

   const handleAddResource = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newResource.name || !newResource.url) return;
      setResources([...resources, {
         id: Date.now().toString(),
         ...newResource,
         size: '-',
         createdAt: new Date().toISOString().split('T')[0]
      }]);
      setNewResource({ name: '', type: 'link', url: '' });
      setShowModal(false);
   };

   const getTypeColor = (type: string) => {
      switch (type) {
         case 'document': return 'primary';
         case 'image': return 'success';
         case 'video': return 'warning';
         case 'link': return 'default';
         default: return 'default';
      }
   };

   const getTypeIcon = (type: string) => {
      switch (type) {
         case 'document': return '📄';
         case 'image': return '🖼️';
         case 'video': return '🎬';
         case 'link': return '🔗';
         default: return '📁';
      }
   };

   const filteredResources = filter === 'all'
      ? resources
      : resources.filter(r => r.type === filter);

   return (
      <div className="space-y-8 animate-fade-in pb-20">
         {/* Header */}
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 text-orange-400 mb-3">
                  <FolderOpen size={18} />
                  <span className="text-xs font-semibold uppercase tracking-widest">Asset Library</span>
               </div>
               <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Resources</h1>
               <p className="text-white/50 text-sm">Store and organize project assets.</p>
            </div>

            <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
               <Plus size={18} /> Add Resource
            </GlassButton>
         </header>

         {/* Filters */}
         <div className="flex items-center gap-3">
            <Filter size={16} className="text-white/40" />
            {['all', 'document', 'image', 'video', 'link'].map(type => (
               <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === type
                        ? 'glass-card bg-purple-500/20 text-white border-purple-500/50'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                     }`}
               >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
               </button>
            ))}
         </div>

         {/* Resources Grid */}
         {filteredResources.length === 0 ? (
            <div className="glass-card-subtle p-20 text-center rounded-3xl border-2 border-dashed border-white/10">
               <FolderOpen size={64} className="mx-auto text-white/20 mb-6" />
               <h3 className="text-xl font-semibold text-white/40 mb-3">No resources found</h3>
               <p className="text-sm text-white/30 mb-8 max-w-md mx-auto">
                  {filter !== 'all' ? 'Try a different filter or' : ''} Add your first resource to get started.
               </p>
               <GlassButton variant="primary" onClick={() => setShowModal(true)}>
                  Add Resource
               </GlassButton>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredResources.map(resource => (
                  <GlassCard key={resource.id} className="group">
                     <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                           <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-2xl">
                              {getTypeIcon(resource.type)}
                           </div>
                           <GlassBadge variant={getTypeColor(resource.type)}>
                              {resource.type}
                           </GlassBadge>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2 truncate">{resource.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                           <span>{resource.size}</span>
                           <span>{resource.createdAt}</span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                           <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                           >
                              <ExternalLink size={14} /> Open
                           </a>
                           <button
                              onClick={() => setResources(resources.filter(r => r.id !== resource.id))}
                              className="p-2 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
               <form onSubmit={handleAddResource}>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-bold text-white">Add Resource</h3>
                           <p className="text-sm text-white/50 mt-1">Link an external asset</p>
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
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Name</label>
                           <GlassInput
                              value={newResource.name}
                              onChange={e => setNewResource({ ...newResource, name: e.target.value })}
                              placeholder="Resource name"
                              autoFocus
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Type</label>
                           <select
                              className="glass-input cursor-pointer"
                              value={newResource.type}
                              onChange={e => setNewResource({ ...newResource, type: e.target.value as any })}
                           >
                              <option value="link">Link</option>
                              <option value="document">Document</option>
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                              <option value="other">Other</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-white/50 uppercase tracking-wider">URL</label>
                           <GlassInput
                              type="url"
                              value={newResource.url}
                              onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                              placeholder="https://..."
                           />
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
