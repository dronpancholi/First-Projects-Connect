
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, ProjectStatus } from '../types.ts';
import { Plus, Calendar, X, Folder, Trash2 } from 'lucide-react';

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
      description: newDesc || 'No description',
      status: ProjectStatus.IDEA,
      tags: []
    });
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-12 max-w-7xl mx-auto h-full">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Projects</h1>
          <p className="text-slate-500 mt-2 font-medium">Strategic workspaces and mission hubs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={18} />
          New Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <div 
            key={project.id}
            onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
            className="pro-card p-8 rounded-3xl group flex flex-col h-72 cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                project.status === ProjectStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                project.status === ProjectStatus.IDEA ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                'bg-slate-50 text-slate-500 border-slate-100'
              }`}>
                {project.status}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors tracking-tight">{project.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-3 mb-auto leading-relaxed font-medium">{project.description}</p>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
               <div className="flex justify-between text-[10px] text-slate-400 mb-3 font-black uppercase tracking-widest">
                 <span>Operational Status</span>
                 <span className="text-slate-900">{project.progress}%</span>
               </div>
               <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden border border-slate-100">
                 <div 
                   className={`h-full rounded-full transition-all duration-700 ${project.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]'}`} 
                   style={{ width: `${project.progress}%` }}
                 ></div>
               </div>
               <div className="flex items-center gap-2 mt-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                 <Calendar size={12} />
                 <span>Initialized {new Date(project.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all h-72 gap-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all border border-slate-100">
            <Plus size={28} />
          </div>
          <span className="font-bold text-xs uppercase tracking-[0.2em]">Deploy New Workspace</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-lg text-slate-900 uppercase tracking-tighter">Workspace Deployment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Title</label>
                <input 
                  autoFocus
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold"
                  placeholder="Universal Interface Engine"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</label>
                <textarea 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all h-32 resize-none text-sm font-medium leading-relaxed"
                  placeholder="Core objectives and strategic goals..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-900 transition-colors text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleCreate} disabled={!newTitle.trim()} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50">Initialize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
