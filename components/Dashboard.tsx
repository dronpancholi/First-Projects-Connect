
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import { Activity, CheckCircle, Folder, ExternalLink, Plus, Zap, ArrowUpRight, ArrowRight, TrendingUp, ShieldCheck, PenTool, Sparkles, Clock, Layout as LayoutIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MetricCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string;
  trendPositive?: boolean;
  onClick?: () => void;
}> = ({ title, value, icon, trend, trendPositive = true, onClick }) => (
  <div 
    onClick={onClick}
    className={`ios-card p-6 flex flex-col justify-between group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center text-ios-blue">
        {icon}
      </div>
      {trend && (
        <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${trendPositive ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="mt-6">
      <h3 className="text-3xl font-bold text-ios-label tracking-tight mb-1">{value}</h3>
      <p className="text-[12px] font-bold text-ios-label/40 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes, assets } = useStore();

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  
  const taskData = [
    { name: 'Completed', value: completedTasks, color: '#007AFF' },
    { name: 'In Progress', value: pendingTasks, color: '#F2F2F7' },
  ];

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-ios-label tracking-tight leading-none mb-3">Good Day.</h1>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[12px] text-ios-blue font-bold bg-ios-blue/10 px-4 py-1.5 rounded-full tracking-tight">
                <ShieldCheck size={14} /> System Verified
             </div>
             <div className="text-[12px] font-semibold text-ios-label/30">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
             </div>
          </div>
        </div>
        
        <button 
          onClick={() => setView({ type: 'PROJECTS' })}
          className="px-8 py-3.5 bg-ios-blue text-white rounded-full font-bold text-[15px] shadow-lg shadow-ios-blue/30 transition-all btn-tactile flex items-center gap-2"
        >
           <Plus size={20} /> New Project
        </button>
      </header>

      {/* iOS Widget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Active" value={activeProjects} icon={<LayoutIcon size={24}/>} trend="+2" onClick={() => setView({ type: 'PROJECTS' })} />
        <MetricCard title="Tasks" value={pendingTasks} icon={<Activity size={24}/>} trend="In view" />
        <MetricCard title="Success" value={`${Math.round((completedTasks / (tasks.length || 1)) * 100)}%`} icon={<CheckCircle size={24}/>} />
        <MetricCard title="Insights" value={notes.length} icon={<TrendingUp size={24}/>} onClick={() => setView({ type: 'IDEAS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Project Ledger */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] p-8 border border-ios-gray">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-ios-label/40">Projects In Rotation</h2>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="text-[13px] font-bold text-ios-blue flex items-center gap-1 hover:underline btn-tactile">
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="py-20 text-center">
                   <p className="text-ios-label/20 font-bold uppercase tracking-widest">No Active Nodes</p>
                </div>
              ) : projects.slice(0, 4).map(project => (
                <div 
                  key={project.id} 
                  onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
                  className="flex items-center gap-6 p-6 bg-ios-gray/30 rounded-3xl hover:bg-ios-gray/50 transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-ios-gray" />
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * project.progress) / 100} className="text-ios-blue transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold">{project.progress}%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[17px] font-bold text-ios-label group-hover:text-ios-blue transition-colors tracking-tight leading-tight mb-1">{project.title}</h4>
                    <p className="text-[13px] text-ios-label/40 truncate font-medium">{project.description}</p>
                  </div>
                  <ArrowUpRight size={20} className="text-ios-label/10 group-hover:text-ios-blue transition-all" />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-ios-label rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
              <Zap size={140} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-ios-blue">
                <Sparkles size={18} />
                <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Synthesis Engine</span>
              </div>
              <h4 className="text-2xl font-bold mb-3 tracking-tight">Need a Strategy?</h4>
              <p className="text-[14px] text-white/50 leading-relaxed mb-8 max-w-sm">Use the AI Architect to generate complex mission plans and architectural blueprints for your projects.</p>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="bg-white text-ios-label px-10 py-3 rounded-full text-[14px] font-bold transition-all hover:bg-ios-gray btn-tactile">
                Launch Assistant
              </button>
            </div>
          </section>
        </div>

        {/* Intelligence Rail */}
        <div className="space-y-8">
           <section className="bg-white rounded-[2rem] p-8 border border-ios-gray">
              <h3 className="text-[14px] font-bold uppercase tracking-widest text-ios-label/40 mb-8">Throughput</h3>
              
              <div className="h-48 relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {taskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold tracking-tight">{pendingTasks + completedTasks}</span>
                  <span className="text-[10px] font-bold text-ios-label/30 uppercase tracking-widest">Active</span>
                </div>
              </div>

              <div className="space-y-3">
                 {taskData.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-ios-gray/20 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-[13px] font-bold text-ios-label/70">{item.name}</span>
                       </div>
                       <span className="text-[14px] font-bold text-ios-label">{item.value}</span>
                    </div>
                 ))}
              </div>
           </section>

           <div className="ios-card p-8 flex items-center justify-between group cursor-pointer" onClick={() => setView({ type: 'WHITEBOARD' })}>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-ios-blue/10 flex items-center justify-center text-ios-blue group-hover:bg-ios-blue group-hover:text-white transition-all">
                   <PenTool size={22} />
                 </div>
                 <div>
                   <h4 className="text-[15px] font-bold text-ios-label">Interactive Canvas</h4>
                   <p className="text-[12px] text-ios-label/30 font-bold uppercase tracking-widest">Spatial Mode</p>
                 </div>
              </div>
              <ArrowRight size={20} className="text-ios-label/10 group-hover:text-ios-blue transition-all" />
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
