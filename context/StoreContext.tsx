import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Task, Note, Asset, CodeSnippet, Whiteboard, CanvasElement, TaskStatus } from '../types';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface StoreContextType {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  assets: Asset[];
  snippets: CodeSnippet[];
  whiteboards: Whiteboard[];
  isLoading: boolean;
  
  // Actions
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'progress'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  addTask: (t: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  
  addNote: (n: Omit<Note, 'id' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;

  addAsset: (a: Omit<Asset, 'id'>) => Promise<void>;

  addSnippet: (s: Omit<CodeSnippet, 'id' | 'updatedAt'>) => Promise<void>;
  updateSnippet: (id: string, code: string) => Promise<void>;

  addWhiteboard: (w: Omit<Whiteboard, 'id' | 'updatedAt'>) => Promise<void>;
  updateWhiteboard: (id: string, elements: CanvasElement[]) => Promise<void>;
  
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

  // Helper to map DB response to types
  const mapProject = (p: any): Project => ({ ...p, createdAt: new Date(p.created_at) });
  const mapTask = (t: any): Task => ({ ...t, dueDate: t.due_date ? new Date(t.due_date) : undefined, projectId: t.project_id });
  const mapNote = (n: any): Note => ({ ...n, updatedAt: new Date(n.updated_at), projectId: n.project_id });
  const mapAsset = (a: any): Asset => ({ ...a, projectId: a.project_id });
  const mapSnippet = (s: any): CodeSnippet => ({ ...s, updatedAt: new Date(s.updated_at) });
  const mapWhiteboard = (w: any): Whiteboard => ({ ...w, updatedAt: new Date(w.updated_at) });

  const fetchData = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return;
    setIsLoading(true);
    
    try {
      const [pRes, tRes, nRes, aRes, sRes, wRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*'),
        supabase.from('notes').select('*').order('updated_at', { ascending: false }),
        supabase.from('assets').select('*'),
        supabase.from('snippets').select('*').order('updated_at', { ascending: false }),
        supabase.from('whiteboards').select('*').order('updated_at', { ascending: false }),
      ]);

      if (pRes.data) setProjects(pRes.data.map(mapProject));
      if (tRes.data) setTasks(tRes.data.map(mapTask));
      if (nRes.data) setNotes(nRes.data.map(mapNote));
      if (aRes.data) setAssets(aRes.data.map(mapAsset));
      if (sRes.data) setSnippets(sRes.data.map(mapSnippet));
      if (wRes.data) setWhiteboards(wRes.data.map(mapWhiteboard));
    } catch (e) {
      console.error("Error fetching data", e);
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

  // Update local progress calc
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

  // Actions
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
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await supabase.from('projects').update({
      title: updates.title,
      description: updates.description,
      status: updates.status,
      tags: updates.tags
    }).eq('id', id);
  };

  const deleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    await supabase.from('projects').delete().eq('id', id);
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
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await supabase.from('tasks').update({
      title: updates.title,
      status: updates.status,
      priority: updates.priority,
      due_date: updates.dueDate
    }).eq('id', id);
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
    }
  };

  const updateNote = async (id: string, content: string) => {
    const now = new Date();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: now } : n));
    await supabase.from('notes').update({ content, updated_at: now }).eq('id', id);
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
    }
  };

  const addSnippet = async (s: Omit<CodeSnippet, 'id' | 'updatedAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('snippets').insert({
      user_id: user.id,
      title: s.title,
      language: s.language,
      code: s.code
    }).select().single();
    if (data && !error) setSnippets([mapSnippet(data), ...snippets]);
  };

  const updateSnippet = async (id: string, code: string) => {
    const now = new Date();
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, code, updatedAt: now } : s));
    await supabase.from('snippets').update({ code, updated_at: now }).eq('id', id);
  };

  const addWhiteboard = async (w: Omit<Whiteboard, 'id' | 'updatedAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('whiteboards').insert({
      user_id: user.id,
      title: w.title,
      elements: w.elements
    }).select().single();
    if (data && !error) setWhiteboards([mapWhiteboard(data), ...whiteboards]);
  };

  const updateWhiteboard = async (id: string, elements: CanvasElement[]) => {
    const now = new Date();
    setWhiteboards(prev => prev.map(w => w.id === id ? { ...w, elements, updatedAt: now } : w));
    // Debounced update recommended in production, direct for now
    await supabase.from('whiteboards').update({ elements, updated_at: now }).eq('id', id);
  };

  return (
    <StoreContext.Provider value={{
      projects, tasks, notes, assets, snippets, whiteboards, isLoading,
      addProject, updateProject, deleteProject,
      addTask, updateTask,
      addNote, updateNote,
      addAsset,
      addSnippet, updateSnippet,
      addWhiteboard, updateWhiteboard,
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
