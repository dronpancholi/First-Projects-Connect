
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
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      description: newDesc || 'Creative workspace strategy',
      status: ProjectStatus.IDEA,
      tags: tagArray
    });
    setNewTitle('');
    setNewDesc('');
    setNewTags('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-bold text-slate-900 tracking-tight leading-none">Your Registry</h1>
          <p className="text-slate-400 text-sm font-medium">Curating your active environments and studio workspaces.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-medium outline-none studio-shadow focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all w-80"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-2">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleFilter(tag)}
            className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
              activeFilters.includes(tag) 
                ? 'bg-slate-900 text-white shadow-xl' 
                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
            }`}
          >
            {tag}
          </button>
        ))}
        {activeFilters.length > 0 && (
          <button onClick={() => setActiveFilters([])} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"><RotateCcw size={16}/></button>
        )}
      </div>

      {/* Modern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProjects.map(project => (
          <div 
            key={project.id}
            onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
            className="group flex flex-col h-[420px] cursor-pointer relative overflow-hidden rounded-[3rem] bg-white studio-shadow studio-shadow-hover transition-all"
          >
            <div className="p-10 pb-4 flex justify-between items-start">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                project.status === ProjectStatus.ACTIVE 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                {project.status}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); if(confirm('Delete workspace?')) deleteProject(project.id); }}
                className="p-2 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="px-10 py-6 flex-1">
               <h3 className="text-2xl font-display font-bold text-slate-900 group-hover:text-emerald-500 transition-colors tracking-tight leading-tight mb-4">
                 {project.title}
               </h3>
               <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-medium">
                 {project.description}
               </p>
            </div>

            <div className="px-10 pb-10 mt-auto">
               <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-lg">
                      {tag}
                    </span>
                  ))}
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4 flex-1">
                   <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${project.progress}%` }} />
                   </div>
                   <span className="text-xs font-bold text-slate-900">{project.progress}%</span>
                 </div>
                 <ChevronRight size={20} className="ml-4 text-slate-200 group-hover:text-slate-900 transition-all" />
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 hover:text-emerald-500 transition-all h-[420px] gap-6 group btn-tactile"
        >
          <div className="w-16 h-16 rounded-3xl bg-white studio-shadow flex items-center justify-center group-hover:scale-110 transition-all">
            <Plus size={32} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Add Workspace</span>
        </button>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl p-12 transform transition-all border border-white/20">
            <div className="flex justify-between items-start mb-10">
              <h3 className="font-bold text-3xl text-slate-900 tracking-tight leading-none">New Workspace</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={32}/></button>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Workspace Identity</label>
                <input 
                  autoFocus
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:border-emerald-500 focus:bg-white outline-none transition-all text-lg font-bold tracking-tight"
                  placeholder="e.g. Q4 Growth Roadmap"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mission Strategy</label>
                <textarea 
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:border-emerald-500 focus:bg-white outline-none transition-all h-32 resize-none text-sm font-medium leading-relaxed"
                  placeholder="What is the objective of this studio space?"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-12 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">Cancel</button>
              <button 
                onClick={handleCreate} 
                disabled={!newTitle.trim()} 
                className="px-12 py-5 bg-slate-900 text-white font-bold rounded-[2rem] text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
              >
                Create Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
