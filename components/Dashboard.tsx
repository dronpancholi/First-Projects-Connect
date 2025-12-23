
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
}> = ({ title, value, icon, trend, onClick, color = "bg-emerald-500" }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-8 rounded-[2.5rem] flex flex-col justify-between h-52 studio-shadow studio-shadow-hover transition-all group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-slate-900 group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 1.5 })}
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
          {trend} <TrendingUp size={12} className="text-emerald-500" />
        </span>
      )}
    </div>
    <div>
      <h3 className="text-4xl font-display font-bold text-slate-900 tracking-tight leading-none mb-2">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
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
          <h1 className="text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">Good Morning,<br/>Studio</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Performance Graph */}
        <div className="lg:col-span-8">
          <section className="bg-white p-10 rounded-[3rem] studio-shadow border border-slate-50">
             <div className="flex justify-between items-center mb-12">
                <div>
                   <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Ecosystem Vitality</h2>
                   <p className="text-lg font-bold text-slate-900">Weekly Output Analysis</p>
                </div>
                <div className="flex gap-2">
                   <div className="px-4 py-1.5 bg-slate-50 rounded-full text-[10px] font-bold text-slate-500 uppercase">This Week</div>
                </div>
             </div>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 'bold'}} dy={10} />
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontSize: '11px', background: '#fff', color: '#0F172A'}}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmerald)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </section>
        </div>

        {/* Side Actions */}
        <div className="lg:col-span-4 space-y-10">
           <section className="bg-white p-10 rounded-[3rem] studio-shadow border border-slate-50 h-full">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Next Steps</h3>
                 <button className="text-slate-300 hover:text-slate-900 transition-colors"><ChevronRight size={18} /></button>
              </div>
              <div className="space-y-6">
                 {projects.slice(0, 3).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-5 group cursor-pointer" onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: p.id })}>
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <FolderOpen size={20} strokeWidth={1.5} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-500 transition-colors truncate">{p.title}</h4>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">{p.progress}% Synced</p>
                       </div>
                    </div>
                 ))}
                 {projects.length === 0 && (
                   <div className="text-center py-10 opacity-40">
                      <Box size={32} className="mx-auto mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Workspace Empty</p>
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
