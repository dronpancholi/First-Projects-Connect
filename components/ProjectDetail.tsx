
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Project, Task, TaskStatus, Priority, AssetType, ProjectStatus } from '../types.ts';
import { 
  ArrowLeft, Plus, CheckCircle2, Circle, Bot, FileText, 
  Link as LinkIcon, Github, X, Trash2,
  Figma, Layout, Database, Wand2, Slack, ArrowRight,
  Trello, Video, GitBranch, Server, Cloud, CreditCard, Box, MessageSquare, AlertTriangle, ListFilter,
  CheckCircle, ChevronRight, Share2, MoreHorizontal,
  Clock, Loader2, Tag
} from 'lucide-react';
import * as GeminiService from '../services/geminiService.ts';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all btn-tactile ${
      active 
        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const { projects, tasks, notes, assets, addTask, addNote, updateTask, updateNote, addAsset, deleteTask, deleteNote, deleteAsset, updateProject } = useStore();
  const project = projects.find(p => p.id === projectId);
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'assets'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'PENDING' | 'DONE'>('PENDING');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // Tag Management State
  const [tagInput, setTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('link');

  if (!project) return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
      <AlertTriangle size={48} className="text-amber-500 mb-4" />
      <h2 className="text-2xl font-black tracking-tighter">Node Not Found</h2>
      <p className="text-slate-500 mt-2 font-medium">The requested project ID is not registered in the network.</p>
      <button onClick={onBack} className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">Return to Hub</button>
    </div>
  );

  const projectTasks = tasks.filter(t => {
    if (t.projectId !== projectId) return false;
    if (taskFilter === 'PENDING') return t.status !== TaskStatus.DONE;
    if (taskFilter === 'DONE') return t.status === TaskStatus.DONE;
    return true;
  });

  const projectNotes = notes.filter(n => n.projectId === projectId);
  const projectAssets = assets.filter(a => a.projectId === projectId);

  const handleTaskToggle = (task: Task) => {
    updateTask(task.id, {
      status: task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE
    });
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    const plan = await GeminiService.generateProjectPlan(project.title, project.description);
    await addNote({
      title: 'Architectural Blueprint',
      content: plan,
      projectId: project.id
    });
    setIsGenerating(false);
    setShowAIModal(false);
    setActiveTab('notes');
  };

  const handleBreakdownTask = async (task: Task) => {
    setLoadingTaskId(task.id);
    const subtasks = await GeminiService.suggestSubtasks(task.title);
    for (const st of subtasks) {
      await addTask({
        projectId,
        title: st,
        status: TaskStatus.TODO,
        priority: task.priority
      });
    }
    setLoadingTaskId(null);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) {
      setIsAddingTag(false);
      return;
    }
    const currentTags = project.tags || [];
    if (!currentTags.includes(tagInput.trim())) {
      updateProject(project.id, { tags: [...currentTags, tagInput.trim()] });
    }
    setTagInput('');
    setIsAddingTag(false);
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = project.tags || [];
    updateProject(project.id, { tags: currentTags.filter(t => t !== tagToRemove) });
  };

  const handleAddAsset = async () => {
    if (!assetName || !assetUrl) return;
    await addAsset({
      projectId,
      name: assetName,
      url: assetUrl,
      type: assetType,
      description: 'Connected resource'
    });
    setAssetName('');
    setAssetUrl('');
    setAssetType('link');
    setShowAssetModal(false);
  };

  const getAssetConfig = (type: AssetType) => {
    switch(type) {
      case 'github': return { icon: <Github size={18} />, color: 'bg-slate-900' };
      case 'vercel': return { icon: <Server size={18} />, color: 'bg-black' };
      case 'figma': return { icon: <Figma size={18} />, color: 'bg-indigo-600' };
      case 'slack': return { icon: <Slack size={18} />, color: 'bg-emerald-600' };
      case 'openai': return { icon: <Bot size={18} />, color: 'bg-emerald-500' };
      default: return { icon: <LinkIcon size={18} />, color: 'bg-slate-400' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      {/* Dynamic Workspace Header */}
      <div className="border-b border-slate-100 p-10 lg:px-16 space-y-8 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black text-[10px] uppercase tracking-widest btn-tactile">
            <ArrowLeft size={16} /> Hub Registry
          </button>
          <div className="flex items-center gap-4">
             <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors btn-tactile"><Share2 size={18} /></button>
             <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors btn-tactile"><MoreHorizontal size={18} /></button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                project.status === ProjectStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
               }`}>
                 Node Active
               </span>
               <div className="h-4 w-px bg-slate-200 mx-1" />
               
               {/* Multi-Tag Container */}
               <div className="flex flex-wrap items-center gap-2">
                 {project.tags?.map(tag => (
                   <button 
                    key={tag}
                    onClick={() => removeTag(tag)}
                    className="group flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-rose-200 hover:text-rose-500 transition-all"
                   >
                     {tag}
                     <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                 ))}
                 
                 {isAddingTag ? (
                   <input 
                    autoFocus
                    className="bg-white border border-indigo-200 rounded-full px-3 py-0.5 text-[9px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-50 w-24"
                    placeholder="TAG NAME..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onBlur={handleAddTag}
                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                   />
                 ) : (
                   <button 
                    onClick={() => setIsAddingTag(true)}
                    className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
                   >
                     <Plus size={14} />
                   </button>
                 )}
               </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">{project.title}</h1>
            <p className="text-base text-slate-500 font-medium leading-relaxed">{project.description}</p>
          </div>
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-3 px-8 py-5 bg-white border-2 border-slate-100 text-indigo-600 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-100 transition-all text-xs font-black uppercase tracking-widest btn-tactile shadow-xl"
          >
            <Bot size={22} className="text-indigo-600 animate-pulse" />
            Launch Assistant
          </button>
        </div>

        <div className="flex items-center gap-3 pt-4 overflow-x-auto no-scrollbar pb-2">
          <TabButton label="Operations" icon={<ListFilter size={16}/>} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <TabButton label="Knowledge" icon={<FileText size={16}/>} active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
          <TabButton label="Infrastructure" icon={<LinkIcon size={16}/>} active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
        </div>
      </div>

      {/* Main Active Canvas */}
      <div className="flex-1 overflow-auto bg-white p-10 lg:p-16 custom-scrollbar">
        
        {/* OPERATIONS VIEW */}
        {activeTab === 'tasks' && (
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Mission Tasks</h2>
                <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200">
                  {(['PENDING', 'DONE', 'ALL'] as const).map(f => (
                     <button
                        key={f}
                        onClick={() => setTaskFilter(f)}
                        className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${taskFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       {f === 'PENDING' ? 'Active' : f === 'DONE' ? 'Verified' : 'All'}
                     </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => addTask({ projectId, title: 'New objective...', status: TaskStatus.TODO, priority: Priority.MEDIUM })}
                className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all btn-tactile shadow-xl"
              >
                <Plus size={16} /> New Objective
              </button>
            </div>
            
            <div className="space-y-4">
              {projectTasks.length === 0 && (
                <div className="py-32 text-center border-4 border-dashed border-slate-50 rounded-[3rem]">
                  <CheckCircle size={48} className="mx-auto text-slate-100 mb-6" />
                  <p className="text-sm font-black text-slate-300 uppercase tracking-widest opacity-60">All mission targets achieved</p>
                </div>
              )}
              {projectTasks.map(task => (
                <div key={task.id} className="flex items-center gap-6 p-6 hover:bg-slate-50/80 rounded-[2rem] transition-all group border border-transparent hover:border-slate-200">
                  <button onClick={() => handleTaskToggle(task)} className={`transition-all btn-tactile ${task.status === TaskStatus.DONE ? 'text-emerald-500' : 'text-slate-200 hover:text-indigo-400'}`}>
                    {task.status === TaskStatus.DONE ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                  </button>
                  <input 
                    className={`flex-1 bg-transparent outline-none text-base font-bold tracking-tight transition-all ${task.status === TaskStatus.DONE ? 'text-slate-300 line-through' : 'text-slate-900'}`}
                    value={task.title}
                    placeholder="Describe objective..."
                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                  />
                  
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status !== TaskStatus.DONE && (
                      <button 
                        onClick={() => handleBreakdownTask(task)}
                        disabled={loadingTaskId === task.id}
                        className={`p-2.5 rounded-xl transition-all ${loadingTaskId === task.id ? 'bg-indigo-50 text-indigo-600 animate-pulse' : 'text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        title="AI Breakdown"
                      >
                        <Wand2 size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => { if(confirm('Abort objective?')) deleteTask(task.id); }}
                      className="p-2.5 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                    task.priority === Priority.HIGH ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    task.priority === Priority.MEDIUM ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KNOWLEDGE VIEW */}
        {activeTab === 'notes' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              <div 
                onClick={() => addNote({ projectId, title: 'Untitled Intel', content: '' })}
                className="aspect-[4/5] rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 cursor-pointer transition-all bg-slate-50 group btn-tactile"
              >
                <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <span className="mt-6 font-black text-xs uppercase tracking-widest">New Intelligence Note</span>
              </div>
              {projectNotes.map(note => (
                <div key={note.id} className="aspect-[4/5] bg-white rounded-[3rem] shadow-sm border border-slate-200 p-10 flex flex-col relative group hover:shadow-2xl transition-all hover:border-indigo-100">
                  <div className="flex justify-between items-start mb-6">
                    <input 
                      className="font-black text-xl outline-none w-full bg-transparent text-slate-900 tracking-tight leading-none" 
                      value={note.title}
                      placeholder="Title..."
                      onChange={(e) => updateNote(note.id, e.target.value)}
                    />
                    <button 
                      onClick={() => { if(confirm('Purge knowledge?')) deleteNote(note.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2.5 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <textarea 
                    className="flex-1 resize-none outline-none text-slate-500 text-sm font-medium leading-relaxed custom-scrollbar bg-transparent"
                    placeholder="Capture insights..."
                    value={note.content}
                    onChange={(e) => updateNote(note.id, e.target.value)}
                  />
                  <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock size={12}/> {new Date(note.updatedAt).toLocaleDateString()}</span>
                    <FileText size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INFRASTRUCTURE VIEW */}
        {activeTab === 'assets' && (
          <div className="max-w-6xl mx-auto space-y-12">
             <div className="flex justify-between items-center pb-8 border-b border-slate-100">
               <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Connected Infrastructure</h2>
               <button 
                 onClick={() => setShowAssetModal(true)}
                 className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl btn-tactile"
               >
                 <Plus size={18} /> Connect Pipeline
               </button>
             </div>

             {projectAssets.length === 0 ? (
               <div className="bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 p-24 text-center">
                 <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-inner">
                   <LinkIcon size={40} />
                 </div>
                 <h3 className="font-black text-2xl text-slate-900 tracking-tighter mb-4">No connected nodes</h3>
                 <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto font-medium">
                   Unify your workflow by connecting external tools, design files, and deployment pipelines.
                 </p>
                 <button onClick={() => setShowAssetModal(true)} className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Link Primary Source</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {projectAssets.map(asset => {
                   const config = getAssetConfig(asset.type);
                   return (
                     <div key={asset.id} className="relative group">
                       <a 
                         href={asset.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all flex flex-col gap-6 hover:border-indigo-100"
                       >
                         <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg ${config.color}`}>
                           {config.icon}
                         </div>
                         <div>
                           <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">{asset.name}</h3>
                           <p className="text-[10px] text-slate-400 font-bold truncate mt-1 uppercase tracking-widest">
                             {asset.type.replace('_', ' ')} Registry
                           </p>
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                            Engage Node <ArrowRight size={12} />
                         </div>
                       </a>
                       <button 
                         onClick={(e) => { e.preventDefault(); if(confirm('Disconnect pipeline?')) deleteAsset(asset.id); }}
                         className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-3 bg-white shadow-xl border border-slate-100 rounded-2xl text-slate-300 hover:text-rose-500 transition-all btn-tactile"
                       >
                         <X size={16} />
                       </button>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        )}
      </div>

      {/* Strategic Assistant Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[200] p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl p-12 transform transition-all border border-white/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                 <Bot size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">AI Architect</h2>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Active Strategic Support</p>
              </div>
            </div>
            
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">I am analyzing the objectives of <strong>{project.title}</strong>. Choose a strategic action to execute.</p>
            
            <div className="space-y-4">
              <button 
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="w-full text-left p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group flex items-center gap-6 btn-tactile shadow-sm hover:shadow-2xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                  <Wand2 size={24} />
                </div>
                <div>
                  <div className="font-black text-slate-900 group-hover:text-indigo-900 text-lg tracking-tight">Generate Architecture</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Full mission plan & strategy</div>
                </div>
              </button>
            </div>

            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => setShowAIModal(false)}
                className="px-8 py-4 text-slate-400 font-black hover:text-slate-900 text-xs uppercase tracking-widest transition-colors btn-tactile"
              >
                Abort Assistant
              </button>
            </div>
            
            {isGenerating && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-[4rem] animate-in fade-in">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                     <div className="absolute inset-0 blur-3xl bg-indigo-400 opacity-20 animate-pulse" />
                     <Loader2 className="animate-spin text-indigo-600" size={48} />
                  </div>
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] animate-pulse">Synthesizing Logic</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Asset Connection Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl border border-white/20">
              <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                 <div>
                   <h3 className="font-black text-3xl text-slate-900 tracking-tighter leading-none mb-2">Connect Infrastructure</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link external nodes to this workspace</p>
                 </div>
                 <button onClick={() => setShowAssetModal(false)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors btn-tactile"><X size={32}/></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="space-y-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Registry Name</label>
                   <input 
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all text-lg font-black tracking-tight"
                    placeholder="Primary Repo / Design System"
                    value={assetName}
                    onChange={e => setAssetName(e.target.value)}
                   />
                 </div>
                 <div className="space-y-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Endpoint URL</label>
                   <input 
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none transition-all text-sm font-mono tracking-tight"
                    placeholder="https://..."
                    value={assetUrl}
                    onChange={e => setAssetUrl(e.target.value)}
                   />
                 </div>
              </div>
              <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-6">
                 <button onClick={() => setShowAssetModal(false)} className="px-8 py-4 text-slate-400 font-black hover:text-slate-900 uppercase tracking-widest text-xs btn-tactile">Cancel</button>
                 <button onClick={handleAddAsset} className="px-12 py-4 bg-slate-900 text-white font-black rounded-3xl hover:bg-black uppercase tracking-widest text-xs shadow-2xl btn-tactile">Establish Link</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
