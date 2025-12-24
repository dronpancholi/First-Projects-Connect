import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import LiquidSurface from './ui/LiquidSurface.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import {
  Briefcase, Activity, Zap, Database, TrendingUp, FolderOpen, Box, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Reusable Stat Card
const AnalyticCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  onClick?: () => void;
  color?: string;
}> = ({ title, value, icon, trend, onClick, color = "bg-blue-500" }) => (
  <LiquidSurface onClick={onClick} className={`h-48 group ${onClick ? 'cursor-pointer' : ''}`} intensity="medium" radius="xl" distortion={true}>
    <div className="flex flex-col justify-between h-full p-7">
      <div className="flex justify-between items-start">
        <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 text-slate-800 shadow-sm group-hover:scale-110 transition-transform duration-500 backdrop-blur-md border border-white/20`}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: 1.5 })}
        </div>
        {trend && (
          <div className="px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider backdrop-blur-md">
            {trend} <TrendingUp size={12} className="text-emerald-500 ml-0.5" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-4xl font-display font-medium text-slate-800 tracking-tight mb-1 group-hover:translate-x-1 transition-transform">{value}</h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
    </div>
  </LiquidSurface>
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
    <div className="space-y-10 animate-in fade-in duration-1000 slide-in-from-bottom-5">

      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div>
          <h1 className="text-6xl font-display font-bold text-slate-900 tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900">
            Good Morning,<br />Studio
          </h1>
          <div className="h-1 w-20 bg-studio-accent rounded-full mt-6 mb-4" />
          <p className="text-slate-500 font-medium text-base">
            System Status: <span className="text-emerald-500 font-bold">Optimal</span>. {pendingTasks} tasks pending.
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticCard title="Active Workspaces" value={activeProjects} icon={<Briefcase />} trend="+12%" onClick={() => setView({ type: 'PROJECTS' })} />
        <AnalyticCard title="Pending Output" value={pendingTasks} icon={<Activity />} color="bg-indigo-500" />
        <AnalyticCard title="System Efficiency" value={`${completionRate}%`} icon={<Zap />} color="bg-amber-500" />
        <AnalyticCard title="Total Liquidity" value={`$${totalCapital.toLocaleString()}`} icon={<Database />} color="bg-slate-900" onClick={() => setView({ type: 'FINANCIALS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
        {/* Main Chart */}
        <div className="lg:col-span-8 h-full">
          <LiquidSurface className="h-full" intensity="medium" radius="xl" distortion={true}>
            <div className="p-8 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Ecosystem Vitality</h2>
                  <p className="text-2xl font-bold text-slate-800">Weekly Output Analysis</p>
                </div>
                <div className="px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-full text-[10px] font-bold text-slate-600 uppercase shadow-sm">
                  Last 7 Days
                </div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 'bold' }} dy={10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.7)', color: '#1E293B', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#007AFF', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={4} fillOpacity={1} fill="url(#colorFlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </LiquidSurface>
        </div>

        {/* Side List */}
        <div className="lg:col-span-4 h-full">
          <LiquidSurface className="h-full" intensity="medium" radius="xl" distortion={true}>
            <div className="p-8 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Workspaces</h3>
                <button className="text-slate-400 hover:text-studio-accent transition-colors"><ChevronRight size={20} /></button>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar">
                {projects.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/30 hover:bg-white/60 border border-white/20 transition-all cursor-pointer group shadow-sm" onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: p.id })}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <FolderOpen size={20} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 transition-colors truncate">{p.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="h-1.5 flex-1 bg-white/50 rounded-full overflow-hidden border border-white/20">
                          <div className="h-full bg-studio-accent rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">{p.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-12 opacity-50 flex flex-col items-center">
                    <Box size={32} className="mb-4 text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active Workflows</p>
                  </div>
                )}
              </div>

              {/* Add New Button at bottom */}
              <button
                onClick={() => setView({ type: 'PROJECTS' })}
                className="mt-auto w-full py-4 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-studio-accent hover:border-studio-accent hover:bg-studio-accent/5 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Initialize New Workspace
              </button>
            </div>
          </LiquidSurface>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
