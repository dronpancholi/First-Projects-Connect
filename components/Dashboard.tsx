
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import { 
  BarChart3, CheckCircle, FolderOpen, Plus, 
  ArrowUpRight, ArrowRight, Activity, ShieldCheck, 
  Clock, Database, Globe, Layers, User,
  FileText, Briefcase, Sparkles, HeartPulse, Zap, TrendingUp, Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const AnalyticCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string;
  onClick?: () => void;
}> = ({ title, value, icon, trend, onClick }) => (
  <div 
    onClick={onClick}
    className={`card-professional p-6 flex flex-col justify-between h-40 group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className="text-gray-400 group-hover:text-black transition-colors">
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded flex items-center gap-1">
          <TrendingUp size={10} /> {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-display font-bold text-gray-900 tracking-tighter leading-none mb-1">{value}</h3>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes } = useStore();

  const activeWorkspaces = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completionRate = Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / (tasks.length || 1)) * 100);
  
  const activityData = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 65 },
    { name: 'Thu', value: 45 },
    { name: 'Fri', value: 90 },
    { name: 'Sat', value: 50 },
    { name: 'Sun', value: 20 },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-3">
             <HeartPulse size={14} className="animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System Engine v2.4.0</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-gray-900 tracking-tighter leading-none mb-3">Executive Deck</h1>
          <p className="text-gray-500 text-sm font-medium">Real-time telemetry and project lifecycle analytics.</p>
        </div>
        
        <div className="flex gap-3">
           <button 
            onClick={() => setView({ type: 'KANBAN' })}
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
             <Layers size={14} /> Operations
          </button>
           <button 
            onClick={() => setView({ type: 'PROJECTS' })}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
             <Plus size={16} /> New Node
          </button>
        </div>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticCard title="Active Projects" value={activeWorkspaces} icon={<Briefcase size={20}/>} trend="+12%" onClick={() => setView({ type: 'PROJECTS' })} />
        <AnalyticCard title="Backlog Nodes" value={pendingTasks} icon={<Activity size={20}/>} trend="Stable" />
        <AnalyticCard title="Efficiency Score" value={`${completionRate}%`} icon={<Zap size={20}/>} trend="v3.1" />
        <AnalyticCard title="Knowledge Base" value={notes.length} icon={<Database size={20}/>} trend="+5" onClick={() => setView({ type: 'IDEAS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Productivity Heatmap */}
        <div className="lg:col-span-8 space-y-8">
          <section className="card-professional p-8 overflow-hidden">
             <div className="flex justify-between items-center mb-10">
                <div>
                   <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                     <TrendingUp size={14} /> System Productivity Audit
                   </h2>
                </div>
                <select className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 border-gray-100 rounded px-2 py-1 outline-none">
                   <option>Weekly View</option>
                   <option>Monthly View</option>
                </select>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} dy={10} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px'}}
                      labelStyle={{fontWeight: 'bold', textTransform: 'uppercase'}}
                    />
                    <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </section>

          {/* Infrastructure Nodes */}
          <section className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                 <ShieldCheck size={14} /> Active Node Integrity
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {projects.slice(0, 4).map(project => (
                <div 
                  key={project.id} 
                  onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
                  className="flex items-center gap-6 p-6 hover:bg-gray-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <Database size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">{project.title}</h4>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-bold text-gray-300 uppercase">Health: Optimal</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-bold text-gray-900 leading-none">{project.progress}%</div>
                    <div className="text-[9px] font-bold text-gray-300 uppercase mt-1 tracking-widest">Integrity</div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-200 group-hover:text-indigo-600 transition-all" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Global Operational Status */}
        <div className="lg:col-span-4 space-y-8">
           <section className="card-professional p-8">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
                 <Calendar size={14} /> Strategic Timeline
              </h3>
              <div className="space-y-6">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                       <div className="flex flex-col items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 group-hover:scale-125 transition-all" />
                          <div className="w-px h-full bg-gray-100" />
                       </div>
                       <div className="pb-6">
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Q{i} Milestone</p>
                          <h4 className="text-[13px] font-bold text-gray-800 tracking-tight">System Infrastructure Update</h4>
                       </div>
                    </div>
                 ))}
              </div>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="w-full mt-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
                Access Full Roadmap
              </button>
           </section>

           {/* AI Automation Status - Preserving the "Coming Soon" as requested but updated to look professional */}
           <div className="card-professional p-8 relative overflow-hidden group bg-gray-900">
              <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                <Sparkles size={160} className="text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                   <Zap size={14} />
                   <span className="text-[9px] font-bold uppercase tracking-widest">Automation Engine</span>
                </div>
                <h4 className="text-xl font-display font-bold text-white tracking-tight mb-3">Logic Synthesis</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">Neural orchestrator for multi-node project automation.</p>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] text-center">
                   System Access: Pending Release
                </div>
              </div>
           </div>

           <div className="card-professional p-8 bg-indigo-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <Globe size={24} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Global Uptime</span>
              </div>
              <p className="text-2xl font-bold tracking-tighter mb-1">99.98%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Operational Resilience</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
