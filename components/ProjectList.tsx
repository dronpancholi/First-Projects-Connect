import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, ProjectStatus } from '../types.ts';
import { Briefcase, Plus, ArrowRight, X, FolderOpen } from 'lucide-react';
import { GlassCard, GlassModal, GlassButton, GlassInput, GlassTextarea, GlassBadge, GlassProgressBar } from './ui/LiquidGlass.tsx';
import { Skeleton } from './ui/Skeleton.tsx';
import { EmptyState } from './ui/EmptyState.tsx';

interface ProjectListProps {
  setView: (view: ViewState) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ setView }) => {
  const { projects, addProject, isLoading } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addProject({
      title,
      description,
      status: 'active',
      tags: []
    });
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-purple-600 mb-3">
            <Briefcase size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest">Workspace Hub</span>
          </div>
          <h1 className="text-4xl font-bold text-glass-primary tracking-tight mb-2">Projects</h1>
          <p className="text-glass-secondary text-sm">Organize and manage your creative workspaces.</p>
        </div>

        <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus size={18} /> New Workspace
        </GlassButton>
      </header>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton width={48} height={48} variant="rounded" />
                <Skeleton width={60} height={24} variant="rounded" />
              </div>
              <Skeleton width="70%" height={24} />
              <Skeleton width="100%" height={16} />
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                <Skeleton width={80} height={20} />
                <Skeleton width={20} height={20} variant="circular" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={FolderOpen}
            title="No Workspaces Yet"
            description="Start by creating your first workspace to organize tasks, notes, and assets."
            action={
              <GlassButton variant="primary" onClick={() => setShowModal(true)}>
                Create First Workspace
              </GlassButton>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <GlassCard
              key={project.id}
              onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
              className="cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)' }}>
                    <Briefcase size={20} className="text-purple-600" />
                  </div>
                  <GlassBadge variant={project.status === 'active' ? 'success' : 'default'}>
                    {project.status}
                  </GlassBadge>
                </div>

                <h3 className="text-lg font-semibold text-glass-primary mb-2 truncate">{project.title}</h3>
                <p className="text-sm text-glass-secondary mb-4 line-clamp-2">{project.description || 'No description'}</p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-glass-secondary">Progress</span>
                    <span className="text-glass-primary font-medium">{project.progress || 0}%</span>
                  </div>
                  <GlassProgressBar value={project.progress || 0} variant="gradient" />
                </div>

                <div className="mt-4 pt-4 border-t border-glass-border-subtle flex items-center justify-between">
                  <div className="flex gap-1">
                    {project.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs glass-badge">{tag}</span>
                    ))}
                  </div>
                  <ArrowRight size={16} className="text-glass-secondary group-hover:text-glass-primary transition-colors" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )
      }

      {/* Create Modal */}
      {
        showModal && (
          <GlassModal onClose={() => setShowModal(false)}>
            <form onSubmit={handleCreate}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-glass-primary">New Workspace</h3>
                    <p className="text-sm text-glass-secondary mt-1">Create a new project to get started</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-2 text-glass-muted hover:text-red-500 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Project Name</label>
                    <GlassInput
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Mobile App Redesign"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Description</label>
                    <GlassTextarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Brief description of your project..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <GlassButton type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" variant="primary">
                    Create Project
                  </GlassButton>
                </div>
              </div>
            </form>
          </GlassModal>
        )
      }
    </div >
  );
};

export default ProjectList;
