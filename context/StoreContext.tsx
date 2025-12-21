
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Task, Note, Asset, Whiteboard, CanvasElement, TaskStatus, ProjectStatus, Priority, CodeSnippet } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.ts';

interface StoreContextType {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  assets: Asset[];
  whiteboards: Whiteboard[];
  snippets: CodeSnippet[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  needsInitialization: boolean;
  
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'progress'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  addTask: (t: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  addNote: (n: Omit<Note, 'id' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  addAsset: (a: Omit<Asset, 'id'>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

  addWhiteboard: (w: Omit<Whiteboard, 'id' | 'updatedAt'>) => Promise<void>;
  updateWhiteboard: (id: string, elements: CanvasElement[]) => Promise<void>;
  deleteWhiteboard: (id: string) => Promise<void>;

  addSnippet: (s: Omit<CodeSnippet, 'id' | 'updatedAt'>) => Promise<void>;
  updateSnippet: (id: string, code: string) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  
  getProjectProgress: (projectId: string) => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [needsInitialization, setNeedsInitialization] = useState(false);

  const mapProject = useCallback((p: any): Project => ({ 
    id: p?.id || String(Math.random()),
    title: p?.title || 'Untitled Project',
    description: p?.description || '',
    status: (p?.status as ProjectStatus) || ProjectStatus.IDEA,
    progress: typeof p?.progress === 'number' ? p.progress : 0,
    tags: Array.isArray(p?.tags) ? p.tags : [],
    createdAt: p?.created_at ? new Date(p.created_at) : new Date()
  }), []);

  const mapTask = useCallback((t: any): Task => ({ 
    id: t?.id || String(Math.random()),
    projectId: t?.project_id || t?.projectId || '',
    title: t?.title || 'Untitled Task',
    // Fix: Changed TaskStatus.PENDING to TaskStatus.TODO as PENDING is not in the enum
    status: (t?.status as TaskStatus) || TaskStatus.TODO,
    priority: (t?.priority as Priority) || Priority.MEDIUM,
    dueDate: t?.due_date ? new Date(t.due_date) : undefined
  }), []);

  const mapNote = useCallback((n: any): Note => ({ 
    id: n?.id || String(Math.random()),
    projectId: n?.project_id || n?.projectId || undefined,
    title: n?.title || 'Untitled Note',
    content: n?.content || '',
    updatedAt: n?.updated_at ? new Date(n.updated_at) : new Date()
  }), []);

  const mapAsset = useCallback((a: any): Asset => ({ 
    id: a?.id || String(Math.random()),
    projectId: a?.project_id || a?.projectId || '',
    name: a?.name || 'Resource',
    type: a?.type || 'link',
    url: a?.url || '#',
    description: a?.description || ''
  }), []);

  const mapWhiteboard = useCallback((w: any): Whiteboard => ({ 
    id: w?.id || String(Math.random()),
    title: w?.title || 'Untitled Whiteboard',
    elements: Array.isArray(w?.elements) ? w.elements : [], 
    updatedAt: w?.updated_at ? new Date(w.updated_at) : new Date() 
  }), []);

  const mapSnippet = useCallback((s: any): CodeSnippet => ({
    id: s?.id || String(Math.random()),
    title: s?.title || 'Untitled Script',
    language: s?.language || 'javascript',
    code: s?.code || '',
    folder: s?.folder || undefined,
    updatedAt: s?.updated_at ? new Date(s.updated_at) : new Date()
  }), []);

  const logError = (context: string, error: any) => {
    const message = error?.message || "Unknown error";
    if (message.includes('relation')) setNeedsInitialization(true);
    console.error(`FPC System: [${context}]`, message);
    return message;
  };

  const fetchData = useCallback(async () => {
    if (!user || !supabase) return;
    setIsLoading(true);
    try {
      const [p, t, n, a, w, s] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('notes').select('*'),
        supabase.from('assets').select('*'),
        supabase.from('whiteboards').select('*'),
        supabase.from('snippets').select('*'),
      ]);

      if (p.data) setProjects(p.data.map(mapProject));
      if (t.data) setTasks(t.data.map(mapTask));
      if (n.data) setNotes(n.data.map(mapNote));
      if (a.data) setAssets(a.data.map(mapAsset));
      if (w.data) setWhiteboards(w.data.map(mapWhiteboard));
      if (s.data) setSnippets(s.data.map(mapSnippet));
      setLastSyncTime(new Date());
    } catch (e) {
      logError("DataSync", e);
    } finally {
      setIsLoading(false);
    }
  }, [user, mapProject, mapTask, mapNote, mapAsset, mapWhiteboard, mapSnippet]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getProjectProgress = (projectId: string) => {
    const pTasks = tasks.filter(t => t.projectId === projectId);
    if (pTasks.length === 0) return 0;
    const completed = pTasks.filter(t => t.status === TaskStatus.DONE).length;
    return Math.round((completed / pTasks.length) * 100);
  };

  const syncWrapper = async (operation: () => Promise<void>) => {
    setIsSyncing(true);
    try {
      await operation();
      setLastSyncTime(new Date());
    } catch (e) {
      logError("Sync", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const addProject = async (p: any) => syncWrapper(async () => {
    const { data } = await supabase.from('projects').insert({ user_id: user?.id, ...p }).select().single();
    if (data) setProjects(prev => [mapProject(data), ...prev]);
  });

  const updateProject = async (id: string, updates: any) => syncWrapper(async () => {
    await supabase.from('projects').update(updates).eq('id', id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  });

  const deleteProject = async (id: string) => syncWrapper(async () => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
  });

  const addTask = async (t: any) => syncWrapper(async () => {
    const { data } = await supabase.from('tasks').insert({ user_id: user?.id, ...t, project_id: t.projectId }).select().single();
    if (data) setTasks(prev => [...prev, mapTask(data)]);
  });

  const updateTask = async (id: string, updates: any) => syncWrapper(async () => {
    await supabase.from('tasks').update(updates).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  });

  const deleteTask = async (id: string) => syncWrapper(async () => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  });

  const addNote = async (n: any) => syncWrapper(async () => {
    const { data } = await supabase.from('notes').insert({ user_id: user?.id, ...n, project_id: n.projectId }).select().single();
    if (data) setNotes(prev => [mapNote(data), ...prev]);
  });

  const updateNote = async (id: string, content: string) => syncWrapper(async () => {
    await supabase.from('notes').update({ content, updated_at: new Date() }).eq('id', id);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: new Date() } : n));
  });

  const deleteNote = async (id: string) => syncWrapper(async () => {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  });

  const addAsset = async (a: any) => syncWrapper(async () => {
    const { data } = await supabase.from('assets').insert({ user_id: user?.id, ...a, project_id: a.projectId }).select().single();
    if (data) setAssets(prev => [...prev, mapAsset(data)]);
  });

  const deleteAsset = async (id: string) => syncWrapper(async () => {
    await supabase.from('assets').delete().eq('id', id);
    setAssets(prev => prev.filter(a => a.id !== id));
  });

  const addWhiteboard = async (w: any) => syncWrapper(async () => {
    const { data } = await supabase.from('whiteboards').insert({ user_id: user?.id, ...w }).select().single();
    if (data) setWhiteboards(prev => [mapWhiteboard(data), ...prev]);
  });

  const updateWhiteboard = async (id: string, elements: any) => syncWrapper(async () => {
    await supabase.from('whiteboards').update({ elements, updated_at: new Date() }).eq('id', id);
    setWhiteboards(prev => prev.map(w => w.id === id ? { ...w, elements, updatedAt: new Date() } : w));
  });

  const deleteWhiteboard = async (id: string) => syncWrapper(async () => {
    await supabase.from('whiteboards').delete().eq('id', id);
    setWhiteboards(prev => prev.filter(w => w.id !== id));
  });

  const addSnippet = async (s: any) => syncWrapper(async () => {
    const { data } = await supabase.from('snippets').insert({ user_id: user?.id, ...s }).select().single();
    if (data) setSnippets(prev => [mapSnippet(data), ...prev]);
  });

  const updateSnippet = async (id: string, code: string) => syncWrapper(async () => {
    await supabase.from('snippets').update({ code, updated_at: new Date() }).eq('id', id);
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, code, updatedAt: new Date() } : s));
  });

  const deleteSnippet = async (id: string) => syncWrapper(async () => {
    await supabase.from('snippets').delete().eq('id', id);
    setSnippets(prev => prev.filter(s => s.id !== id));
  });

  return (
    <StoreContext.Provider value={{
      projects, tasks, notes, assets, whiteboards, snippets, isLoading, isSyncing, lastSyncTime, needsInitialization,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addNote, updateNote, deleteNote,
      addAsset, deleteAsset,
      addWhiteboard, updateWhiteboard, deleteWhiteboard,
      addSnippet, updateSnippet, deleteSnippet,
      getProjectProgress
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
