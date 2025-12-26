import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Project, Task, TaskStatus, Priority, AssetType, ProjectStatus } from '../types.ts';
import {
  ArrowLeft, Plus, CheckCircle2, Circle, Bot, FileText,
  Link as LinkIcon, Github, X, Trash2,
  Figma, Wand2, Slack, ArrowRight,
  Server, AlertTriangle, ListFilter,
  Clock, Loader2
} from 'lucide-react';
import * as GeminiService from '../services/geminiService.ts';
import { GlassPanel, GlassCard, GlassModal, GlassButton, GlassInput, GlassBadge } from './ui/LiquidGlass.tsx';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${active
      ? 'glass-card bg-purple-500/20 text-glass-primary border-purple-500/50'
      : 'text-glass-secondary hover:text-glass-primary hover:bg-glass-subtle'
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
      <h2 className="text-2xl font-bold text-glass-primary">Project Not Found</h2>
      <p className="text-glass-secondary mt-2">The requested project doesn't exist.</p>
      <GlassButton onClick={onBack} variant="primary" className="mt-8">
        Return to Projects
      </GlassButton>
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
      title: 'AI Generated Plan',
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
    switch (type) {
      case 'github': return { icon: <Github size={18} />, color: 'bg-gray-700' };
      case 'vercel': return { icon: <Server size={18} />, color: 'bg-black' };
      case 'figma': return { icon: <Figma size={18} />, color: 'bg-purple-600' };
      case 'slack': return { icon: <Slack size={18} />, color: 'bg-green-600' };
      case 'openai': return { icon: <Bot size={18} />, color: 'bg-green-500' };
      default: return { icon: <LinkIcon size={18} />, color: 'bg-blue-500' };
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <GlassPanel className="mb-6">
        <div className="p-6 lg:px-10 space-y-6 relative z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-glass-secondary hover:text-glass-primary transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Projects
            </button>
            <GlassButton
              onClick={() => setShowAIModal(true)}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Bot size={16} className="animate-pulse" /> AI Assistant
            </GlassButton>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <GlassBadge variant={project.status === ProjectStatus.ACTIVE ? 'success' : 'default'}>
                  {project.status}
                </GlassBadge>

                {/* Tags */}
                {project.tags?.map(tag => (
                  <button
                    key={tag}
                    onClick={() => removeTag(tag)}
                    className="group flex items-center gap-1.5 px-3 py-1 glass-card-subtle rounded-full text-xs font-medium text-glass-secondary hover:text-red-500 transition-all"
                  >
                    {tag}
                    <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}

                {isAddingTag ? (
                  <input
                    autoFocus
                    className="glass-input px-3 py-1 text-xs w-24 rounded-full"
                    placeholder="Tag..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onBlur={handleAddTag}
                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  />
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="p-1.5 text-glass-muted hover:text-purple-500 transition-colors rounded-lg hover:bg-purple-500/10"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              <h1 className="text-3xl font-bold text-glass-primary tracking-tight">{project.title}</h1>
              <p className="text-glass-secondary text-sm">{project.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <TabButton label="Tasks" icon={<ListFilter size={14} />} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
            <TabButton label="Notes" icon={<FileText size={14} />} active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
            <TabButton label="Assets" icon={<LinkIcon size={14} />} active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
          </div>
        </div>
      </GlassPanel>

      {/* Main Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">

        {/* TASKS VIEW */}
        {activeTab === 'tasks' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-glass-primary">Tasks</h2>
                <div className="flex glass-card-subtle p-1 rounded-xl">
                  {(['PENDING', 'DONE', 'ALL'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${taskFilter === f ? 'glass-card text-glass-primary' : 'text-glass-secondary hover:text-glass-primary'
                        }`}
                    >
                      {f === 'PENDING' ? 'Active' : f === 'DONE' ? 'Complete' : 'All'}
                    </button>
                  ))}
                </div>
              </div>
              <GlassButton
                onClick={() => addTask({ projectId, title: 'New task...', status: TaskStatus.TODO, priority: Priority.MEDIUM })}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus size={14} /> Add Task
              </GlassButton>
            </div>

            <GlassPanel>
              <div className="divide-y divide-glass-border-subtle relative z-10">
                {projectTasks.length === 0 && (
                  <div className="py-16 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-glass-muted mb-4" />
                    <p className="text-glass-secondary">No tasks to show</p>
                  </div>
                )}
                {projectTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-glass-subtle transition-all group">
                    <button
                      onClick={() => handleTaskToggle(task)}
                      className={`transition-all ${task.status === TaskStatus.DONE ? 'text-green-500' : 'text-glass-muted hover:text-purple-500'}`}
                    >
                      {task.status === TaskStatus.DONE ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <input
                      className={`flex-1 bg-transparent outline-none text-sm font-medium transition-all ${task.status === TaskStatus.DONE ? 'text-glass-muted line-through' : 'text-glass-primary'
                        }`}
                      value={task.title}
                      placeholder="Task description..."
                      onChange={(e) => updateTask(task.id, { title: e.target.value })}
                    />

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.status !== TaskStatus.DONE && (
                        <button
                          onClick={() => handleBreakdownTask(task)}
                          disabled={loadingTaskId === task.id}
                          className={`p-2 rounded-lg transition-all ${loadingTaskId === task.id
                            ? 'bg-purple-500/10 text-purple-500 animate-pulse'
                            : 'text-glass-muted hover:bg-purple-500/10 hover:text-purple-500'
                            }`}
                          title="AI Breakdown"
                        >
                          <Wand2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => { if (confirm('Delete task?')) deleteTask(task.id); }}
                        className="p-2 rounded-lg text-glass-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <GlassBadge
                      variant={
                        task.priority === Priority.HIGH ? 'danger' :
                          task.priority === Priority.MEDIUM ? 'warning' : 'default'
                      }
                    >
                      {task.priority}
                    </GlassBadge>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        )}

        {/* NOTES VIEW */}
        {activeTab === 'notes' && (
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => addNote({ projectId, title: 'New Note', content: '' })}
                className="aspect-[4/5] glass-card-subtle border-2 border-dashed border-glass-border rounded-2xl flex flex-col items-center justify-center text-glass-muted hover:border-purple-500/50 hover:text-purple-500 hover:bg-purple-500/10 cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-xl glass-card flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus size={28} />
                </div>
                <span className="text-sm font-medium">Add Note</span>
              </button>

              {projectNotes.map(note => (
                <GlassCard key={note.id} className="aspect-[4/5] group">
                  <div className="p-5 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <input
                        className="font-semibold text-glass-primary outline-none w-full bg-transparent"
                        value={note.title}
                        placeholder="Title..."
                        onChange={(e) => updateNote(note.id, e.target.value)}
                      />
                      <button
                        onClick={() => { if (confirm('Delete note?')) deleteNote(note.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-glass-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <textarea
                      className="flex-1 resize-none outline-none text-glass-secondary text-sm leading-relaxed custom-scrollbar bg-transparent"
                      placeholder="Write something..."
                      value={note.content}
                      onChange={(e) => updateNote(note.id, e.target.value)}
                    />
                    <div className="mt-4 pt-3 border-t border-glass-border-subtle flex items-center text-xs text-glass-muted">
                      <Clock size={12} className="mr-1.5" />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* ASSETS VIEW */}
        {activeTab === 'assets' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-glass-primary">Connected Resources</h2>
              <GlassButton
                onClick={() => setShowAssetModal(true)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus size={14} /> Add Asset
              </GlassButton>
            </div>

            {projectAssets.length === 0 ? (
              <div className="glass-card-subtle p-16 text-center rounded-3xl border-2 border-dashed border-glass-border">
                <LinkIcon size={48} className="mx-auto text-glass-muted mb-6" />
                <h3 className="text-lg font-semibold text-glass-secondary mb-2">No assets yet</h3>
                <p className="text-sm text-glass-muted mb-6 max-w-sm mx-auto">
                  Connect external tools, repos, and design files.
                </p>
                <GlassButton variant="primary" onClick={() => setShowAssetModal(true)}>
                  Add First Asset
                </GlassButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectAssets.map(asset => {
                  const config = getAssetConfig(asset.type);
                  return (
                    <GlassCard key={asset.id} className="group">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-5 relative z-10"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-lg ${config.color}`}>
                            {config.icon}
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); if (confirm('Remove asset?')) deleteAsset(asset.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-glass-muted hover:text-red-500 transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <h3 className="font-semibold text-glass-primary truncate mb-1">{asset.name}</h3>
                        <p className="text-xs text-glass-secondary uppercase">{asset.type}</p>
                        <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium mt-4 opacity-0 group-hover:opacity-100 transition-all">
                          Open <ArrowRight size={12} />
                        </div>
                      </a>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <GlassModal onClose={() => setShowAIModal(false)}>
          <div className="p-8 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                <Bot size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-glass-primary">AI Assistant</h2>
                <p className="text-sm text-glass-secondary">Generate plans for {project.title}</p>
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full text-left p-6 glass-card rounded-2xl hover:bg-purple-500/20 transition-all group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Wand2 size={22} />
              </div>
              <div>
                <div className="font-semibold text-glass-primary">Generate Project Plan</div>
                <div className="text-xs text-glass-secondary">AI-powered roadmap and strategy</div>
              </div>
              {isGenerating && <Loader2 className="ml-auto animate-spin text-purple-400" size={20} />}
            </button>

            <div className="mt-6 flex justify-center">
              <GlassButton onClick={() => setShowAIModal(false)}>
                Cancel
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Asset Connection Modal */}
      {showAssetModal && (
        <GlassModal onClose={() => setShowAssetModal(false)}>
          <div className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-glass-primary">Add Asset</h3>
                <p className="text-sm text-glass-secondary mt-1">Connect an external resource</p>
              </div>
              <button onClick={() => setShowAssetModal(false)} className="p-2 text-glass-muted hover:text-glass-primary transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Name</label>
                <GlassInput
                  placeholder="e.g. Main Repository"
                  value={assetName}
                  onChange={e => setAssetName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">URL</label>
                <GlassInput
                  placeholder="https://..."
                  value={assetUrl}
                  onChange={e => setAssetUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <GlassButton onClick={() => setShowAssetModal(false)}>
                Cancel
              </GlassButton>
              <GlassButton onClick={handleAddAsset} variant="primary">
                Add Asset
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};

export default ProjectDetail;
