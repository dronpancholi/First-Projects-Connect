
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Task, Note, Asset, CodeSnippet, Whiteboard, CanvasElement, TaskStatus, ProjectStatus, Priority } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.ts';

interface StoreContextType {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  assets: Asset[];
  snippets: CodeSnippet[];
  whiteboards: Whiteboard[];
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

  addSnippet: (s: Omit<CodeSnippet, 'id' | 'updatedAt'>) => Promise<void>;
  updateSnippet: (id: string, code: string) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;

  addWhiteboard: (w: Omit<Whiteboard, 'id' | 'updatedAt'>) => Promise<void>;
  updateWhiteboard: (id: string, elements: CanvasElement[]) => Promise<void>;
  deleteWhiteboard: (id: string) => Promise<void>;
  
  getProjectProgress: (projectId: string) => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [needsInitialization, setNeedsInitialization] = useState(false);

  // High-performance defensive mapping functions
  const mapProject = useCallback((p: any): Project => ({ 
    id: p?.id || String(Math.random()),
    title: p?.title || 'Untitled Project',
    description: p?.description || '',
    status: (p?.status as ProjectStatus) || ProjectStatus.IDEA,
    progress: typeof p?.progress === 'number' ? p.progress : 0,
    tags: (() => {
      try {
        if (Array.isArray(p?.tags)) return p.tags;
        if (typeof p?.tags === 'string' && p.tags.trim() !== '') return JSON.parse(p.tags);
      } catch (e) {
        console.warn("FPC: Project tag parsing failed", e);
      }
      return [];
    })(),
    createdAt: p?.created_at ? new Date(p.created_at) : new Date()
  }), []);

  const mapTask = useCallback((t: any): Task => ({ 
    id: t?.id || String(Math.random()),
    projectId: t?.project_id || t?.projectId || '',
    title: t?.title || 'Untitled Task',
    status: (t?.status as TaskStatus) || TaskStatus.PENDING,
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
    name: a?.name || 'Linked Resource',
    type: a?.type || 'link',
    url: a?.url || '#',
    description: a?.description || ''
  }), []);

  const mapSnippet = useCallback((s: any): CodeSnippet => ({ 
    id: s?.id || String(Math.random()),
    title: s?.title || 'Untitled Script',
    language: s?.language || 'javascript',
    code: s?.code || '',
    folder: s?.folder || undefined,
    updatedAt: s?.updated_at ? new Date(s.updated_at) : new Date() 
  }), []);
  
  const mapWhiteboard = useCallback((w: any): Whiteboard => {
    let elements: CanvasElement[] = [];
    try {
      if (w?.elements) {
        const raw = typeof w.elements === 'string' ? JSON.parse(w.elements) : w.elements;
        elements = Array.isArray(raw) ? raw : [];
      }
    } catch (e) {
      console.error("FPC: Whiteboard element reconstruction failed", e);
    }
    return { 
      id: w?.id || String(Math.random()),
      title: w?.title || 'Untitled Whiteboard',
      elements: elements, 
      updatedAt: w?.updated_at ? new Date(w.updated_at) : new Date() 
    };
  }, []);

  const logError = (context: string, error: any) => {
    const message = error?.message || "Unknown communication error";
    if (message.includes('relation') || message.includes('does not exist') || message.includes('404')) {
      setNeedsInitialization(true);
    }
    console.error(`FPC System: [${context}]`, message, error);
    return message;
  };

  const fetchData = useCallback(async () => {
    if (!user || !isSupabaseConfigured() || !supabase) return;
    setIsLoading(true);
    try {
      const [p, t, n, a, s, w] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*'),
        supabase.from('notes').select('*').order('updated_at', { ascending: false }),
        supabase.from('assets').select('*'),
        supabase.from('snippets').select('*').order('updated_at', { ascending: false }),
        supabase.from('whiteboards').select('*').order('updated_at', { ascending: false }),
      ]);

      if (p.error) logError("FetchProjects", p.error);
      if (t.error) logError("FetchTasks", t.error);
      if (n.error) logError("FetchNotes", n.error);
      if (a.error) logError("FetchAssets", a.error);
      if (s.error) logError("FetchSnippets", s.error);
      if (w.error) logError("FetchWhiteboards", w.error);

      if (p.data) setProjects(p.data.map(mapProject));
      if (t.data) setTasks(t.data.map(mapTask));
      if (n.data) setNotes(n.data.map(mapNote));
      if (a.data) setAssets(a.data.map(mapAsset));
      if (s.data) setSnippets(s.data.map(mapSnippet));
      if (w.data) setWhiteboards(w.data.map(mapWhiteboard));
      setLastSyncTime(new Date());
    } catch (e) {
      logError("DataSync", e);
    } finally {
      setIsLoading(false);
    }
  }, [user, mapProject, mapTask, mapNote, mapAsset, mapSnippet, mapWhiteboard]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getProjectProgress = useCallback((projectId: string) => {
    const pTasks = tasks.filter(t => (t.projectId || (t as any).project_id) === projectId);
    if (pTasks.length === 0) return 0;
    const completed = pTasks.filter(t => t.status === TaskStatus.DONE).length;
    return Math.round((completed / pTasks.length) * 100);
  }, [tasks]);

  const syncWrapper = async (operation: () => Promise<void>, name: string) => {
    setIsSyncing(true);
    try {
      await operation();
      setLastSyncTime(new Date());
    } catch (e) {
      logError(name, e);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => (t.projectId || (t as any).project_id) !== id));
      setNotes(prev => prev.filter(n => (n.projectId || (n as any).project_id) !== id));
      setAssets(prev => prev.filter(a => (a.projectId || (a as any).project_id) !== id));
    }, "DeleteProject");
  };

  const deleteTask = async (id: string) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
    }, "DeleteTask");
  };

  const deleteNote = async (id: string) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== id));
    }, "DeleteNote");
  };

  const deleteAsset = async (id: string) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('assets').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setAssets(prev => prev.filter(a => a.id !== id));
    }, "DeleteAsset");
  };

  const deleteSnippet = async (id: string) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('snippets').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setSnippets(prev => prev.filter(s => s.id !== id));
    }, "DeleteSnippet");
  };

  const deleteWhiteboard = async (id: string) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('whiteboards').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setWhiteboards(prev => prev.filter(w => w.id !== id));
    }, "DeleteWhiteboard");
  };

  const addProject = async (p: Omit<Project, 'id' | 'createdAt' | 'progress'>) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { data, error } = await supabase.from('projects').insert({
        user_id: user.id, ...p, tags: JSON.stringify(p.tags)
      }).select().single();
      if (error) throw error;
      if (data) setProjects([mapProject(data), ...projects]);
    }, "AddProject");
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('projects').update(updates).eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, "UpdateProject");
  };

  const addTask = async (t: Omit<Task, 'id'>) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { data, error } = await supabase.from('tasks').insert({
        user_id: user.id, project_id: t.projectId, ...t
      }).select().single();
      if (error) throw error;
      if (data) setTasks([...tasks, mapTask(data)]);
    }, "AddTask");
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, "UpdateTask");
  };

  const addNote = async (n: Omit<Note, 'id' | 'updatedAt'>) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { data, error } = await supabase.from('notes').insert({
        user_id: user.id, project_id: n.projectId, ...n
      }).select().single();
      if (error) throw error;
      if (data) setNotes([mapNote(data), ...notes]);
    }, "AddNote");
  };

  const updateNote = async (id: string, content: string) => {
    if (!supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('notes').update({ content, updated_at: new Date() }).eq('id', id);
      if (error) throw error;
      setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: new Date() } : n));
    }, "UpdateNote");
  };

  const addAsset = async (a: Omit<Asset, 'id'>) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { data, error } = await supabase.from('assets').insert({
        user_id: user.id, project_id: a.projectId, ...a
      }).select().single();
      if (error) throw error;
      if (data) setAssets([...assets, mapAsset(data)]);
    }, "AddAsset");
  };

  const addSnippet = async (s: Omit<CodeSnippet, 'id' | 'updatedAt'>) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { data, error } = await supabase.from('snippets').insert({
        user_id: user.id, ...s
      }).select().single();
      if (error) throw error;
      if (data) setSnippets([mapSnippet(data), ...snippets]);
    }, "AddSnippet");
  };

  const updateSnippet = async (id: string, code: string) => {
    if (!supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('snippets').update({ code, updated_at: new Date() }).eq('id', id);
      if (error) throw error;
      setSnippets(prev => prev.map(s => s.id === id ? { ...s, code, updatedAt: new Date() } : s));
    }, "UpdateSnippet");
  };

  const addWhiteboard = async (w: Omit<Whiteboard, 'id' | 'updatedAt'>) => {
    if (!user || !supabase) return;
    await syncWrapper(async () => {
      const { data, error } = await supabase.from('whiteboards').insert({
        user_id: user.id, ...w, elements: JSON.stringify(w.elements)
      }).select().single();
      if (error) throw error;
      if (data) setWhiteboards([mapWhiteboard(data), ...whiteboards]);
    }, "AddWhiteboard");
  };

  const updateWhiteboard = async (id: string, elements: CanvasElement[]) => {
    if (!supabase) return;
    await syncWrapper(async () => {
      const { error } = await supabase.from('whiteboards').update({ 
        elements: JSON.stringify(elements), 
        updated_at: new Date() 
      }).eq('id', id);
      if (error) throw error;
      setWhiteboards(prev => prev.map(w => w.id === id ? { ...w, elements, updatedAt: new Date() } : w));
    }, "UpdateWhiteboard");
  };

  return (
    <StoreContext.Provider value={{
      projects, tasks, notes, assets, snippets, whiteboards, isLoading, isSyncing, lastSyncTime, needsInitialization,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addNote, updateNote, deleteNote,
      addAsset, deleteAsset,
      addSnippet, updateSnippet, deleteSnippet,
      addWhiteboard, updateWhiteboard, deleteWhiteboard,
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
