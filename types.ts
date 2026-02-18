
export type Role = 'admin' | 'member';

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: Role;
  created_at?: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
  profile?: User;
}

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'paused' | 'idea';
export const ProjectStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  PAUSED: 'paused',
  IDEA: 'idea' // Added for compatibility if needed, though not in type? projectService used it.
} as const;

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done'
} as const;

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  team_id?: string;
  owner_id?: string;
  updated_at: string;
  tags?: string[];
  progress?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  assignee?: User;
  projectId?: string; // Mapped from project_id
  dueDate?: Date;     // Mapped from due_date
  risk_level?: 'none' | 'low' | 'medium' | 'high';
  phase?: string;
  dependency_id?: string;
}

export interface LearningSession {
  id: string;
  user_id: string;
  topic: string;
  duration_minutes: number;
  notes?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  content: string;
  type: 'daily' | 'weekly' | 'monthly';
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  current_level: number;
  target_level: number;
  category?: string;
  updated_at: string;
}


// User interface replaced above


export interface Note {
  id: string;
  projectId?: string;
  title: string;
  content: string; // Markdown content
  category?: 'meeting' | 'research' | 'scratchpad' | 'idea';
  tags?: string[];
  externalRef?: {
    type: 'google_doc' | 'notion_page' | 'other';
    url: string;
    lastSynced?: Date;
  };
  isArchived?: boolean; // Soft delete / archive
  updatedAt: Date;
  createdAt?: Date;
}

export interface FinancialEntry {
  id: string;
  projectId: string;
  amount: number;
  type: 'expense' | 'revenue';
  description: string;
  date: Date;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  company?: string;
  linkedProjectId?: string;
}

export interface AutomationRule {
  id: string;
  name?: string;
  trigger: string;
  action: string;
  isActive: boolean;
}

export interface Resource {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'subscription';
  status: 'active' | 'expired' | 'maintenance';
  expiryDate?: Date;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  folder?: string;
  updatedAt: Date;
}

export type AssetType =
  | 'github' | 'gitlab' | 'bitbucket' | 'linear' | 'jira' | 'vercel' | 'netlify' | 'cloudflare' | 'docker'
  | 'figma' | 'miro' | 'adobe_xd' | 'sketch' | 'framer' | 'canva'
  | 'google_drive' | 'notion' | 'trello' | 'asana' | 'slack' | 'discord' | 'teams' | 'zoom' | 'dropbox' | 'onedrive'
  | 'stripe' | 'openai' | 'link' | 'file_ref';

export interface AssetMetadata {
  sizeBytes?: number;
  mimeType?: string;
  lastModifiedExternal?: string;

  // Storage specific
  pathDisplay?: string;
  downloadUrl?: string;
  webViewLink?: string;
  iconLink?: string;

  // GitHub specific
  repoId?: number;
  stars?: number;
  language?: string;
  defaultBranch?: string;
  lastCommit?: string;
  openIssuesCount?: number;

  [key: string]: any;
}

export interface Asset {
  id: string;
  projectId: string;
  type: AssetType;
  resourceId: string; // External ID (File ID, Repo ID)
  name: string;
  url: string;
  description?: string;
  metadata?: AssetMetadata; // Snapshot of external state
  isConnected: boolean;
  syncedAt?: Date;
  createdAt: Date;
  uploadedAt?: Date; // Mapped from created_at
}

// Project and Task interfaces replaced above.


export interface CanvasElement {
  id: string;
  parentId?: string;
  fromId?: string;
  toId?: string;
  type: 'note' | 'text' | 'rect' | 'circle' | 'image' | 'diamond' | 'triangle' | 'connection';
  x: number;
  y: number;
  content?: string;
  color?: string;
  width?: number;
  height?: number;
}

export interface Whiteboard {
  id: string;
  title: string;
  elements: CanvasElement[];
  updatedAt: Date;
}

export type ActivityAction =
  | 'CREATE_PROJECT' | 'UPDATE_PROJECT' | 'ARCHIVE_PROJECT'
  | 'CREATE_TASK' | 'COMPLETE_TASK'
  | 'LINK_ASSET' | 'UNLINK_ASSET'
  | 'CREATE_NOTE';

export interface ActivityLog {
  id: string;
  actorId: string;
  actionType: ActivityAction;
  entityType: 'project' | 'task' | 'note' | 'asset';
  entityId: string;
  metadata?: {
    entityTitle?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

export type ViewState =
  | { type: 'DASHBOARD' }
  | { type: 'PROJECTS' }
  | { type: 'PROJECT_DETAIL'; projectId: string }
  | { type: 'KANBAN' }
  | { type: 'FINANCIALS' }
  | { type: 'CRM' }
  | { type: 'AUTOMATION' }
  | { type: 'RESOURCES' }
  | { type: 'IDEAS' }
  | { type: 'WHITEBOARD' }
  | { type: 'SETTINGS' }
  | { type: 'SEARCH' } // Added Search view
  | { type: 'TEAM_DASHBOARD' }
  | { type: 'MEMBER_PERFORMANCE' }
  | { type: 'LIVE_SESSION' }
  | { type: 'SHARED_ROADMAP' }
  | { type: 'TEAM_ADMIN' };

export interface DeepWorkSession {
  id: string;
  team_id: string;
  host_id: string;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'completed' | 'cancelled';
  participants: {
    user_id: string;
    joined_at: string;
    status: 'active' | 'left';
  }[];
}

export interface Comment {
  id: string;
  reflection_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: User;
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  type: 'milestone_completed' | 'project_started' | 'streak_improved' | 'reflection_posted' | 'deep_work_session';
  metadata?: any;
  created_at: string;
  user?: User;
}

export interface TeamMetric {
  team_id: string;
  total_study_hours: number;
  consistency_score: number;
  deep_work_ratio: number;
  roadmap_completion: number;
  active_projects: number;
  updated_at: string;
}
