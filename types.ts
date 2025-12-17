
export enum ProjectStatus {
  IDEA = 'Idea',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  COMPLETED = 'Completed'
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
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
  updatedAt: Date;
}

export type AssetType = 
  // Dev
  | 'github' | 'gitlab' | 'bitbucket' | 'linear' | 'jira' | 'vercel' | 'netlify' | 'cloudflare' | 'docker'
  // Design
  | 'figma' | 'miro' | 'adobe_xd' | 'sketch' | 'framer' | 'canva'
  // Productivity
  | 'google_drive' | 'notion' | 'trello' | 'asana' | 'slack' | 'discord' | 'teams' | 'zoom' | 'dropbox' | 'onedrive'
  // Other
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

export interface CodeSnippet {
  id: string;
  title: string;
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'sql' | 'json' | 'markdown' | 'rust' | 'go' | 'shell';
  code: string;
  folder?: string;
  updatedAt: Date;
}

export interface CanvasElement {
  id: string;
  type: 'note' | 'text' | 'rect' | 'circle' | 'image';
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
  | { type: 'IDEAS' }
  | { type: 'CODE_STUDIO' }
  | { type: 'WHITEBOARD' }
  | { type: 'SETTINGS' };
