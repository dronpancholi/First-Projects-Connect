import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Project, Task, TaskStatus, Priority, AssetType } from '../types';
import { 
  ArrowLeft, Plus, CheckCircle2, Circle, Bot, FileText, 
  Link as LinkIcon, Github, X, ExternalLink, 
  Figma, Layout, Database, Wand2, AlertTriangle, Hash, Slack, ArrowRight
} from 'lucide-react';
import * as GeminiService from '../services/geminiService';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
      active 
        ? 'bg-apple-text text-white shadow-md' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

const IntegrationCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  color: string; 
  selected: boolean;
  onClick: () => void; 
}> = ({ icon, label, color, selected, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all h-28
      ${selected ? 'border-apple-blue bg-blue-50/50 ring-1 ring-apple-blue' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
    `}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 text-white ${color}`}>
      {icon}
    </div>
    <span className="text-xs font-medium text-gray-700">{label}</span>
  </div>
);

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const { projects, tasks, notes, assets, addTask, addNote, updateTask, updateNote, addAsset } = useStore();
  const project = projects.find(p => p.id === projectId);
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'assets'>('tasks');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('link');

  if (!project) return <div>Project not found</div>;

  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const projectNotes = notes.filter(n => n.projectId === projectId);
  const projectAssets = assets.filter(a => a.projectId === projectId);

  const handleTaskToggle = (task: Task) => {
    updateTask(task.id, {
      status: task.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE
    });
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    const plan = await GeminiService.generateProjectPlan(project.title, project.description);
    await addNote({
      title: 'AI Generated Project Plan',
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
        status: TaskStatus.PENDING,
        priority: task.priority
      });
    }
    setLoadingTaskId(null);
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

  const getAssetIcon = (type: AssetType) => {
    switch(type) {
      case 'github': return <Github size={20} />;
      case 'figma': return <Figma size={20} />;
      case 'google_drive': return <Database size={20} />;
      case 'notion': return <FileText size={20} />;
      case 'linear': return <Layout size={20} />;
      case 'slack': return <Slack size={20} />;
      default: return <LinkIcon size={20} />;
    }
  };

  const getAssetColor = (type: AssetType) => {
    switch(type) {
      case 'github': return 'bg-gray-800 text-white';
      case 'figma': return 'bg-purple-600 text-white';
      case 'google_drive': return 'bg-blue-600 text-white';
      case 'notion': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'linear': return 'bg-indigo-600 text-white';
      case 'slack': return 'bg-emerald-600 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 flex flex-col gap-4">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-black w-fit gap-1 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Projects
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{project.title}</h1>
            <p className="text-gray-500 max-w-2xl">{project.description}</p>
          </div>
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:shadow-md transition-all text-sm font-medium"
          >
            <Bot size={16} />
            Ask Gemini
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <TabButton label="Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <TabButton label="Notes" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
          <TabButton label="Assets & Integrations" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50/50 p-6">
        
        {/* TASKS VIEW */}
        {activeTab === 'tasks' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tasks ({projectTasks.filter(t => t.status !== TaskStatus.DONE).length} remaining)</h2>
              <button 
                onClick={() => addTask({ projectId, title: 'New Task', status: TaskStatus.PENDING, priority: Priority.MEDIUM })}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {projectTasks.length === 0 && (
                <div className="p-8 text-center text-gray-500">No tasks yet. Create one or use AI to generate a plan.</div>
              )}
              {projectTasks.map(task => (
                <div key={task.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors group">
                  <button onClick={() => handleTaskToggle(task)} className="mr-4 text-gray-400 hover:text-green-600 transition-colors">
                    {task.status === TaskStatus.DONE ? <CheckCircle2 className="text-green-600" size={22} /> : <Circle size={22} />}
                  </button>
                  <input 
                    className={`flex-1 bg-transparent outline-none ${task.status === TaskStatus.DONE ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                    value={task.title}
                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                  />
                  
                  {/* AI Breakdown Action */}
                  {task.status !== TaskStatus.DONE && (
                    <button 
                      onClick={() => handleBreakdownTask(task)}
                      disabled={loadingTaskId === task.id}
                      className={`
                        mx-2 p-1.5 rounded-lg transition-all
                        ${loadingTaskId === task.id ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 opacity-0 group-hover:opacity-100'}
                      `}
                      title="Break down with AI"
                    >
                      <Wand2 size={16} />
                    </button>
                  )}

                  <div className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide ${
                    task.priority === Priority.HIGH ? 'bg-red-50 text-red-600' :
                    task.priority === Priority.MEDIUM ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES VIEW */}
        {activeTab === 'notes' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => addNote({ projectId, title: 'New Note', content: '' })}
              className="aspect-[4/5] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-apple-blue hover:text-apple-blue cursor-pointer transition-all bg-white/50"
            >
              <Plus size={32} />
              <span className="mt-2 font-medium">Create Note</span>
            </div>
            {projectNotes.map(note => (
              <div key={note.id} className="aspect-[4/5] bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative group transition-transform hover:-translate-y-1">
                <input 
                  className="font-bold text-lg mb-4 outline-none w-full" 
                  value={note.title}
                  readOnly 
                />
                <textarea 
                  className="flex-1 resize-none outline-none text-gray-600 text-sm leading-relaxed"
                  value={note.content}
                  onChange={(e) => updateNote(note.id, e.target.value)}
                />
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <FileText size={14} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ASSETS VIEW */}
        {activeTab === 'assets' && (
          <div className="max-w-3xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-semibold">Connections</h2>
               <button 
                 onClick={() => setShowAssetModal(true)}
                 className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 shadow-md shadow-gray-200"
               >
                 <Plus size={16} /> Connect Resource
               </button>
             </div>

             {projectAssets.length === 0 ? (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                   <LinkIcon size={24} />
                 </div>
                 <h3 className="font-bold text-gray-900 mb-2">No connected apps</h3>
                 <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                   Connect external tools to centralize your workflow. Link GitHub repos, Figma files, Linear cycles, or Google Drive folders.
                 </p>
                 <button onClick={() => setShowAssetModal(true)} className="text-apple-blue font-medium text-sm hover:underline">Browse Integrations</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {projectAssets.map(asset => (
                   <a 
                    key={asset.id} 
                    href={asset.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group"
                   >
                     <div className={`p-3 rounded-lg ${getAssetColor(asset.type)}`}>
                       {getAssetIcon(asset.type)}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="font-medium text-gray-900 truncate">{asset.name}</h3>
                       <p className="text-xs text-gray-500 truncate mt-0.5 capitalize flex items-center gap-1">
                        {asset.type.replace('_', ' ')} <ArrowRight size={10} className="-rotate-45" />
                       </p>
                     </div>
                   </a>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>

      {/* Integration Hub Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg">Connect Resource</h3>
              <button onClick={() => setShowAssetModal(false)}><X size={20} className="text-gray-400 hover:text-black" /></button>
            </div>
            
            <div className="p-6 overflow-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
                <IntegrationCard 
                  icon={<Github />} label="GitHub" color="bg-gray-900" 
                  selected={assetType === 'github'} onClick={() => setAssetType('github')} 
                />
                <IntegrationCard 
                  icon={<Figma />} label="Figma" color="bg-purple-600" 
                  selected={assetType === 'figma'} onClick={() => setAssetType('figma')} 
                />
                <IntegrationCard 
                  icon={<Database />} label="Drive" color="bg-blue-600" 
                  selected={assetType === 'google_drive'} onClick={() => setAssetType('google_drive')} 
                />
                <IntegrationCard 
                  icon={<FileText />} label="Notion" color="bg-gray-800" 
                  selected={assetType === 'notion'} onClick={() => setAssetType('notion')} 
                />
                <IntegrationCard 
                  icon={<Layout />} label="Linear" color="bg-indigo-600" 
                  selected={assetType === 'linear'} onClick={() => setAssetType('linear')} 
                />
                <IntegrationCard 
                  icon={<Slack />} label="Slack" color="bg-emerald-600" 
                  selected={assetType === 'slack'} onClick={() => setAssetType('slack')} 
                />
                <IntegrationCard 
                  icon={<LinkIcon />} label="Website" color="bg-gray-400" 
                  selected={assetType === 'link'} onClick={() => setAssetType('link')} 
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Display Name</label>
                  <input 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                    placeholder={`e.g. Project ${assetType === 'github' ? 'Repository' : 'File'}`}
                    value={assetName}
                    onChange={e => setAssetName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Link URL</label>
                  <input 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                    placeholder="https://..."
                    value={assetUrl}
                    onChange={e => setAssetUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
               <button 
                onClick={handleAddAsset}
                disabled={!assetName || !assetUrl}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Connect Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all scale-100">
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
              <Bot size={24} />
              <h2 className="text-xl font-bold text-gray-900">Gemini Assistant</h2>
            </div>
            <p className="text-gray-600 mb-6">Tools for <strong>{project.title}</strong></p>
            
            <div className="space-y-3">
              <button 
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                  <Wand2 size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-indigo-700">Generate Plan</div>
                  <div className="text-xs text-gray-500 mt-0.5">Strategy note with tasks.</div>
                </div>
              </button>

              <button 
                disabled 
                className="w-full text-left p-4 rounded-xl border border-gray-200 opacity-60 flex items-center gap-4 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Risk Audit</div>
                  <div className="text-xs text-gray-500 mt-0.5">Coming soon...</div>
                </div>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-900 font-medium"
              >
                Close
              </button>
            </div>
            
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                  <span className="text-sm font-medium text-indigo-600">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;