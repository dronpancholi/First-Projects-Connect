
export enum ProjectStatus {
  IDEA = 'Idea',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  COMPLETED = 'Completed'
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
}

export interface Note {
  id: string;
  projectId?: string;
  title: string;
  content: string;
  category?: 'meeting' | 'research' | 'scratchpad';
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

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: AssetType;
  url: string;
  description?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  tags: string[];
  createdAt: Date;
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
  | { type: 'SETTINGS' };
