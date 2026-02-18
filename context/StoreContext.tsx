import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Project, Task, Note, Asset, Whiteboard, CanvasElement,
  TaskStatus, ProjectStatus, Priority, CodeSnippet,
  FinancialEntry, Stakeholder, AutomationRule, Resource,
  LearningSession, Reflection,
  DeepWorkSession, Comment, TeamActivity, TeamMetric
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
  learningSessions: LearningSession[];
  reflections: Reflection[];

  // Team Data
  deepWorkSessions: DeepWorkSession[];
  comments: Comment[];
  teamActivity: TeamActivity[];
  teamMetrics: TeamMetric[];

  isLoading: boolean;
  isSyncing: boolean;

  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at' | 'progress'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addTask: (t: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'project_id' | 'projectId' | 'updatedAt' | 'createdAt'> & { projectId: string }) => Promise<void>;
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

  addLearningSession: (s: Omit<LearningSession, 'id' | 'created_at'>) => Promise<void>;
  addReflection: (r: Omit<Reflection, 'id' | 'created_at'>) => Promise<void>;

  // Team Methods
  addDeepWorkSession: (s: Omit<DeepWorkSession, 'id'>) => Promise<string>;
  startDeepWorkSession: (teamId: string) => Promise<string>;
  joinDeepWorkSession: (sessionId: string) => Promise<void>;
  endDeepWorkSession: (sessionId: string) => Promise<void>;
  addComment: (c: Omit<Comment, 'id' | 'created_at'>) => Promise<void>;
  addTeamActivity: (a: Omit<TeamActivity, 'id' | 'created_at'>) => Promise<void>;

  updateWhiteboard: (id: string, elements: CanvasElement[]) => Promise<void>;
  addWhiteboard: (w: Omit<Whiteboard, 'id' | 'updatedAt'>) => Promise<void>;
  deleteWhiteboard: (id: string) => Promise<void>;

  addNote: (n: Omit<Note, 'id' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  addSnippet: (s: Omit<CodeSnippet, 'id' | 'updatedAt'>) => Promise<void>;
  updateSnippet: (id: string, code: string) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;

  addAsset: (a: Omit<Asset, 'id' | 'uploadedAt' | 'createdAt'>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
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
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);

  const [deepWorkSessions, setDeepWorkSessions] = useState<DeepWorkSession[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !supabase) return;
    setIsLoading(true);
    try {
      const [
        pData, tData, nData, aData, wData, sData,
        fData, stData, auData, rData, lData, refData
      ] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('notes').select('*').order('updated_at', { ascending: false }),
        supabase.from('assets').select('*').order('created_at', { ascending: false }),
        supabase.from('whiteboards').select('*').order('updated_at', { ascending: false }),
        supabase.from('snippets').select('*').order('updated_at', { ascending: false }),
        supabase.from('financials').select('*').order('date', { ascending: false }),
        supabase.from('stakeholders').select('*').order('created_at', { ascending: false }),
        supabase.from('automations').select('*').order('created_at', { ascending: false }),
        supabase.from('resources').select('*').order('created_at', { ascending: false }),
        supabase.from('learning_sessions').select('*').order('started_at', { ascending: false }),
        supabase.from('reflections').select('*').order('created_at', { ascending: false }),
        supabase.from('deep_work_sessions').select('*').order('started_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: false }),
        supabase.from('team_activity').select('*').order('created_at', { ascending: false }),
      ]);

      if (pData.data) setProjects(pData.data.map(d => ({ ...d, createdAt: new Date(d.created_at) })));
      if (tData.data) setTasks(tData.data.map(d => ({ ...d, projectId: d.project_id, dueDate: d.due_date ? new Date(d.due_date) : undefined })));
      if (nData.data) setNotes(nData.data.map(d => ({ ...d, projectId: d.project_id, updatedAt: new Date(d.updated_at) })));
      if (aData.data) setAssets(aData.data.map(d => ({ ...d, projectId: d.project_id, uploadedAt: new Date(d.created_at) })));
      if (wData.data) setWhiteboards(wData.data.map(d => ({ ...d, updatedAt: new Date(d.updated_at) })));
      if (sData.data) setSnippets(sData.data.map(d => ({ ...d, updatedAt: new Date(d.updated_at) })));
      if (fData.data) setFinancials(fData.data.map(d => ({ ...d, projectId: d.project_id, date: new Date(d.date) })));
      if (stData.data) setStakeholders(stData.data.map(d => ({ ...d, linkedProjectId: d.linked_project_id })));
      if (auData.data) setAutomations(auData.data.map(d => ({ ...d, isActive: d.is_active })));
      if (rData.data) setResources(rData.data.map(d => ({ ...d, expiryDate: d.expiry_date ? new Date(d.expiry_date) : undefined })));
      // Team Data Setters (if/when table exists, otherwise empty)
      // Note: These tables might not exist yet in Supabase, so we handle gracefully
      // For now, we initialize with empty or mock if needed for UI dev


    } catch (e) {
      console.error('Data sync failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // --- Metrics Calculation ---
  useEffect(() => {
    if (isLoading) return;

    // Calculate simple metrics based on loaded data
    const totalDeepWorkHours = deepWorkSessions.reduce((acc, session) => {
      if (!session.ended_at) return acc;
      const duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
      return acc + (duration / (1000 * 60 * 60));
    }, 0);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const roadmapCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeProjectsCount = projects.filter(p => p.status === 'active').length;

    // Consistency Score (Mock logic: higher with more recent activity)
    // In real app, calculate variance of daily activity
    const recentActivityCount = teamActivity.filter(a => {
      const date = new Date(a.created_at);
      const now = new Date();
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }).length;
    const consistencyScore = Math.min(100, 50 + (recentActivityCount * 5));

    setTeamMetrics([{
      team_id: 'team-1', // Default ID
      total_study_hours: Math.round(totalDeepWorkHours * 10) / 10,
      consistency_score: consistencyScore,
      deep_work_ratio: 75, // Mock for now
      roadmap_completion: roadmapCompletion,
      active_projects: activeProjectsCount,
      updated_at: new Date().toISOString()
    }]);

  }, [deepWorkSessions, tasks, projects, teamActivity, isLoading]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- CRUD helpers ---
  // We optimistically update UI and verify with backend fetch or simply await
  // For simplicity and reliability in this sprint, we'll await and re-fetch or strict local update

  const addProject = async (p: any) => {
    setIsSyncing(true);
    const { data, error } = await supabase.from('projects').insert([{
      ...p,
      user_id: user?.id,
      created_at: new Date()
    }]).select().single();

    if (!error && data) {
      setProjects(prev => [{ ...data, createdAt: new Date(data.created_at) } as Project, ...prev]);
    }
    setIsSyncing(false);
  };

  const updateProject = async (id: string, updates: any) => {
    setIsSyncing(true);
    const { error } = await supabase.from('projects').update(updates).eq('id', id);
    if (!error) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
    setIsSyncing(false);
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addTask = async (t: any) => {
    const payload = {
      title: t.title,
      status: t.status,
      priority: t.priority,
      project_id: t.projectId,
      user_id: user?.id,
      due_date: t.dueDate
    };
    const { data, error } = await supabase.from('tasks').insert([payload]).select().single();
    if (!error && data) {
      setTasks(prev => [{ ...data, projectId: data.project_id, dueDate: data.due_date ? new Date(data.due_date) : undefined } as Task, ...prev]);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    // Map updates to snake_case if necessary
    const payload: any = { ...updates };
    if (updates.projectId) { payload.project_id = updates.projectId; delete payload.projectId; }
    if (updates.dueDate) { payload.due_date = updates.dueDate; delete payload.dueDate; }

    const { error } = await supabase.from('tasks').update(payload).eq('id', id);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- Other Entities ---

  const addFinancial = async (f: any) => {
    const { data, error } = await supabase.from('financials').insert([{ ...f, user_id: user?.id, project_id: f.projectId }]).select().single();
    if (data && !error) setFinancials(prev => [{ ...data, projectId: data.project_id, date: new Date(data.date) }, ...prev]);
  };
  const deleteFinancial = async (id: string) => {
    await supabase.from('financials').delete().eq('id', id);
    setFinancials(prev => prev.filter(x => x.id !== id));
  };

  const addStakeholder = async (s: any) => {
    const { data, error } = await supabase.from('stakeholders').insert([{ ...s, user_id: user?.id, linked_project_id: s.linkedProjectId }]).select().single();
    if (data && !error) setStakeholders(prev => [{ ...data, linkedProjectId: data.linked_project_id }, ...prev]);
  };
  const deleteStakeholder = async (id: string) => {
    await supabase.from('stakeholders').delete().eq('id', id);
    setStakeholders(prev => prev.filter(x => x.id !== id));
  };

  const addAutomation = async (a: any) => {
    const { data, error } = await supabase.from('automations').insert([{ ...a, user_id: user?.id, is_active: a.isActive }]).select().single();
    if (data && !error) setAutomations(prev => [{ ...data, isActive: data.is_active }, ...prev]);
  };
  const deleteAutomation = async (id: string) => {
    await supabase.from('automations').delete().eq('id', id);
    setAutomations(prev => prev.filter(x => x.id !== id));
  };

  const addResource = async (r: any) => {
    const { data, error } = await supabase.from('resources').insert([{ ...r, user_id: user?.id, expiry_date: r.expiryDate }]).select().single();
    if (data && !error) setResources(prev => [{ ...data, expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined }, ...prev]);
  };
  const deleteResource = async (id: string) => {
    await supabase.from('resources').delete().eq('id', id);
    setResources(prev => prev.filter(x => x.id !== id));
  };

  const addNote = async (n: any) => {
    const { data, error } = await supabase.from('notes').insert([{ ...n, user_id: user?.id, project_id: n.projectId, updated_at: new Date() }]).select().single();
    if (data && !error) setNotes(prev => [{ ...data, projectId: data.project_id, updatedAt: new Date(data.updated_at) }, ...prev]);
  };
  const updateNote = async (id: string, content: string) => {
    await supabase.from('notes').update({ content, updated_at: new Date() }).eq('id', id);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: new Date() } : n));
  };
  const deleteNote = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(prev => prev.filter(x => x.id !== id));
  };

  const addWhiteboard = async (w: any) => {
    const { data, error } = await supabase.from('whiteboards').insert([{ ...w, user_id: user?.id, updated_at: new Date() }]).select().single();
    if (data && !error) setWhiteboards(prev => [{ ...data, updatedAt: new Date(data.updated_at) }, ...prev]);
  };
  const updateWhiteboard = async (id: string, elements: any) => {
    await supabase.from('whiteboards').update({ elements, updated_at: new Date() }).eq('id', id);
    setWhiteboards(prev => prev.map(w => w.id === id ? { ...w, elements, updatedAt: new Date() } : w));
  };
  const deleteWhiteboard = async (id: string) => {
    await supabase.from('whiteboards').delete().eq('id', id);
    setWhiteboards(prev => prev.filter(w => w.id !== id));
  };

  const addSnippet = async (s: any) => {
    const { data, error } = await supabase.from('snippets').insert([{ ...s, user_id: user?.id, updated_at: new Date() }]).select().single();
    if (data && !error) setSnippets(prev => [{ ...data, updatedAt: new Date(data.updated_at) }, ...prev]);
  };
  const updateSnippet = async (id: string, code: string) => {
    await supabase.from('snippets').update({ code, updated_at: new Date() }).eq('id', id);
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, code, updatedAt: new Date() } : s));
  };
  const deleteSnippet = async (id: string) => {
    await supabase.from('snippets').delete().eq('id', id);
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const addAsset = async (a: any) => {
    // Asset uploading usually involves Storage bucket, but for now we verify metadata logic
    const { data, error } = await supabase.from('assets').insert([{ ...a, user_id: user?.id, project_id: a.projectId }]).select().single();
    if (data && !error) setAssets(prev => [{ ...data, projectId: data.project_id, uploadedAt: new Date(data.created_at) }, ...prev]);
  };
  const deleteAsset = async (id: string) => {
    await supabase.from('assets').delete().eq('id', id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addLearningSession = async (s: any) => {
    const { data, error } = await supabase.from('learning_sessions').insert([{ ...s, user_id: user?.id }]).select().single();
    if (data && !error) setLearningSessions(prev => [data, ...prev]);
  };

  const addReflection = async (r: any) => {
    const { data, error } = await supabase.from('reflections').insert([{ ...r, user_id: user?.id }]).select().single();
    if (data && !error) setReflections(prev => [data, ...prev]);
  };

  // --- Team Logic ---

  const addDeepWorkSession = async (s: any): Promise<string> => {
    // Mock for UI dev until backend table is ready
    const newSession: DeepWorkSession = {
      id: Math.random().toString(36).substr(2, 9),
      team_id: s.team_id,
      host_id: user?.id || 'unknown',
      started_at: new Date().toISOString(),
      status: 'active',
      participants: [{ user_id: user?.id || 'me', joined_at: new Date().toISOString(), status: 'active' }]
    };
    setDeepWorkSessions(prev => [newSession, ...prev]);
    return newSession.id;
  };

  const startDeepWorkSession = async (teamId: string): Promise<string> => {
    return await addDeepWorkSession({
      team_id: teamId,
      host_id: user?.id || 'me',
      started_at: new Date().toISOString(),
      status: 'active',
      participants: []
    });
  };

  const joinDeepWorkSession = async (sessionId: string) => {
    setDeepWorkSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          participants: [...s.participants, { user_id: user?.id || 'me', joined_at: new Date().toISOString(), status: 'active' }]
        };
      }
      return s;
    }));
  };

  const endDeepWorkSession = async (sessionId: string) => {
    setDeepWorkSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed', ended_at: new Date().toISOString() } : s));
  };

  const addComment = async (c: any) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      ...c,
      created_at: new Date().toISOString(),
      user_id: user?.id || 'me'
    };
    setComments(prev => [newComment, ...prev]);
  };

  const addTeamActivity = async (a: any) => {
    const newActivity: TeamActivity = {
      id: Math.random().toString(36).substr(2, 9),
      ...a,
      created_at: new Date().toISOString(),
      user_id: user?.id || 'me'
    };
    setTeamActivity(prev => [newActivity, ...prev]);
  };

  return (
    <StoreContext.Provider value={{
      projects, tasks, notes, assets, whiteboards, snippets, financials, stakeholders, automations, resources,
      learningSessions, reflections, isLoading, isSyncing,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addFinancial, addStakeholder, addAutomation, addResource,
      deleteFinancial, deleteStakeholder, deleteAutomation, deleteResource,
      updateWhiteboard, addWhiteboard, deleteWhiteboard,
      addNote, updateNote, deleteNote,
      addSnippet, updateSnippet, deleteSnippet,
      addAsset, deleteAsset,
      addLearningSession, addReflection,
      deepWorkSessions, comments, teamActivity, teamMetrics,
      addDeepWorkSession, startDeepWorkSession, joinDeepWorkSession, endDeepWorkSession, addComment, addTeamActivity
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
