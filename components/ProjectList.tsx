import React from 'react';
import { useStore } from '../context/StoreContext';
import { ViewState, ProjectStatus } from '../types';
import { Plus, MoreVertical, Calendar } from 'lucide-react';

interface ProjectListProps {
  setView: (view: ViewState) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ setView }) => {
  const { projects, addProject } = useStore();

  const handleCreate = () => {
    // Simple alert for V1, usually this would be a modal
    const title = prompt("Project Title:");
    if (title) {
      addProject({
        title,
        description: 'New Project',
        status: ProjectStatus.IDEA,
        tags: []
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-apple-text tracking-tight">Projects</h1>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
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
            className="bg-white group rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex flex-col h-64"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                project.status === ProjectStatus.ACTIVE ? 'bg-green-100 text-green-700' : 
                project.status === ProjectStatus.IDEA ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {project.status}
              </span>
              <button className="text-gray-400 hover:text-black">
                <MoreVertical size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{project.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-3 mb-auto">{project.description}</p>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
               <div className="flex justify-between text-xs text-gray-500 mb-2">
                 <span>Progress</span>
                 <span>{project.progress}%</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-black h-full rounded-full" style={{ width: `${project.progress}%` }}></div>
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
          onClick={handleCreate}
          className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all h-64"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Plus size={24} />
          </div>
          <span className="font-medium">Create New Project</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectList;
