
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, ProjectStatus } from '../types.ts';
import { Plus, X, Briefcase, Trash2, ArrowRight, LayoutGrid, Search, Filter, Layers, Database, ChevronRight } from 'lucide-react';

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
      description: newDesc || 'Executive workspace node',
      status: ProjectStatus.IDEA,
      tags: []
    });
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <Database size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Workspace Registry</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tighter leading-none">Your Ecosystem</h1>
          <p className="text-gray-500 text-sm font-medium">Manage and monitor all professional environments.</p>
        </div>
        
        <div className="flex gap-3">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg"
          >
            <Plus size={16} /> Create Workspace
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <div 
            key={project.id}
            onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
            className="card-professional group flex flex-col h-[280px] cursor-pointer relative overflow-hidden rounded-xl"
          >
            <div className="p-6 pb-2 flex justify-between items-start">
              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${
                project.status === ProjectStatus.ACTIVE ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                'bg-gray-50 text-gray-400 border-gray-100'
              }`}>
                {project.status}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); if(confirm('Purge workspace data?')) deleteProject(project.id); }}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="p-6 flex-1">
               <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-2 leading-tight mb-2">{project.title}</h3>
               <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-medium">{project.description}</p>
            </div>
            
            <div className="p-6 pt-4 border-t border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Progress</span>
                   <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
                 </div>
                 <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${project.progress}%` }} />
                 </div>
               </div>
               <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all">
                  <ChevronRight size={16} />
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-600 hover:bg-indigo-50/20 hover:text-indigo-600 transition-all h-[280px] gap-4 group"
        >
          <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-all">
            <Plus size={24} />
          </div>
          <div className="text-center">
            <span className="block font-bold text-[11px] uppercase tracking-widest">Initialize Workspace</span>
          </div>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} className="text-indigo-600" /> New Workspace
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workspace Name</label>
                <input 
                  autoFocus
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-indigo-600 outline-none transition-all text-sm font-bold"
                  placeholder="e.g. Q4 Strategy Development"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-indigo-600 outline-none transition-all h-28 resize-none text-sm font-medium leading-relaxed"
                  placeholder="Summarize objectives..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 font-bold text-[11px] uppercase tracking-widest hover:text-black">Cancel</button>
              <button onClick={handleCreate} disabled={!newTitle.trim()} className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-lg text-[11px] uppercase tracking-widest disabled:opacity-50">Initialize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
