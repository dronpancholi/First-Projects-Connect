
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, ProjectStatus } from '../types.ts';
import { Plus, Calendar, X, Folder, Trash2, ArrowRight, LayoutGrid, MoreVertical, Search, Filter } from 'lucide-react';

interface ProjectListProps {
  setView: (view: ViewState) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ setView }) => {
  const { projects, addProject, deleteProject } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await addProject({
      title: newTitle,
      description: newDesc || 'Mission critical infrastructure',
      status: ProjectStatus.IDEA,
      tags: []
    });
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
             <div className="h-px w-8 bg-indigo-600" />
             <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em]">Infrastructure</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Project Registry</h1>
          <p className="text-slate-500 font-medium text-sm">Strategic workspaces for mission execution and data synthesis.</p>
        </div>
        
        <div className="flex gap-3">
           <div className="hidden sm:flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button className="p-2.5 bg-white text-slate-900 rounded-xl shadow-sm"><LayoutGrid size={18}/></button>
              <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors"><Search size={18}/></button>
              <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors"><Filter size={18}/></button>
           </div>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 btn-tactile"
          >
            <Plus size={20} />
            Initialize Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {projects.map(project => (
          <div 
            key={project.id}
            onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
            className="pro-card p-10 rounded-[3rem] group flex flex-col h-[380px] cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                project.status === ProjectStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                project.status === ProjectStatus.IDEA ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                'bg-slate-50 text-slate-500 border-slate-100'
              }`}>
                {project.status}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); if(confirm('Permanently delete node?')) deleteProject(project.id); }}
                className="p-2.5 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 btn-tactile"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
               <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tighter leading-tight line-clamp-2">{project.title}</h3>
               <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">{project.description}</p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
               <div className="flex justify-between items-end">
                 <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Operational Throughput</span>
                   <span className="text-xl font-black text-slate-900 tracking-tighter">{project.progress}%</span>
                 </div>
                 <div className="flex -space-x-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">AI</div>
                    ))}
                 </div>
               </div>
               
               <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-slate-100 shadow-inner">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ${project.progress === 100 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.3)]'}`} 
                   style={{ width: `${project.progress}%` }}
                 ></div>
               </div>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                   <Calendar size={14} />
                   <span>Init {new Date(project.createdAt).toLocaleDateString()}</span>
                 </div>
                 <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all h-[380px] gap-6 group btn-tactile"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-indigo-100 transition-all border border-slate-100 shadow-inner">
            <Plus size={36} />
          </div>
          <div className="text-center">
            <span className="block font-black text-xs uppercase tracking-[0.3em] mb-1">Initialize Node</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Deploy new workspace</span>
          </div>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[200] p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
            <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tighter leading-none mb-1">Workspace Deployment</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialize a new mission critical node</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors btn-tactile">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-12 space-y-10">
              <div className="space-y-4">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Workspace Title</label>
                <input 
                  autoFocus
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all text-lg font-black tracking-tight placeholder:text-slate-300"
                  placeholder="Universal Neural Interface"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Core Objectives</label>
                <textarea 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all h-40 resize-none text-base font-medium leading-relaxed placeholder:text-slate-300"
                  placeholder="Define mission objectives and strategic parameters..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="px-12 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-6">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-400 font-black hover:text-slate-900 transition-colors text-xs uppercase tracking-widest btn-tactile">Cancel</button>
              <button onClick={handleCreate} disabled={!newTitle.trim()} className="px-12 py-4 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 disabled:opacity-50 btn-tactile">Initialize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
