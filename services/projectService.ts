
import { supabase } from './supabaseClient';
import { Project, ProjectStatus, TaskStatus, Task, Priority } from '../types';

export const projectService = {
    /**
     * Fetches all projects. By default, ignores soft-deleted projects.
     */
    async getAllProjects(includeArchived = false) {
        let query = supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (!includeArchived) {
            query = query.is('deleted_at', null);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((p: any) => this.mapDatabaseProjectToType(p));
    },

    /**
     * Fetches a single project with live progress calculation.
     */
    async getProjectById(id: string): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        // Live Progress Calculation logic
        const { count: totalTasks } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', id);

        const { count: completedTasks } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', id)
            .eq('status', TaskStatus.DONE);

        const calculatedProgress = totalTasks ? Math.round(((completedTasks || 0) / (totalTasks || 1)) * 100) : 0;

        const project = this.mapDatabaseProjectToType(data);
        project.progress = calculatedProgress;

        return project;
    },

    /**
     * Creates a new project.
     */
    async createProject(project: Partial<Project>) {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Not authenticated");


        const payload = {
            title: project.title,
            description: project.description,
            status: project.status || ProjectStatus.IDEA,
            tags: project.tags || [],
            user_id: user.id, // Corrected from owner_id
            start_date: project.startDate,
            end_date: project.dueDate,
            thumbnail_url: project.thumbnailUrl,
            updated_at: new Date(),
        };


        const { data, error } = await supabase
            .from('projects')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return this.mapDatabaseProjectToType(data);
    },

    async updateProject(id: string, updates: Partial<Project>) {
        const payload: any = {
            updated_at: new Date(),
        };

        if (updates.title) payload.title = updates.title;
        if (updates.description) payload.description = updates.description;
        if (updates.status) payload.status = updates.status;
        if (updates.tags) payload.tags = updates.tags;
        if (updates.startDate) payload.start_date = updates.startDate;
        if (updates.dueDate) payload.end_date = updates.dueDate;
        if (updates.thumbnailUrl) payload.thumbnail_url = updates.thumbnailUrl;

        const { data, error } = await supabase
            .from('projects')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapDatabaseProjectToType(data);
    },

    /**
     * Soft deletes a project. 
     * Implementation Rule: "Projects must be able to link... and how deleting a project affects linked items without destroying external data"
     * Solution: We only mark the project as deleted. We DO NOT cascade delete Assets securely.
     */
    async softDeleteProject(id: string) {
        const { error } = await supabase
            .from('projects')
            .update({
                deleted_at: new Date().toISOString(),
                status: ProjectStatus.ARCHIVED,
                updated_at: new Date()
            })
            .eq('id', id);

        if (error) throw error;
    },

    async restoreProject(id: string) {
        const { error } = await supabase
            .from('projects')
            .update({
                deleted_at: null,
                status: ProjectStatus.PAUSED, // Restore to a neutral state
                updated_at: new Date()
            })
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Creates a new internal task. 
     * Includes logic to sanitize and validate input.
     */
    async createTask(task: Partial<Task>): Promise<Task> {
        if (!task.projectId || !task.title) throw new Error("Missing required fields");

        const payload = {
            project_id: task.projectId,
            title: task.title,
            description: task.description,
            status: task.status || TaskStatus.TODO,
            priority: task.priority || Priority.MEDIUM,
            due_date: task.dueDate,
            tags: task.tags || [],
            source_ref: task.sourceRef, // JSONB: { type: 'github', id: '123', url: '...' }
            created_at: new Date(),
            updated_at: new Date()
        };

        const { data, error } = await supabase
            .from('tasks')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return this.mapDatabaseTaskToType(data);
    },

    /**
     * Promotes an external item (like a GitHub Issue) to an internal Task.
     * This respects the "Optional Mapping" rule: It creates a COPY, it does not bi-directionally sync.
     */
    async createTaskFromExternalSource(projectId: string, source: { type: 'github_issue' | 'linear_issue'; id: string; title: string; url: string }) {
        return this.createTask({
            projectId,
            title: source.title,
            description: `Imported from ${source.url}`,
            status: TaskStatus.TODO,
            priority: Priority.MEDIUM,
            sourceRef: {
                type: source.type,
                id: source.id,
                url: source.url
            }
        });
    },

    // Helper to map DB snake_case to TS camelCase
    mapDatabaseProjectToType(p: any): Project {
        return {
            id: p.id,
            title: p.title,
            description: p.description,
            status: p.status,
            progress: p.progress || 0, // Fallback if computed column exists
            tags: p.tags || [],
            thumbnailUrl: p.thumbnail_url,
            startDate: p.start_date ? new Date(p.start_date) : undefined,
            dueDate: p.end_date ? new Date(p.end_date) : undefined,
            deletedAt: p.deleted_at ? new Date(p.deleted_at) : undefined,
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
        };
    },

    mapDatabaseTaskToType(t: any): Task {
        return {
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            description: t.description,
            dueDate: t.due_date ? new Date(t.due_date) : undefined,
            tags: t.tags || [],
            sourceRef: t.source_ref,
            createdAt: new Date(t.created_at),
            updatedAt: new Date(t.updated_at),
        };
    }
};
