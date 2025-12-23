
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, ProjectStatus } from '../types.ts';
import { 
  Plus, X, Briefcase, Trash2, ArrowRight, LayoutGrid, 
  Search, Filter, Layers, Database, ChevronRight, Tag,
  Hash, RotateCcw
} from 'lucide-react';

interface ProjectListProps {
  setView: (view: ViewState) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ setView }) => {
  const { projects, addProject, deleteProject } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');
  
  // Filtering State
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = activeFilters.length === 0 || 
                         activeFilters.some(filter => p.tags?.includes(filter));
      
      return matchesSearch && matchesTags;
    });
  }, [projects, searchQuery, activeFilters]);

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const tagArray = newTags.split(',').map(t => t.trim()).filter(t => t !== '');
    await addProject({
      title: newTitle,
      description: newDesc || 'Executive workspace node',
      status: ProjectStatus.IDEA,
      tags: tagArray
    });
    setNewTitle('');
    setNewDesc('');
    setNewTags('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <Database size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Workspace Registry</span>
          </div>
          <h1 className="text-5xl font-display font-black text-gray-900 tracking-tighter leading-none italic">
            Global <span className="text-indigo-600">Ecosystem</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Orchestration layer for all professional operational nodes.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                className="pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all w-72 shadow-inner"
                placeholder="Search index..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-100/20"
          >
            <Plus size={18} className="text-indigo-400" /> New Workspace
          </button>
        </div>
      </div>

      {/* Neural Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-gray-200 mr-2">
           <Filter size={14} className="text-gray-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Filters</span>
        </div>
        
        {allTags.length === 0 && (
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">No tags registered in neural network</span>
        )}

        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleFilter(tag)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              activeFilters.includes(tag) 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-400'
            }`}
          >
            {tag}
          </button>
        ))}

        {activeFilters.length > 0 && (
          <button 
            onClick={() => setActiveFilters([])}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <RotateCcw size={14} /> Reset Signal
          </button>
        )}
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-40 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-6">
                <Hash size={40} />
             </div>
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300">No projects match the current filter query</p>
          </div>
        )}

        {filteredProjects.map(project => (
          <div 
            key={project.id}
            onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
            className="card-professional group flex flex-col h-[380px] cursor-pointer relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all"
          >
            <div className="p-8 pb-4 flex justify-between items-start">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                project.status === ProjectStatus.ACTIVE 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                  : 'bg-gray-50 text-gray-400 border-gray-100'
              }`}>
                {project.status}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); if(confirm('Purge workspace data?')) deleteProject(project.id); }}
                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="p-8 flex-1 flex flex-col gap-4">
               <h3 className="text-2xl font-display font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-2 leading-tight">
                 {project.title}
               </h3>
               <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
                 {project.description}
               </p>
               
               {/* Project Tags */}
               <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags?.map(tag => (
                    <button 
                      key={tag}
                      onClick={(e) => { e.stopPropagation(); toggleFilter(tag); }}
                      className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                        activeFilters.includes(tag)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="p-8 pt-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
               <div className="flex items-center gap-6">
                 <div className="flex flex-col">
                   <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Operational Sync</span>
                   <span className="text-xl font-black text-gray-900">{project.progress}%</span>
                 </div>
                 <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${project.progress}%` }} />
                 </div>
               </div>
               <div className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                  <ChevronRight size={20} />
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-300 hover:border-indigo-600 hover:bg-indigo-50/30 hover:text-indigo-600 transition-all h-[380px] gap-6 group"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-white border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl transition-all shadow-sm">
            <Plus size={32} />
          </div>
          <div className="text-center">
            <span className="block font-black text-xs uppercase tracking-[0.4em]">Initialize Workspace Node</span>
          </div>
        </button>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl border border-white/20 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-black text-2xl text-gray-900 tracking-tighter uppercase flex items-center gap-4">
                <Layers size={24} className="text-indigo-600" /> New Node Authorization
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors p-2">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Node Identifier</label>
                <input 
                  autoFocus
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all text-lg font-black tracking-tight"
                  placeholder="e.g. Project Orion Strategy"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Strategic Objective</label>
                <textarea 
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all h-32 resize-none text-sm font-medium leading-relaxed"
                  placeholder="Summarize the primary mission constraints..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Neural Tags (Separated by Commas)</label>
                <div className="relative">
                  <Tag size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input 
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all text-sm font-black uppercase tracking-widest"
                    placeholder="FINANCE, CORE, AUDIT..."
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-6">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-black transition-colors">Abort</button>
              <button 
                onClick={handleCreate} 
                disabled={!newTitle.trim()} 
                className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-xl shadow-indigo-100/20"
              >
                Establish Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
