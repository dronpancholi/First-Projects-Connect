
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import {
  BarChart3, CheckCircle, FolderOpen, Plus,
  ArrowUpRight, ArrowRight, Activity, ShieldCheck,
  Clock, Database, Globe, Layers, User,
  FileText, Briefcase, Sparkles, HeartPulse, Zap, TrendingUp, Calendar,
  Box, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

const AnalyticCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  onClick?: () => void;
  color?: string;
}> = ({ title, value, icon, trend, onClick, color = "bg-blue-500" }) => (
  <div
    onClick={onClick}
    className={`glass-panel p-6 flex flex-col justify-between h-48 hover:scale-[1.02] transition-all duration-500 group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20 text-slate-800 shadow-sm group-hover:scale-110 transition-transform duration-500 backdrop-blur-md`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 22, strokeWidth: 1.5 })}
      </div>
      {trend && (
        <div className="px-2 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
          {trend} <TrendingUp size={10} className="text-emerald-500 ml-0.5" />
        </div>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-display font-medium text-slate-800 tracking-tight mb-1">{value}</h3>
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest opacity-80">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes, financials } = useStore();

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100);

  const activityData = [
    { name: 'Mon', value: 30 },
    { name: 'Tue', value: 45 },
    { name: 'Wed', value: 38 },
    { name: 'Thu', value: 52 },
    { name: 'Fri', value: 48 },
    { name: 'Sat', value: 24 },
    { name: 'Sun', value: 18 },
  ];

  const totalCapital = financials.reduce((acc, f) => acc + (f.type === 'revenue' ? f.amount : -f.amount), 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">Good Morning,<br />Studio</h1>
          <p className="text-slate-400 text-sm font-medium mt-3">You have {pendingTasks} active objectives across {activeProjects} workspaces.</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setView({ type: 'PROJECTS' })}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 btn-tactile"
          >
            <Plus size={18} /> New Workspace
          </button>
        </div>
      </header>

      {/* Modern Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnalyticCard title="Active Projects" value={activeProjects} icon={<Briefcase />} trend="+12%" onClick={() => setView({ type: 'PROJECTS' })} />
        <AnalyticCard title="Pending Tasks" value={pendingTasks} icon={<Activity />} color="bg-indigo-500" />
        <AnalyticCard title="Success Rate" value={`${completionRate}%`} icon={<Zap />} color="bg-emerald-500" />
        <AnalyticCard title="Net Capital" value={`$${totalCapital}`} icon={<Database />} color="bg-slate-900" onClick={() => setView({ type: 'FINANCIALS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Performance Graph */}
        <div className="lg:col-span-8">
          <section className="glass-panel p-8 h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Ecosystem Vitality</h2>
                <p className="text-xl font-semibold text-slate-800">Weekly Output Analysis</p>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-1.5 bg-white/50 backdrop-blur-sm border border-white/40 rounded-full text-[10px] font-bold text-slate-600 uppercase shadow-sm">This Week</div>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 'bold' }} dy={10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.8)', color: '#1E293B', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={3} fillOpacity={1} fill="url(#colorEmerald)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Side Actions */}
        <div className="lg:col-span-4 space-y-8">
          <section className="glass-panel p-8 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Next Steps</h3>
              <button className="text-slate-400 hover:text-studio-accent transition-colors"><ChevronRight size={18} /></button>
            </div>
            <div className="space-y-4">
              {projects.slice(0, 3).map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-white/40 transition-all cursor-pointer group" onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: p.id })}>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-400 group-hover:bg-studio-accent group-hover:text-white transition-all duration-300 shadow-sm">
                    <FolderOpen size={18} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 transition-colors truncate">{p.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-studio-accent/50 rounded-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">{p.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-8 opacity-50">
                  <Box size={28} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Empty</p>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
