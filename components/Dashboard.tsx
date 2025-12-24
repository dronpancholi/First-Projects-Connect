import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import {
  Briefcase, Activity, Zap, Database, TrendingUp, FolderOpen, Box, ChevronRight, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard, GlassPanel, GlassButton, GlassBadge } from './ui/LiquidGlass.tsx';

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, financials } = useStore();

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100);
  const totalCapital = financials.reduce((acc, f) => acc + (f.type === 'revenue' ? f.amount : -f.amount), 0);

  const activityData = [
    { name: 'Mon', value: 30 }, { name: 'Tue', value: 45 },
    { name: 'Wed', value: 38 }, { name: 'Thu', value: 52 },
    { name: 'Fri', value: 48 }, { name: 'Sat', value: 24 },
    { name: 'Sun', value: 18 },
  ];

  const stats = [
    { title: 'Active Workspaces', value: activeProjects, icon: Briefcase, trend: '+12%', gradient: 'from-blue-500 to-purple-600', onClick: () => setView({ type: 'PROJECTS' }) },
    { title: 'Pending Tasks', value: pendingTasks, icon: Activity, gradient: 'from-indigo-500 to-blue-600' },
    { title: 'Completion Rate', value: `${completionRate}%`, icon: Zap, gradient: 'from-amber-500 to-orange-600' },
    { title: 'Total Capital', value: `$${totalCapital.toLocaleString()}`, icon: Database, gradient: 'from-gray-700 to-gray-900', onClick: () => setView({ type: 'FINANCIALS' }) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pendingTasks} pending tasks across {activeProjects} workspaces
          </p>
        </div>
        <GlassButton
          variant="primary"
          onClick={() => setView({ type: 'PROJECTS' })}
          className="flex items-center gap-2"
        >
          <Plus size={16} /> New Workspace
        </GlassButton>
      </div>

      {/* Stats with Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard
              key={i}
              onClick={stat.onClick}
              className={stat.onClick ? 'cursor-pointer' : ''}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  {stat.trend && (
                    <GlassBadge variant="success" className="flex items-center gap-1">
                      {stat.trend} <TrendingUp size={10} />
                    </GlassBadge>
                  )}
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.title}</div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <GlassPanel>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-medium text-gray-900">Weekly Activity</h2>
                  <p className="text-xs text-gray-500">Output analysis</p>
                </div>
                <GlassBadge variant="primary">This Week</GlassBadge>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#86868b' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        fontSize: '12px',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(8px)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0071e3"
                      strokeWidth={2.5}
                      fill="url(#activityGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Projects */}
        <div>
          <GlassPanel>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-gray-900">Projects</h2>
                <button
                  onClick={() => setView({ type: 'PROJECTS' })}
                  className="p-1.5 rounded-lg hover:bg-gray-100/50 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 cursor-pointer transition-all group"
                    onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: p.id })}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                      <FolderOpen size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{p.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">{p.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Box size={24} className="text-gray-300" />
                    </div>
                    <p className="text-xs text-gray-400">No projects yet</p>
                    <button
                      onClick={() => setView({ type: 'PROJECTS' })}
                      className="text-xs text-blue-600 font-medium mt-2 hover:underline"
                    >
                      Create one
                    </button>
                  </div>
                )}
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
