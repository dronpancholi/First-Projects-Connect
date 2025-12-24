import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import {
  Briefcase, Activity, Zap, Database, TrendingUp, FolderOpen, Box, ChevronRight, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  onClick?: () => void;
  color: string;
}> = ({ title, value, icon, trend, onClick, color }) => (
  <div
    onClick={onClick}
    className={`glass-card stat-card p-6 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
        {icon}
      </div>
      {trend && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-semibold">
          {trend} <TrendingUp size={12} />
        </div>
      )}
    </div>
    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Good Morning, Studio
          </h1>
          <p className="text-gray-500">
            You have <span className="font-semibold text-blue-500">{pendingTasks}</span> pending tasks across{' '}
            <span className="font-semibold text-blue-500">{activeProjects}</span> active workspaces.
          </p>
        </div>
        <button
          onClick={() => setView({ type: 'PROJECTS' })}
          className="glass-btn flex items-center gap-2"
        >
          <Plus size={18} /> New Workspace
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Workspaces"
          value={activeProjects}
          icon={<Briefcase size={22} />}
          trend="+12%"
          onClick={() => setView({ type: 'PROJECTS' })}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={<Activity size={22} />}
          color="bg-indigo-500"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<Zap size={22} />}
          color="bg-amber-500"
        />
        <StatCard
          title="Total Capital"
          value={`$${totalCapital.toLocaleString()}`}
          icon={<Database size={22} />}
          onClick={() => setView({ type: 'FINANCIALS' })}
          color="bg-gray-800"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Weekly Activity</h2>
              <p className="text-sm text-gray-500">Output analysis for the week</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
              This Week
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    background: 'white'
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects List */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Active Projects</h2>
            <button
              onClick={() => setView({ type: 'PROJECTS' })}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-all cursor-pointer"
                onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: p.id })}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <FolderOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">{p.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{p.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8">
                <Box size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-400">No active projects</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
