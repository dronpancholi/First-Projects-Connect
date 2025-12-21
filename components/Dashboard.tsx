
import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, ViewState } from '../types.ts';
// Fixed: Added missing icon imports (FileText, Briefcase, Sparkles) from lucide-react
import { 
  BarChart3, CheckCircle, FolderOpen, Plus, 
  ArrowUpRight, ArrowRight, Activity, ShieldCheck, 
  Clock, Database, Globe, Layers, User,
  FileText, Briefcase, Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AnalyticCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string;
  onClick?: () => void;
}> = ({ title, value, icon, trend, onClick }) => (
  <div 
    onClick={onClick}
    className={`card-professional p-6 flex flex-col justify-between h-36 group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className="text-gray-400 group-hover:text-black transition-colors">
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-display font-bold text-gray-900 tracking-tight leading-none mb-1">{value}</h3>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes } = useStore();

  const activeWorkspaces = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completionRate = Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / (tasks.length || 1)) * 100);
  
  const distributionData = [
    { name: 'Completed', value: tasks.filter(t => t.status === TaskStatus.DONE).length, color: '#111827' },
    { name: 'In Progress', value: pendingTasks, color: '#F3F4F6' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <Globe size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ecosystem Analytics</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tighter leading-none mb-2">Executive Summary</h1>
          <p className="text-gray-500 text-sm font-medium">Performance metrics and workspace status overview.</p>
        </div>
        
        <button 
          onClick={() => setView({ type: 'PROJECTS' })}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg"
        >
           <Plus size={16} /> New Workspace
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticCard title="Active Workspaces" value={activeWorkspaces} icon={<FolderOpen size={20}/>} trend="v1.2" onClick={() => setView({ type: 'PROJECTS' })} />
        <AnalyticCard title="Active Tasks" value={pendingTasks} icon={<Activity size={20}/>} />
        <AnalyticCard title="Efficiency Rate" value={`${completionRate}%`} icon={<BarChart3 size={20}/>} />
        <AnalyticCard title="Documentation" value={notes.length} icon={<FileText size={20}/>} onClick={() => setView({ type: 'IDEAS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Workspace List */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                 <Layers size={14} /> Workspace Status
              </h2>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="text-[10px] font-bold text-indigo-600 hover:underline">
                View Registry
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {projects.length === 0 ? (
                <div className="py-20 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                   No workspaces initialized
                </div>
              ) : projects.slice(0, 5).map(project => (
                <div 
                  key={project.id} 
                  onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}
                  className="flex items-center gap-6 p-6 hover:bg-gray-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors">
                    <Briefcase size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-0.5">{project.title}</h4>
                    <p className="text-xs text-gray-400 truncate font-medium">{project.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-gray-900">{project.progress}%</div>
                    <div className="text-[9px] font-bold text-gray-300 uppercase mt-0.5 tracking-widest">Progress</div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-200 group-hover:text-indigo-600 transition-all" />
                </div>
              ))}
            </div>
          </section>

          {/* Assistant Preview - Locked */}
          <section className="coming-soon-lock relative bg-gray-900 rounded-xl p-10 text-white overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Sparkles size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">System Assistant</span>
              </div>
              <h4 className="text-2xl font-display font-bold mb-3 tracking-tight">Intelligence Layer</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">Automate your project management lifecycle with professional AI orchestration and neural reasoning.</p>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[65%]" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-widest">Deployment: 65% Complete</p>
            </div>
          </section>
        </div>

        {/* Analytics Siderail */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
                 <BarChart3 size={14} /> Distribution
              </h3>
              
              <div className="h-44 relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                      {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-display font-bold text-gray-900">{tasks.length}</span>
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Tasks</span>
                </div>
              </div>

              <div className="space-y-2">
                 {distributionData.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-[12px] font-semibold text-gray-600">{item.name}</span>
                       </div>
                       <span className="text-[12px] font-bold text-gray-900">{item.value}</span>
                    </div>
                 ))}
              </div>
           </section>

           <div className="card-professional p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                     <ShieldCheck size={20} />
                   </div>
                   <div>
                     <h4 className="text-[13px] font-bold text-gray-900 tracking-tight">System Status</h4>
                     <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Verified</p>
                   </div>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-center">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Uplink: Synchronized</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
