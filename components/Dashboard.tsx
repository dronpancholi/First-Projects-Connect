import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import {
  Briefcase, CheckCircle2, FileText, TrendingUp,
  ArrowRight, Zap, Clock, Target
} from 'lucide-react';
import { GlassCard, GlassPanel, GlassButton, GlassBadge } from './ui/LiquidGlass.tsx';

interface DashboardProps {
  setView: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { projects, tasks, notes } = useStore();
  const activeTasks = tasks.filter(t => t.status !== 'Done').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-purple-400 mb-3">
            <Zap size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest">Command Center</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-white/50 text-sm">Your productivity overview at a glance.</p>
        </div>

        <GlassButton
          variant="primary"
          onClick={() => setView({ type: 'PROJECTS' })}
          className="flex items-center gap-2"
        >
          <Briefcase size={18} /> New Workspace <ArrowRight size={16} />
        </GlassButton>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="h-full">
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-500/20 shadow-lg shadow-purple-500/20 backdrop-blur-sm">
                <Briefcase size={22} className="text-purple-400" />
              </div>
              <GlassBadge variant="success">Active</GlassBadge>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">{projects.length}</p>
              <p className="text-sm text-white/50">Total Projects</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-full">
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/20 shadow-lg shadow-blue-500/20 backdrop-blur-sm">
                <Target size={22} className="text-blue-400" />
              </div>
              <GlassBadge variant="warning">{activeTasks} pending</GlassBadge>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">{tasks.length}</p>
              <p className="text-sm text-white/50">Total Tasks</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-full">
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/20 shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
                <CheckCircle2 size={22} className="text-green-400" />
              </div>
              <GlassBadge variant="success">+{completedTasks}</GlassBadge>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">{completionRate}%</p>
              <p className="text-sm text-white/50">Completion Rate</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-full">
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-pink-500/20 shadow-lg shadow-pink-500/20 backdrop-blur-sm">
                <FileText size={22} className="text-pink-400" />
              </div>
              <GlassBadge>Insights</GlassBadge>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">{notes.length}</p>
              <p className="text-sm text-white/50">Total Notes</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Projects & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <GlassPanel>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Recent Workspaces</h2>
              <GlassButton
                onClick={() => setView({ type: 'PROJECTS' })}
                className="flex items-center gap-1 px-3 py-2"
              >

                View All <ArrowRight size={14} />
              </GlassButton>
            </div>
            <div className="divide-y divide-white/5">
              {recentProjects.length === 0 && (
                <div className="p-12 text-center">
                  <Briefcase size={48} className="mx-auto text-white/20 mb-4" />
                  <p className="text-white/40">No projects yet. Create your first workspace!</p>
                </div>
              )}
              {recentProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
                  className="w-full p-5 flex items-center gap-4 hover:bg-white/5 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Briefcase size={20} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate mb-1">{project.title}</h3>
                    <p className="text-xs text-white/40 truncate">{project.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <GlassBadge variant={project.status === 'Active' ? 'success' : 'default'}>
                      {project.status}
                    </GlassBadge>
                    <ArrowRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <GlassPanel>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" /> Quick Actions
              </h3>
              <div className="space-y-3">
                <GlassButton
                  className="w-full justify-start gap-3"
                  onClick={() => setView({ type: 'PROJECTS' })}
                >
                  <Briefcase size={18} /> New Project
                </GlassButton>
                <GlassButton
                  className="w-full justify-start gap-3"
                  onClick={() => setView({ type: 'KANBAN' })}
                >
                  <Target size={18} /> View Tasks
                </GlassButton>
                <GlassButton
                  className="w-full justify-start gap-3"
                  onClick={() => setView({ type: 'IDEAS' })}
                >
                  <FileText size={18} /> Write Note
                </GlassButton>
              </div>
            </div>
          </GlassPanel>

          <GlassCard className="overflow-visible">
            <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-white">Productivity Score</h3>
              </div>
              <p className="text-5xl font-bold text-white mb-2">{completionRate}%</p>
              <p className="text-sm text-white/50">
                {completedTasks} of {tasks.length} tasks completed
              </p>
              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
