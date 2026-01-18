
export enum ProjectStatus {
  IDEA = 'Idea',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived'
}

export enum TaskStatus {
  BACKLOG = 'Backlog',
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

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
  createdAt: Date;
  updatedAt: Date;
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
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  description?: string;
  dueDate?: Date;
  tags?: string[];
  sourceRef?: { // If promoted from GitHub issue etc.
    type: 'github_issue' | 'linear_issue' | 'email';
    id: string;
    url: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  tags: string[];
  thumbnailUrl?: string; // Cover image
  startDate?: Date;
  dueDate?: Date;
  deletedAt?: Date; // Soft delete
  createdAt: Date;
  updatedAt: Date;
}

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
  | { type: 'SEARCH' }; // Added Search view
