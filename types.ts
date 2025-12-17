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
  projectId?: string; // Optional, can be a standalone idea
  title: string;
  content: string;
  updatedAt: Date;
}

export type AssetType = 
  | 'link' 
  | 'github' 
  | 'google_drive' 
  | 'figma' 
  | 'notion' 
  | 'linear' 
  | 'miro' 
  | 'slack'
  | 'file_ref';

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
  progress: number; // 0-100
  tags: string[];
  createdAt: Date;
}

export type ViewState = 
  | { type: 'DASHBOARD' }
  | { type: 'PROJECTS' }
  | { type: 'PROJECT_DETAIL'; projectId: string }
  | { type: 'IDEAS' }
  | { type: 'SETTINGS' };
