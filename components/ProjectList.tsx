
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, ProjectStatus } from '../types.ts';
import { Plus, Calendar, X, Folder, Trash2, ArrowRight, LayoutGrid, Search, Filter, Layers, Database } from 'lucide-react';

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
      description: newDesc || 'System-level operational node',
      status: ProjectStatus.IDEA,
      tags: []
    });
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
             <Database size={14} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Node Registry</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tighter leading-none">Project Infrastructure</h1>
          <p className="text-slate-500 text-[13px] font-medium">Full-fidelity workspace management system.</p>
        </div>
        
        <div className="flex gap-2">
           <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
              <button className="p-2 text-slate-400 hover:text-indigo-600"><LayoutGrid size={16}/></button>
              <button className="p-2 text-slate-400 hover:text-indigo-600"><Search size={16}/></button>
              <button className="p-2 text-slate-400 hover:text-indigo-600"><Filter size={16}/></button>
           </div>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
          >
            <Plus size={16} /> Deploy Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div 
            key={project.id}
            onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
            className="card-system group flex flex-col h-[300px] cursor-pointer relative overflow-hidden"
          >
            <div className="p-6 pb-0 flex justify-between items-start">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                project.status === ProjectStatus.ACTIVE ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                {project.status}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); if(confirm('Purge node data?')) deleteProject(project.id); }}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="p-6 pt-4 flex-1">
               <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-2 leading-snug">{project.title}</h3>
               <p className="text-[12px] text-slate-500 mt-2 font-medium line-clamp-3 leading-relaxed">{project.description}</p>
            </div>
            
            <div className="p-6 pt-0 border-t border-slate-50 mt-auto">
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Health</span>
                   <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900 tracking-tighter">{project.progress}%</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   </div>
                 </div>
                 <div className="text-[9px] font-mono font-bold text-slate-300">
                    ID: {project.id.slice(0, 8)}
                 </div>
               </div>
               
               <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                 <div 
                   className="h-full bg-indigo-600 transition-all duration-1000" 
                   style={{ width: `${project.progress}%` }}
                 ></div>
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all h-[300px] gap-4 group"
        >
          <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100">
            <Plus size={24} />
          </div>
          <div className="text-center">
            <span className="block font-black text-[10px] uppercase tracking-[0.2em]">Deploy Node</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">New System Infrastructure</span>
          </div>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200">
            <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} className="text-indigo-600" /> Initialize Node
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Designation</label>
                <input 
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold tracking-tight"
                  placeholder="System Interface Name"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Parameters</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all h-32 resize-none text-sm font-medium leading-relaxed"
                  placeholder="Define strategic objectives..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">Abort</button>
              <button onClick={handleCreate} disabled={!newTitle.trim()} className="px-8 py-2.5 bg-indigo-600 text-white font-black rounded-lg text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50">Deploy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
