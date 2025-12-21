
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import { 
  Activity, CheckCircle, Folder, Plus, Zap, 
  ArrowUpRight, ArrowRight, TrendingUp, ShieldCheck, 
  Clock, Database, Server, Cpu, Globe, Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const StatWidget: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  status?: string;
  onClick?: () => void;
}> = ({ title, value, icon, status, onClick }) => (
  <div 
    onClick={onClick}
    className={`card-system p-5 flex flex-col justify-between h-32 group transition-all hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
        {icon}
      </div>
      {status && (
        <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {status}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1">{value}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes } = useStore();

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  
  const taskData = [
    { name: 'Completed', value: completedTasks, color: '#4F46E5' },
    { name: 'Active', value: pendingTasks, color: '#F1F5F9' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <Cpu size={14} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Core v1.3</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tighter leading-none mb-2">System Overview</h1>
          <p className="text-slate-500 text-[13px] font-medium">Real-time telemetry and project lifecycle management.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all"
          >
            <Database size={14} /> System Audit
          </button>
          <button 
            onClick={() => setView({ type: 'PROJECTS' })}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
             <Plus size={16} /> Initialize Project
          </button>
        </div>
      </header>

      {/* High-Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget title="Active Workspaces" value={activeProjects} icon={<Server size={18}/>} status="Online" onClick={() => setView({ type: 'PROJECTS' })} />
        <StatWidget title="Task Operations" value={pendingTasks} icon={<Activity size={18}/>} />
        <StatWidget title="System Efficiency" value={`${Math.round((completedTasks / (tasks.length || 1)) * 100)}%`} icon={<ShieldCheck size={18}/>} />
        <StatWidget title="Knowledge Base" value={notes.length} icon={<Globe size={18}/>} onClick={() => setView({ type: 'IDEAS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Node Registry */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <Folder size={14} /> Priority Registry
              </h2>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline">
                View All Nodes <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <div className="py-20 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">
                   Null Result: No active projects
                </div>
              ) : projects.slice(0, 5).map(project => (
                <div 
                  key={project.id} 
                  onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
                  className="flex items-center gap-6 p-5 hover:bg-slate-50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-all">
                    <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-indigo-600 tracking-tighter">
                       {project.id.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight mb-0.5">{project.title}</h4>
                    <p className="text-[12px] text-slate-400 truncate font-medium">{project.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-black text-slate-900 leading-none">{project.progress}%</div>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Status</div>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-200 group-hover:text-indigo-400 transition-all" />
                </div>
              ))}
            </div>
          </section>

          {/* Module Promotion */}
          <section className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden group border border-white/5">
            <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <Cpu size={240} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                {/* Fixed: Sparkles icon is now imported correctly above */}
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Engine v2.0</span>
              </div>
              <h4 className="text-2xl font-bold mb-3 tracking-tight">Mission Critical Architecture</h4>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6 max-w-sm">Automate your project lifecycle with advanced logic synthesis and native task orchestration.</p>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/10 rounded-md text-[9px] font-black uppercase tracking-widest text-white/50 border border-white/10">Coming Soon</span>
                <span className="text-[10px] font-medium text-white/20 italic">Architect access pending system verification...</span>
              </div>
            </div>
          </section>
        </div>

        {/* System Analytics Side Rail */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <Activity size={14} /> Resource Allocation
              </h3>
              
              <div className="h-44 relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskData} cx="50%" cy="50%" innerRadius={55} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                      {taskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold tracking-tighter text-slate-900">{pendingTasks + completedTasks}</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active Ops</span>
                </div>
              </div>

              <div className="space-y-2">
                 {taskData.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                       <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-[12px] font-bold text-slate-600">{item.name}</span>
                       </div>
                       <span className="text-[12px] font-black text-slate-900">{item.value}</span>
                    </div>
                 ))}
              </div>
           </section>

           <div className="card-system p-6 flex flex-col gap-4 relative overflow-hidden bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                     <Cpu size={18} />
                   </div>
                   <div>
                     <h4 className="text-[13px] font-bold text-slate-900">System Visualizer</h4>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Spatial Architect</p>
                   </div>
                </div>
                <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                   <ArrowRight size={18} />
                </button>
              </div>
              <div className="mt-2 py-2 px-3 bg-amber-50 border border-amber-100 rounded text-[10px] font-black text-amber-600 uppercase tracking-widest text-center">
                 Module Under Maintenance
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
