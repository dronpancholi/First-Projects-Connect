import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { ViewState } from '../../types.ts';
import {
  Briefcase, CheckCircle2, FileText, TrendingUp,
  ArrowRight, Zap, Clock, Target, Sparkles, Loader2
} from 'lucide-react';
import { GlassCard, GlassPanel, GlassButton, GlassBadge, GlassProgressBar } from '../ui/LiquidGlass.tsx';
import * as GeminiService from '../../services/geminiService.ts';
import { Skeleton } from '../ui/Skeleton.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { LearningLog } from '../tracking/LearningLog.tsx';
import { ReflectionLog } from '../tracking/ReflectionLog.tsx';

interface FPEngineBriefingProps {
  tasks: number;
  projects: number;
  highPriority: number;
}

const FPEngineBriefing: React.FC<FPEngineBriefingProps> = ({ tasks, projects, highPriority }) => {
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      setLoading(true);
      const text = await GeminiService.generateDailyBriefing({ tasks, projects, highPriority });
      setBriefing(text);
      setLoading(false);
    };
    fetchBriefing();
  }, []); // Run once on mount

  return (
    <GlassPanel
      className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-purple-400" />
          <h3 className="font-semibold text-purple-100 tracking-wide uppercase text-xs">FP-Engine Daily Briefing</h3>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-white/50">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Analyzing ecosystem...</span>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-white/90 text-lg leading-relaxed">{briefing}</p>
          </div>
        )}
      </div>
    </GlassPanel>
  );
};

interface DashboardProps {
  setView: (view: ViewState) => void;
}

const PersonalDashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { projects, tasks, notes, isLoading } = useStore();
  const activeTasks = tasks.filter(t => t.status !== 'done').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-purple-600 mb-3">
            <Zap size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest">Command Center</span>
          </div>
          <h1 className="text-4xl font-bold text-glass-primary tracking-tight mb-2">Dashboard</h1>
          <p className="text-glass-secondary text-sm">Your productivity overview at a glance.</p>
        </div>

        <GlassButton
          variant="primary"
          onClick={() => setView({ type: 'PROJECTS' })}
          className="flex items-center gap-2"
        >
          <Briefcase size={18} /> New Workspace <ArrowRight size={16} />
        </GlassButton>
      </header>

      {/* FP-Engine Briefing */}
      <FPEngineBriefing tasks={tasks.length} projects={projects.length} highPriority={tasks.filter(t => t.priority === 'high' && t.status !== 'done').length} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-500/10 shadow-lg shadow-purple-500/10 backdrop-blur-sm">
                <Briefcase size={22} className="text-purple-600" />
              </div>
              <GlassBadge variant="success">Active</GlassBadge>
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton width={48} height={40} className="mb-1" variant="rounded" />
                  <Skeleton width={80} height={16} />
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-glass-primary mb-1">{projects.length}</p>
                  <p className="text-sm text-glass-secondary">Total Projects</p>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/10 shadow-lg shadow-blue-500/10 backdrop-blur-sm">
                <Target size={22} className="text-blue-600" />
              </div>
              <GlassBadge variant="warning">{activeTasks} pending</GlassBadge>
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton width={48} height={40} className="mb-1" variant="rounded" />
                  <Skeleton width={80} height={16} />
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-glass-primary mb-1">{tasks.length}</p>
                  <p className="text-sm text-glass-secondary">Total Tasks</p>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 shadow-lg shadow-emerald-500/10 backdrop-blur-sm">
                <CheckCircle2 size={22} className="text-emerald-600" />
              </div>
              <GlassBadge variant="success">+{completedTasks}</GlassBadge>
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton width={64} height={40} className="mb-1" variant="rounded" />
                  <Skeleton width={100} height={16} />
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-glass-primary mb-1">{completionRate}%</p>
                  <p className="text-sm text-glass-secondary">Completion Rate</p>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-pink-500/10 shadow-lg shadow-pink-500/10 backdrop-blur-sm">
                <FileText size={22} className="text-pink-600" />
              </div>
              <GlassBadge>Insights</GlassBadge>
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton width={48} height={40} className="mb-1" variant="rounded" />
                  <Skeleton width={80} height={16} />
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-glass-primary mb-1">{notes.length}</p>
                  <p className="text-sm text-glass-secondary">Total Notes</p>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tracking Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassPanel initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="p-6">
            <LearningLog />
          </div>
        </GlassPanel>
        <GlassPanel initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="p-6">
            <ReflectionLog />
          </div>
        </GlassPanel>
      </div>

      {/* Recent Projects & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <GlassPanel>
            <div className="p-6 border-b border-glass-border-subtle flex justify-between items-center">
              <h2 className="text-lg font-semibold text-glass-primary">Recent Workspaces</h2>
              <GlassButton
                onClick={() => setView({ type: 'PROJECTS' })}
                className="flex items-center gap-1 px-3 py-2"
              >

                View All <ArrowRight size={14} />
              </GlassButton>
            </div>
            <div className="divide-y divide-glass-border-subtle">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton width={48} height={48} variant="rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton width="60%" height={20} />
                      <Skeleton width="40%" height={14} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton width={48} height={48} variant="rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton width="50%" height={20} />
                      <Skeleton width="30%" height={14} />
                    </div>
                  </div>
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={Briefcase}
                    title="No Workspaces Yet"
                    description="Create your first workspace to start organizing your projects."
                    action={
                      <GlassButton size="sm" onClick={() => setView({ type: 'PROJECTS' })}>Create Workspace</GlassButton>
                    }
                  />
                </div>
              ) : (
                recentProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
                    className="w-full p-5 flex items-center gap-4 hover:bg-glass-subtle transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Briefcase size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-glass-primary truncate mb-1">{project.title}</h3>
                      <p className="text-xs text-glass-secondary truncate">{project.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <GlassBadge variant={project.status === 'active' ? 'success' : 'default'}>
                        {project.status}
                      </GlassBadge>
                      <ArrowRight size={16} className="text-glass-secondary group-hover:text-glass-primary transition-colors" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassPanel>
        </div >

        {/* Quick Actions */}
        < div className="space-y-6" >
          <GlassPanel>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-glass-primary mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-600" /> Quick Actions
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
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-glass-primary">Productivity Score</h3>
              </div>
              <p className="text-5xl font-bold text-glass-primary mb-2">{completionRate}%</p>
              <p className="text-sm text-glass-secondary">
                {completedTasks} of {tasks.length} tasks completed
              </p>
              <div className="mt-4">
                <GlassProgressBar value={completionRate} variant="gradient" />
              </div>
            </div>
          </GlassCard>
        </div >
      </div >
    </div >
  );
};

export default PersonalDashboard;
