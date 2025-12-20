
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
// Added missing PenTool and Settings icon imports
import { Activity, CheckCircle, Clock, Folder, ExternalLink, Plus, Zap, ArrowUpRight, ArrowRight, Share2, TrendingUp, ShieldCheck, PenTool, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string;
  onClick?: () => void;
}> = ({ title, value, icon, trend, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-zinc-900 p-5 rounded-2xl border border-zinc-800 transition-all group ${onClick ? 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/80 active:scale-[0.98]' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-brand-primary transition-colors border border-zinc-700/50">
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes, assets, addProject, addNote } = useStore();

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  
  const taskData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    { name: 'Active', value: pendingTasks, color: '#3b82f6' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Ecosystem Overview</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-zinc-500 text-sm font-medium">Monitoring system performance and task throughput.</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
               <ShieldCheck size={14} /> System Secure
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button 
            onClick={() => setView({ type: 'IDEAS' })}
            className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
             Index Note
           </button>
           <button 
            onClick={() => setView({ type: 'PROJECTS' })}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center gap-2"
          >
             <Plus size={18} /> New Workspace
           </button>
        </div>
      </header>

      {/* Grid Control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Nodes" value={activeProjects} icon={<Folder size={20}/>} trend="+2.4%" onClick={() => setView({ type: 'PROJECTS' })} />
        <StatCard title="Pending Operations" value={pendingTasks} icon={<Activity size={20}/>} />
        <StatCard title="Throughput" value={completedTasks} icon={<CheckCircle size={20}/>} trend="Optimized" />
        <StatCard title="Knowledge Bases" value={notes.length} icon={<TrendingUp size={20}/>} onClick={() => setView({ type: 'IDEAS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Node Activity</h2>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="text-[10px] font-black text-brand-primary uppercase hover:underline flex items-center gap-1">
                Full Registry <ArrowRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-zinc-800/50 p-2">
              {projects.length === 0 ? (
                <div className="py-20 text-center">
                   <Folder className="mx-auto text-zinc-800 mb-4" size={40} />
                   <p className="text-zinc-600 text-sm font-medium">No active project nodes found.</p>
                </div>
              ) : projects.slice(0, 5).map(project => (
                <div 
                  key={project.id} 
                  onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
                  className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-all cursor-pointer group rounded-xl"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border border-zinc-800 ${project.progress === 100 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}>
                    {project.progress}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-zinc-100 group-hover:text-brand-primary transition-colors">{project.title}</h4>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-zinc-800 uppercase tracking-widest ${project.status === ProjectStatus.ACTIVE ? 'text-brand-primary' : 'text-zinc-600'}`}>
                      {project.status}
                    </span>
                    <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                  <ExternalLink size={14} className="text-zinc-500" /> Recent Assets
                </h3>
                <div className="space-y-3">
                  {assets.slice(0, 4).map(asset => (
                    <a key={asset.id} href={asset.url} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all group">
                       <div className="text-zinc-600 group-hover:text-brand-primary"><ExternalLink size={12} /></div>
                       <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 truncate flex-1">{asset.name}</span>
                       <span className="text-[9px] font-black text-zinc-700 uppercase">{asset.type}</span>
                    </a>
                  ))}
                  {assets.length === 0 && <p className="text-center py-6 text-zinc-700 text-[10px] font-bold uppercase italic">Registry Empty</p>}
                </div>
             </section>
             <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                  <Zap size={14} className="text-brand-accent" /> Command Center
                </h3>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setView({ type: 'WHITEBOARD' })} className="flex flex-col items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all group">
                      <PenTool size={18} className="text-zinc-500 group-hover:text-brand-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Visuals</span>
                   </button>
                   <button onClick={() => setView({ type: 'SETTINGS' })} className="flex flex-col items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all group">
                      <Settings size={18} className="text-zinc-500 group-hover:text-zinc-100" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Config</span>
                   </button>
                </div>
             </section>
          </div>
        </div>

        {/* Analytics Rail */}
        <div className="space-y-6">
           <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Throughput Distribution</h3>
              <p className="text-[10px] text-zinc-600 font-medium mb-6">Efficiency metrics for active threads.</p>
              
              <div className="h-64 relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                      {taskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '10px' }}
                      itemStyle={{ color: '#f4f4f5' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white tracking-tighter">{pendingTasks + completedTasks}</span>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Tasks</span>
                </div>
              </div>

              <div className="space-y-2">
                 {taskData.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">{item.name}</span>
                       </div>
                       <span className="text-xs font-bold text-zinc-300">{item.value}</span>
                    </div>
                 ))}
              </div>
           </section>

           <section className="bg-gradient-to-br from-brand-primary to-brand-accent p-6 rounded-2xl text-white shadow-xl shadow-brand-primary/10 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <h4 className="text-lg font-bold mb-1">Sentient Assist</h4>
              <p className="text-xs text-white/80 leading-relaxed mb-6">FP-Engine is monitoring your workspace for potential optimizations.</p>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                Engage Assistant
              </button>
           </section>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
