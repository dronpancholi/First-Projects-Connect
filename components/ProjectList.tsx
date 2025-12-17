
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, ProjectStatus } from '../types.ts';
import { Plus, MoreVertical, Calendar, X, Folder, Trash2 } from 'lucide-react';

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

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the project "${title}"? This cannot be undone.`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-apple-text tracking-tight">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your active workspaces.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity shadow-sm"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div 
            key={project.id}
            onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
            className="bg-white group rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col h-64 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                project.status === ProjectStatus.ACTIVE ? 'bg-green-100 text-green-700' : 
                project.status === ProjectStatus.IDEA ? 'bg-yellow-100 text-yellow-700' : 
                project.status === ProjectStatus.COMPLETED ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {project.status}
              </span>
              <button 
                onClick={(e) => handleDelete(e, project.id, project.title)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Delete Project"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{project.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-3 mb-auto">{project.description}</p>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
               <div className="flex justify-between text-xs text-gray-500 mb-2">
                 <span className="font-medium">Progress</span>
                 <span>{project.progress}%</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-green-500' : 'bg-black'}`} 
                   style={{ width: `${project.progress}%` }}
                 ></div>
               </div>
               <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                 <Calendar size={12} />
                 <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
          </div>
        ))}

        {/* Create Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all h-64 gap-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <Plus size={24} />
          </div>
          <span className="font-medium text-sm">Create New Project</span>
        </button>
      </div>
      
      {projects.length === 0 && (
         <div className="text-center mt-12 text-gray-400 text-sm">
            <Folder className="mx-auto mb-2 opacity-20" size={48} />
            <p>No projects yet. Start building your legacy.</p>
         </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">New Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Project Title</label>
                <input 
                  autoFocus
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="e.g. Portfolio Redesign"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all h-24 resize-none"
                  placeholder="What is this project about?"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
