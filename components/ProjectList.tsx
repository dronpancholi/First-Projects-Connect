import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, ProjectStatus } from '../types.ts';
import {
  Plus, X, Trash2, Search, ChevronRight, RotateCcw, FolderOpen
} from 'lucide-react';
import { GlassCard, GlassModal, GlassButton, GlassInput, GlassTextarea, GlassBadge } from './ui/LiquidGlass.tsx';

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
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workspaces</h1>
          <p className="text-gray-500 text-sm">Manage your active environments and projects.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="pl-11 pr-4 py-3 glass-input w-72"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <GlassButton variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> New Workspace
          </GlassButton>
        </div>
      </div>

      {/* Filter Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleFilter(tag)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${activeFilters.includes(tag)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'glass-button'
                }`}
            >
              {tag}
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      )}

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <GlassCard
            key={project.id}
            onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
            className="cursor-pointer group"
          >
            <div className="p-6 flex flex-col h-full">
              {/* Status & Actions */}
              <div className="flex justify-between items-start mb-4">
                <GlassBadge
                  variant={project.status === ProjectStatus.ACTIVE ? 'success' : 'default'}
                >
                  {project.status}
                </GlassBadge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete workspace?')) deleteProject(project.id);
                  }}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <FolderOpen size={18} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100/50">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] font-medium uppercase tracking-wider px-2 py-1 bg-gray-100/80 text-gray-500 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{project.progress}%</span>
                  </div>
                  <ChevronRight size={18} className="ml-3 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            </div>
          </GlassCard>
        ))}

        {/* Add New Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-card-subtle border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all min-h-[280px] group"
        >
          <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={28} />
          </div>
          <span className="text-sm font-medium">Add Workspace</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && projects.length > 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No workspaces match your search.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilters([]); }}
            className="text-sm text-blue-600 font-medium mt-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <GlassModal onClose={() => setIsModalOpen(false)}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">New Workspace</h3>
                <p className="text-sm text-gray-500 mt-1">Create a new project workspace</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
                <GlassInput
                  autoFocus
                  placeholder="e.g. Q4 Growth Roadmap"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                <GlassTextarea
                  placeholder="What is the objective of this workspace?"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tags (comma separated)</label>
                <GlassInput
                  placeholder="e.g. marketing, growth, Q4"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <GlassButton onClick={() => setIsModalOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleCreate}
                disabled={!newTitle.trim()}
              >
                Create Workspace
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};

export default ProjectList;
