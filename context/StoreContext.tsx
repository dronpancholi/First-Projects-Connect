
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Task, Note, Asset, CodeSnippet, Whiteboard, CanvasElement, TaskStatus } from '../types.ts';
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
  needsInitialization: boolean;
  
  // Actions
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
  
  // Computed
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
  const [needsInitialization, setNeedsInitialization] = useState(false);

  // Helper to map DB response to types
  const mapProject = (p: any): Project => ({ ...p, createdAt: new Date(p.created_at) });
  const mapTask = (t: any): Task => ({ ...t, dueDate: t.due_date ? new Date(t.due_date) : undefined, projectId: t.project_id });
  const mapNote = (n: any): Note => ({ ...n, updatedAt: new Date(n.updated_at), projectId: n.project_id });
  const mapAsset = (a: any): Asset => ({ ...a, projectId: a.project_id });
  const mapSnippet = (s: any): CodeSnippet => ({ ...s, updatedAt: new Date(s.updated_at) });
  const mapWhiteboard = (w: any): Whiteboard => ({ ...w, updatedAt: new Date(w.updated_at) });

  const logError = (context: string, error: any) => {
    const code = error?.code;
    const message = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
    
    if (code === '42P01' || message.includes('schema cache') || message.includes('does not exist')) {
      if (!needsInitialization) {
        console.warn(`${context}: Table missing. System initialization required.`);
        setNeedsInitialization(true);
      }
      return 'INITIALIZATION_REQUIRED';
    }

    console.error(`${context}:`, message, error?.details || '');
    return message;
  };

  const fetchData = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return;
    setIsLoading(true);
    
    try {
      const results = await Promise.allSettled([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*'),
        supabase.from('notes').select('*').order('updated_at', { ascending: false }),
        supabase.from('assets').select('*'),
        supabase.from('snippets').select('*').order('updated_at', { ascending: false }),
        supabase.from('whiteboards').select('*').order('updated_at', { ascending: false }),
      ]);

      const [pRes, tRes, nRes, aRes, sRes, wRes] = results;

      if (pRes.status === 'fulfilled' && pRes.value.data) setProjects(pRes.value.data.map(mapProject));
      if (tRes.status === 'fulfilled' && tRes.value.data) setTasks(tRes.value.data.map(mapTask));
      if (nRes.status === 'fulfilled' && nRes.value.data) setNotes(nRes.value.data.map(mapNote));
      if (aRes.status === 'fulfilled' && aRes.value.data) setAssets(aRes.value.data.map(mapAsset));
      if (sRes.status === 'fulfilled' && sRes.value.data) setSnippets(sRes.value.data.map(mapSnippet));
      if (wRes.status === 'fulfilled' && wRes.value.data) setWhiteboards(wRes.value.data.map(mapWhiteboard));
      
      const resArray = [pRes, tRes, nRes, aRes, sRes, wRes];
      const tableNames = ['projects', 'tasks', 'notes', 'assets', 'snippets', 'whiteboards'];
      
      resArray.forEach((res, i) => {
        if (res.status === 'fulfilled' && res.value.error) {
           logError(`Fetch Table ${tableNames[i]} Error`, res.value.error);
        }
      });

    } catch (e) {
      logError("Critical error fetching data", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getProjectProgress = useCallback((projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    return Math.round((completed / projectTasks.length) * 100);
  }, [tasks]);

  useEffect(() => {
    setProjects(prev => {
      const updated = prev.map(p => ({
        ...p,
        progress: getProjectProgress(p.id)
      }));
      const hasChanged = updated.some((p, i) => p.progress !== prev[i].progress);
      return hasChanged ? updated : prev;
    });
  }, [tasks, getProjectProgress]);

  const addProject = async (p: Omit<Project, 'id' | 'createdAt' | 'progress'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('projects').insert({
      user_id: user.id,
      title: p.title,
      description: p.description,
      status: p.status,
      tags: p.tags,
      progress: 0
    }).select().single();

    if (data && !error) {
      setProjects([mapProject(data), ...projects]);
    } else if (error) {
      const msg = logError("Add Project Error", error);
      if (msg === 'INITIALIZATION_REQUIRED') {
        alert("Database tables missing. Please run the SQL Schema in Settings.");
      } else {
        alert(`Failed to create project: ${msg}`);
      }
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const { error } = await supabase.from('projects').update({
      title: updates.title,
      description: updates.description,
      status: updates.status,
      tags: updates.tags
    }).eq('id', id);
    if (error) logError("Update Project Error", error);
  };

  const deleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) logError("Delete Project Error", error);
  };

  const addTask = async (t: Omit<Task, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      project_id: t.projectId,
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.dueDate
    }).select().single();

    if (data && !error) {
      setTasks([...tasks, mapTask(data)]);
    } else if (error) {
      logError("Add Task Error", error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const { error } = await supabase.from('tasks').update({
      title: updates.title,
      status: updates.status,
      priority: updates.priority,
      due_date: updates.dueDate
    }).eq('id', id);
    if (error) logError("Update Task Error", error);
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) logError("Delete Task Error", error);
  };

  const addNote = async (n: Omit<Note, 'id' | 'updatedAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('notes').insert({
      user_id: user.id,
      project_id: n.projectId,
      title: n.title,
      content: n.content
    }).select().single();

    if (data && !error) {
      setNotes([mapNote(data), ...notes]);
    } else if (error) {
      logError("Add Note Error", error);
    }
  };

  const updateNote = async (id: string, content: string) => {
    const now = new Date();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: now } : n));
    const { error } = await supabase.from('notes').update({ content, updated_at: now }).eq('id', id);
    if (error) logError("Update Note Error", error);
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) logError("Delete Note Error", error);
  };

  const addAsset = async (a: Omit<Asset, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('assets').insert({
      user_id: user.id,
      project_id: a.projectId,
      name: a.name,
      type: a.type,
      url: a.url,
      description: a.description
    }).select().single();

    if (data && !error) {
      setAssets([...assets, mapAsset(data)]);
    } else if (error) {
      const msg = logError("Add Asset Error", error);
      alert(`Connection failed: ${msg}`);
    }
  };

  const deleteAsset = async (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) logError("Delete Asset Error", error);
  };

  const addSnippet = async (s: Omit<CodeSnippet, 'id' | 'updatedAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('snippets').insert({
      user_id: user.id,
      title: s.title,
      language: s.language,
      code: s.code,
      folder: s.folder
    }).select().single();
    if (data && !error) {
      setSnippets([mapSnippet(data), ...snippets]);
    } else if (error) {
       const msg = logError("Add Snippet Error", error);
       if (msg === 'INITIALIZATION_REQUIRED') {
         alert("Snippet table missing. Run the SQL Schema in Settings.");
       } else {
         alert(`Failed to create snippet: ${msg}`);
       }
    }
  };

  const updateSnippet = async (id: string, code: string) => {
    const now = new Date();
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, code, updatedAt: now } : s));
    const { error } = await supabase.from('snippets').update({ code, updated_at: now }).eq('id', id);
    if (error) logError("Update Snippet Error", error);
  };

  const deleteSnippet = async (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('snippets').delete().eq('id', id);
    if (error) logError("Delete Snippet Error", error);
  };

  const addWhiteboard = async (w: Omit<Whiteboard, 'id' | 'updatedAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('whiteboards').insert({
      user_id: user.id,
      title: w.title,
      elements: w.elements
    }).select().single();
    if (data && !error) {
      setWhiteboards([mapWhiteboard(data), ...whiteboards]);
    } else if (error) {
      const msg = logError("Add Whiteboard Error", error);
      if (msg === 'INITIALIZATION_REQUIRED') {
        alert("Whiteboard table missing. Run the SQL Schema in Settings.");
      }
    }
  };

  const updateWhiteboard = async (id: string, elements: CanvasElement[]) => {
    const now = new Date();
    setWhiteboards(prev => prev.map(w => w.id === id ? { ...w, elements, updatedAt: now } : w));
    const { error } = await supabase.from('whiteboards').update({ elements, updated_at: now }).eq('id', id);
    if (error) logError("Update Whiteboard Error", error);
  };

  const deleteWhiteboard = async (id: string) => {
    setWhiteboards(prev => prev.filter(w => w.id !== id));
    const { error } = await supabase.from('whiteboards').delete().eq('id', id);
    if (error) logError("Delete Whiteboard Error", error);
  };

  return (
    <StoreContext.Provider value={{
      projects, tasks, notes, assets, snippets, whiteboards, isLoading, needsInitialization,
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
