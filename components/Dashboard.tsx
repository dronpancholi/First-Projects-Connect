
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
import { 
  BarChart3, CheckCircle, FolderOpen, Plus, 
  ArrowUpRight, ArrowRight, Activity, ShieldCheck, 
  Clock, Database, Globe, Layers, User,
  FileText, Briefcase, Sparkles, HeartPulse, Zap, TrendingUp, Calendar,
  // Added missing Box icon
  Box
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

const AnalyticCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string;
  onClick?: () => void;
}> = ({ title, value, icon, trend, onClick }) => (
  <div 
    onClick={onClick}
    className={`card-professional p-6 flex flex-col justify-between h-44 group ${onClick ? 'cursor-pointer' : ''} border-b-4 border-b-gray-100 hover:border-b-yellow-400 transition-all`}
  >
    <div className="flex justify-between items-start">
      <div className="text-gray-400 group-hover:text-yellow-500 transition-colors">
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-black text-yellow-600 bg-yellow-50 px-2 py-1 rounded flex items-center gap-1 border border-yellow-100">
          <TrendingUp size={10} /> {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-4xl font-display font-black text-gray-900 tracking-tighter leading-none mb-1">{value}</h3>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes, financials } = useStore();

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100);
  
  // Real activity data based on logic
  const activityData = [
    { name: 'M', value: tasks.length * 2 },
    { name: 'T', value: projects.length * 5 },
    { name: 'W', value: notes.length * 3 },
    { name: 'T', value: 40 },
    { name: 'F', value: 60 },
    { name: 'S', value: 20 },
    { name: 'S', value: 10 },
  ];

  const totalCapital = financials.reduce((acc, f) => acc + (f.type === 'revenue' ? f.amount : -f.amount), 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-12">
        <div>
          <div className="flex items-center gap-2 text-yellow-600 mb-3">
             <HeartPulse size={14} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Telemetry active</span>
          </div>
          <h1 className="text-6xl font-display font-black text-gray-900 tracking-tighter leading-none mb-4">Command Center</h1>
          <p className="text-gray-500 text-sm font-medium">Real-time oversight of industrial project nodes.</p>
        </div>
        
        <div className="flex gap-4">
           <button 
            onClick={() => setView({ type: 'PROJECTS' })}
            className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-yellow-100/20"
          >
             <Plus size={18} className="text-yellow-400" /> Initialize Node
          </button>
        </div>
      </header>

      {/* Industrial Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnalyticCard title="Active Nodes" value={activeProjects} icon={<Briefcase size={24}/>} trend="+5%" onClick={() => setView({ type: 'PROJECTS' })} />
        <AnalyticCard title="Mission Tasks" value={pendingTasks} icon={<Activity size={24}/>} trend="v1.2" />
        <AnalyticCard title="System Efficiency" value={`${completionRate}%`} icon={<Zap size={24}/>} trend="Optimal" />
        <AnalyticCard title="Capital Flow" value={`$${totalCapital}`} icon={<Database size={24}/>} trend="Live" onClick={() => setView({ type: 'FINANCIALS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Core Throughput Visualization */}
        <div className="lg:col-span-8 space-y-10">
          <section className="card-professional p-10 rounded-[2.5rem] bg-gray-50/30 border-2 border-gray-50">
             <div className="flex justify-between items-center mb-12">
                <div>
                   <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                     <TrendingUp size={16} className="text-yellow-500" /> Ecosystem Activity Heatmap
                   </h2>
                </div>
             </div>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EAB308" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: '900'}} dy={10} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', fontSize: '10px', background: '#111827', color: '#fff'}}
                      labelStyle={{fontWeight: '900', color: '#EAB308'}}
                    />
                    <Area type="stepAfter" dataKey="value" stroke="#EAB308" strokeWidth={4} fillOpacity={1} fill="url(#colorYellow)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </section>

          {/* Active Registry */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-8 py-6 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-500 flex items-center gap-3">
                 <ShieldCheck size={16} /> Operational Nodes Status
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {projects.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <Box size={40} className="text-gray-200 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Registry Empty</p>
                </div>
              ) : projects.slice(0, 4).map(project => (
                <div key={project.id} onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })} className="flex items-center gap-6 p-8 hover:bg-yellow-50/30 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-yellow-400 group-hover:text-black transition-all shadow-sm">
                    <Database size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[16px] font-black text-gray-900 tracking-tight group-hover:text-yellow-600 transition-colors mb-1">{project.title}</h4>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Type: Production</span>
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-black text-gray-900 leading-none">{project.progress}%</div>
                    <div className="text-[9px] font-black text-gray-300 uppercase mt-1 tracking-widest">Integrity</div>
                  </div>
                  <ArrowRight size={18} className="text-gray-200 group-hover:text-yellow-500 transition-all" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Tactical Side Panels */}
        <div className="lg:col-span-4 space-y-10">
           <section className="card-professional p-10 rounded-[2.5rem]">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-3">
                 <Calendar size={16} className="text-yellow-500" /> Strategic Roadmap
              </h3>
              <div className="space-y-10">
                 {['Infrastructure Layer', 'Logic Synthesis', 'Security Audit'].map((m, i) => (
                    <div key={i} className="flex gap-6 group cursor-pointer">
                       <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-400 group-hover:scale-150 transition-all shadow-lg shadow-yellow-200" />
                          <div className="w-px h-full bg-gray-100 mt-2" />
                       </div>
                       <div className="pb-4">
                          <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Target 0{i+1}</p>
                          <h4 className="text-[14px] font-black text-gray-900 tracking-tighter leading-tight">{m}</h4>
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           <div className="card-professional p-10 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                <Sparkles size={180} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-yellow-500 mb-6">
                   <Zap size={18} />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">Autonomous Core</span>
                </div>
                <h4 className="text-2xl font-display font-black text-white tracking-tighter mb-4">Neural Engine</h4>
                <p className="text-sm text-gray-400 leading-relaxed mb-10">Agentic orchestration for multi-node industrial deployments.</p>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-yellow-500/50 uppercase tracking-[0.4em] text-center">
                   Uplink Ready
                </div>
              </div>
           </div>

           <div className="card-professional p-10 rounded-[2.5rem] bg-yellow-400 text-black shadow-2xl shadow-yellow-200/50">
              <div className="flex items-center justify-between mb-6">
                <Globe size={32} />
                <div className="w-2 h-2 rounded-full bg-black animate-ping" />
              </div>
              <p className="text-4xl font-black tracking-tighter mb-1">100%</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Network Resilience</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
