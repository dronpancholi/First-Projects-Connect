
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import { Activity, CheckCircle, Folder, ExternalLink, Plus, Zap, ArrowUpRight, ArrowRight, TrendingUp, ShieldCheck, PenTool, Settings, Sparkles } from 'lucide-react';
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
    className={`pro-card p-6 rounded-2xl group ${onClick ? 'cursor-pointer hover:border-indigo-200 active:scale-[0.98]' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors border border-slate-100">
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes, assets } = useStore();

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  
  const taskData = [
    { name: 'Complete', value: completedTasks, color: '#10b981' },
    { name: 'Active', value: pendingTasks, color: '#4f46e5' },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Command Center</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 text-sm font-medium">Global workspace health and mission status.</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                <ShieldCheck size={14} /> Systems Online
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-black bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest">
                <Sparkles size={14} /> Free Tier Active
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button 
            onClick={() => setView({ type: 'IDEAS' })}
            className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
             Index Note
           </button>
           <button 
            onClick={() => setView({ type: 'PROJECTS' })}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
             <Plus size={18} /> New Workspace
           </button>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Projects" value={activeProjects} icon={<Folder size={22}/>} trend="+12%" onClick={() => setView({ type: 'PROJECTS' })} />
        <StatCard title="Open Tasks" value={pendingTasks} icon={<Activity size={22}/>} />
        <StatCard title="Throughput" value={completedTasks} icon={<CheckCircle size={22}/>} trend="Efficient" />
        <StatCard title="Knowledge Base" value={notes.length} icon={<TrendingUp size={22}/>} onClick={() => setView({ type: 'IDEAS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Operational Feed */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Project Registry</h2>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="text-[10px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-100 p-2">
              {projects.length === 0 ? (
                <div className="py-24 text-center">
                   <Folder className="mx-auto text-slate-100 mb-4" size={48} />
                   <p className="text-slate-400 text-sm font-semibold italic">No active nodes registered.</p>
                </div>
              ) : projects.slice(0, 5).map(project => (
                <div 
                  key={project.id} 
                  onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
                  className="flex items-center gap-6 p-6 hover:bg-slate-50/80 transition-all cursor-pointer group rounded-2xl"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black border border-slate-200 ${project.progress === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-400'}`}>
                    {project.progress}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.title}</h4>
                    <p className="text-xs text-slate-500 truncate mt-1 leading-relaxed">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest ${project.status === ProjectStatus.ACTIVE ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {project.status}
                    </span>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section className="bg-white border border-slate-200 rounded-3xl p-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <ExternalLink size={14} className="text-slate-300" /> Linked Resources
                </h3>
                <div className="space-y-3">
                  {assets.slice(0, 4).map(asset => (
                    <a key={asset.id} href={asset.url} target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group">
                       <div className="text-slate-300 group-hover:text-indigo-600"><ExternalLink size={14} /></div>
                       <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 truncate flex-1">{asset.name}</span>
                       <span className="text-[9px] font-black text-slate-300 uppercase">{asset.type}</span>
                    </a>
                  ))}
                  {assets.length === 0 && <p className="text-center py-10 text-slate-300 text-[10px] font-black uppercase italic">No Linked Assets</p>}
                </div>
             </section>
             <section className="bg-white border border-slate-200 rounded-3xl p-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setView({ type: 'WHITEBOARD' })} className="flex flex-col items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all group">
                      <PenTool size={20} className="text-slate-400 group-hover:text-indigo-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Visualizer</span>
                   </button>
                   <button onClick={() => setView({ type: 'SETTINGS' })} className="flex flex-col items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all group">
                      <Settings size={20} className="text-slate-400 group-hover:text-slate-900" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Config</span>
                   </button>
                </div>
             </section>
          </div>
        </div>

        {/* Intelligence Rail */}
        <div className="space-y-8">
           <section className="bg-white border border-slate-200 rounded-3xl p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2">Throughput Distribution</h3>
              <p className="text-xs text-slate-400 font-medium mb-8">Overall efficiency of project threads.</p>
              
              <div className="h-64 relative mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={6} dataKey="value" stroke="none">
                      {taskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{pendingTasks + completedTasks}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Ops</span>
                </div>
              </div>

              <div className="space-y-3">
                 {taskData.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{item.name}</span>
                       </div>
                       <span className="text-sm font-black text-slate-900">{item.value}</span>
                    </div>
                 ))}
              </div>
           </section>

           <section className="bg-indigo-600 p-8 rounded-3xl text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-xl font-extrabold mb-2 tracking-tight">AI Assistant</h4>
              <p className="text-sm text-indigo-100 leading-relaxed mb-8 font-medium">Connect-Engine is ready to optimize your workflow through voice and vision.</p>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="w-full bg-white text-indigo-700 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-indigo-50 active:scale-95 shadow-lg">
                Activate Assistant
              </button>
           </section>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
