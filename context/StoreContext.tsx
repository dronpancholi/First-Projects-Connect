
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Project, Task, Note, Asset, Whiteboard, CanvasElement, 
  TaskStatus, ProjectStatus, Priority, CodeSnippet,
  FinancialEntry, Stakeholder, AutomationRule, Resource
} from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';

interface StoreContextType {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  assets: Asset[];
  whiteboards: Whiteboard[];
  snippets: CodeSnippet[];
  financials: FinancialEntry[];
  stakeholders: Stakeholder[];
  automations: AutomationRule[];
  resources: Resource[];
  isLoading: boolean;
  isSyncing: boolean;
  
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'progress'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  addTask: (t: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  addFinancial: (f: Omit<FinancialEntry, 'id'>) => Promise<void>;
  addStakeholder: (s: Omit<Stakeholder, 'id'>) => Promise<void>;
  addAutomation: (a: Omit<AutomationRule, 'id'>) => Promise<void>;
  addResource: (r: Omit<Resource, 'id'>) => Promise<void>;
  
  deleteFinancial: (id: string) => Promise<void>;
  deleteStakeholder: (id: string) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;

  updateWhiteboard: (id: string, elements: CanvasElement[]) => Promise<void>;
  addWhiteboard: (w: Omit<Whiteboard, 'id' | 'updatedAt'>) => Promise<void>;
  deleteWhiteboard: (id: string) => Promise<void>;

  addNote: (n: Omit<Note, 'id' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
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
  const [financials, setFinancials] = useState<FinancialEntry[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !supabase) return;
    setIsLoading(true);
    try {
      // Mocking fetch as table might not exist yet in users Supabase
      // In production, these would be supabase.from('table').select('*')
      const p = await supabase.from('projects').select('*');
      const t = await supabase.from('tasks').select('*');
      if (p.data) setProjects(p.data.map(p => ({ ...p, createdAt: new Date(p.created_at) })));
      if (t.data) setTasks(t.data.map(t => ({ ...t, projectId: t.project_id })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addProject = async (p: any) => {
    const newP = { id: Math.random().toString(), ...p, createdAt: new Date(), progress: 0 };
    setProjects(prev => [newP, ...prev]);
  };
  const deleteProject = async (id: string) => setProjects(prev => prev.filter(p => p.id !== id));
  const updateProject = async (id: string, u: any) => setProjects(prev => prev.map(p => p.id === id ? {...p, ...u} : p));

  const addTask = async (t: any) => {
    const newT = { id: Math.random().toString(), ...t };
    setTasks(prev => [...prev, newT]);
  };
  const updateTask = async (id: string, u: any) => setTasks(prev => prev.map(t => t.id === id ? {...t, ...u} : t));
  const deleteTask = async (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const addFinancial = async (f: any) => setFinancials(prev => [{ id: Math.random().toString(), ...f }, ...prev]);
  const deleteFinancial = async (id: string) => setFinancials(prev => prev.filter(x => x.id !== id));

  const addStakeholder = async (s: any) => setStakeholders(prev => [{ id: Math.random().toString(), ...s }, ...prev]);
  const deleteStakeholder = async (id: string) => setStakeholders(prev => prev.filter(x => x.id !== id));

  const addAutomation = async (a: any) => setAutomations(prev => [{ id: Math.random().toString(), ...a }, ...prev]);
  const deleteAutomation = async (id: string) => setAutomations(prev => prev.filter(x => x.id !== id));

  const addResource = async (r: any) => setResources(prev => [{ id: Math.random().toString(), ...r }, ...prev]);
  const deleteResource = async (id: string) => setResources(prev => prev.filter(x => x.id !== id));

  const addWhiteboard = async (w: any) => setWhiteboards(prev => [{ id: Math.random().toString(), ...w, updatedAt: new Date() }, ...prev]);
  const updateWhiteboard = async (id: string, elements: any) => setWhiteboards(prev => prev.map(w => w.id === id ? { ...w, elements, updatedAt: new Date() } : w));
  const deleteWhiteboard = async (id: string) => setWhiteboards(prev => prev.filter(w => w.id !== id));

  const addNote = async (n: any) => setNotes(prev => [{ id: Math.random().toString(), ...n, updatedAt: new Date() }, ...prev]);
  const updateNote = async (id: string, content: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: new Date() } : n));
  const deleteNote = async (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  return (
    <StoreContext.Provider value={{
      projects, tasks, notes, assets, whiteboards, snippets, financials, stakeholders, automations, resources, isLoading, isSyncing,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addFinancial, addStakeholder, addAutomation, addResource,
      deleteFinancial, deleteStakeholder, deleteAutomation, deleteResource,
      updateWhiteboard, addWhiteboard, deleteWhiteboard,
      addNote, updateNote, deleteNote
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
