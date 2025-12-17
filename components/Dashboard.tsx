
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProjectStatus, TaskStatus, ViewState } from '../types';
import { Activity, CheckCircle, Clock, Folder, ExternalLink, Sparkles, Wand2, Plus, Zap, ArrowRight, Share2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: string;
  onClick?: () => void;
}> = ({ title, value, icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between h-40 transition-all ${onClick ? 'cursor-pointer hover:border-gray-300 hover:shadow-xl hover:-translate-y-1' : ''}`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-3xl font-black text-apple-text tracking-tighter">{value}</h3>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

const QuickAction: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-3 p-4 rounded-[24px] bg-gray-50 hover:bg-white hover:shadow-lg hover:ring-1 hover:ring-black/5 transition-all group"
  >
    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-[10px] font-bold text-gray-500 group-hover:text-black uppercase tracking-tight">{label}</span>
  </button>
);

const Dashboard: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, tasks, notes, assets, addProject, addNote } = useStore();
  const [aiSpark, setAiSpark] = useState<string>("Initializing your productivity engine...");
  const [isSparkLoading, setIsSparkLoading] = useState(true);

  useEffect(() => {
    const fetchSpark = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Give a 1-sentence productivity tip for a high-performance engineer today. Make it inspiring and professional.",
        });
        setAiSpark(response.text || "Build something amazing today.");
      } catch (e) {
        setAiSpark("Focus on one task at a time for maximum momentum.");
      } finally {
        setIsSparkLoading(false);
      }
    };
    fetchSpark();
  }, []);

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  
  const taskData = [
    { name: 'Done', value: completedTasks, color: '#10B981' },
    { name: 'Pending', value: pendingTasks, color: '#3B82F6' },
  ];

  const handleQuickIdea = () => {
    addNote({ title: "Quick Idea", content: "" });
    setView({ type: "IDEAS" });
  };

  const handleQuickProject = () => {
    addProject({ title: "New Venture", description: "Brainstorming phase...", status: ProjectStatus.IDEA, tags: [] });
    setView({ type: "PROJECTS" });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-bold text-white rounded uppercase tracking-widest">Nexus Pro</span>
          </div>
          <h1 className="text-4xl font-black text-apple-text tracking-tight">First Projects Connect</h1>
          <p className="text-gray-400 font-medium">Your personal ecosystem is optimized and ready.</p>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[32px] text-white shadow-2xl flex items-center gap-6 max-w-lg w-full relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000">
             <Sparkles size={120} />
           </div>
           <div className="p-4 bg-white/20 backdrop-blur rounded-3xl relative z-10"><Zap size={28} /></div>
           <div className="relative z-10">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1.5 flex items-center gap-2">
               <Wand2 size={12} /> AI Intelligence Layer
             </div>
             <p className="text-sm font-semibold leading-relaxed">
               {isSparkLoading ? "Scanning your workspace..." : `"${aiSpark}"`}
             </p>
           </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Workspaces" value={activeProjects} icon={<Folder />} color="bg-blue-50 text-blue-600" onClick={() => setView({ type: 'PROJECTS' })} />
        <StatCard title="Pending Actions" value={pendingTasks} icon={<Clock />} color="bg-amber-50 text-amber-600" onClick={() => setView({ type: 'PROJECTS' })} />
        <StatCard title="Closed Loop" value={completedTasks} icon={<CheckCircle />} color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Brain Deposits" value={notes.length} icon={<Activity />} color="bg-purple-50 text-purple-600" onClick={() => setView({ type: 'IDEAS' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Momentum Section */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black tracking-tight">Project Momentum</h2>
              <button onClick={() => setView({ type: 'PROJECTS' })} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-gray-400">
                   No projects yet. Start by creating your first workspace.
                </div>
              ) : projects.slice(0, 4).map(project => (
                <div key={project.id} className="group cursor-pointer bg-gray-50/50 p-5 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100" onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-bold tracking-tight group-hover:text-blue-600 transition-colors">{project.title}</span>
                    <span className="font-black text-blue-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Zap size={18} className="text-amber-500" /> Quick Actions</h2>
              <div className="grid grid-cols-3 gap-4">
                <QuickAction label="New Project" icon={<Plus size={20} />} onClick={handleQuickProject} />
                <QuickAction label="New Idea" icon={<Activity size={20} />} onClick={handleQuickIdea} />
                <QuickAction label="Whiteboard" icon={<Share2 size={20} />} onClick={() => setView({ type: 'WHITEBOARD' })} />
              </div>
            </div>
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
               <h2 className="text-lg font-bold mb-6">Recent Connections</h2>
               <div className="space-y-4">
                  {assets.slice(0, 3).length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4 italic">No external links indexed yet.</p>
                  ) : assets.slice(0, 3).map(asset => (
                    <a key={asset.id} href={asset.url} target="_blank" className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                       <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-600"><ExternalLink size={14} /></div>
                       <span className="text-xs font-bold truncate">{asset.name}</span>
                    </a>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Task Analysis Section */}
        <div className="lg:col-span-4 bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 flex flex-col items-center">
          <div className="w-full mb-8">
            <h2 className="text-2xl font-black tracking-tight mb-2">Efficiency</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">System Load Balancing</p>
          </div>
          <div className="h-72 w-full relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={taskData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                  {taskData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black tracking-tighter">{pendingTasks + completedTasks}</span>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Actions</span>
            </div>
          </div>
          <div className="w-full mt-10 space-y-3">
             <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
               <span className="text-xs font-bold text-emerald-700 uppercase">Closed Loop</span>
               <span className="text-sm font-black text-emerald-700">{completedTasks}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
               <span className="text-xs font-bold text-blue-700 uppercase">Active Threads</span>
               <span className="text-sm font-black text-blue-700">{pendingTasks}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
