import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState, TaskStatus, Priority } from '../types.ts';
import { Plus, X, Trash2, Trello, GripVertical } from 'lucide-react';
import { GlassColumn, GlassCard, GlassModal, GlassButton, GlassInput, GlassBadge } from './ui/LiquidGlass.tsx';

const KanbanView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { tasks, projects, addTask, updateTask, deleteTask } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const columns = [
    { status: TaskStatus.TODO, title: 'To Do', color: 'from-blue-500 to-cyan-500' },
    { status: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'from-amber-500 to-orange-500' },
    { status: TaskStatus.DONE, title: 'Completed', color: 'from-green-500 to-emerald-500' }
  ];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask({
      title: newTaskTitle,
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      projectId: selectedProject || undefined
    });
    setNewTaskTitle('');
    setShowModal(false);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH: return 'danger';
      case Priority.MEDIUM: return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 text-blue-600 mb-3">
            <Trello size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest">Task Board</span>
          </div>
          <h1 className="text-4xl font-bold text-glass-primary tracking-tight mb-2">Operations</h1>
          <p className="text-glass-secondary text-sm">Manage tasks across all your projects.</p>
        </div>

        <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus size={18} /> Add Task
        </GlassButton>
      </header>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto hide-scrollbar pb-6">
        <div className="flex gap-6 min-w-max h-full">
          {columns.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.status);
            return (
              <GlassColumn key={column.status}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${column.color}`} />
                    <h2 className="font-semibold text-glass-primary">{column.title}</h2>
                    <span className="glass-badge text-xs">{columnTasks.length}</span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="flex-1 space-y-3 overflow-y-auto hide-scrollbar">
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-glass-muted text-sm">
                      No tasks
                    </div>
                  )}
                  {columnTasks.map(task => (
                    <GlassCard key={task.id} className="group">
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <GripVertical size={16} className="text-glass-muted mt-0.5 cursor-grab" />
                          <p className="flex-1 text-sm font-medium text-glass-primary leading-relaxed">{task.title}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <GlassBadge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </GlassBadge>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {column.status !== TaskStatus.TODO && (
                              <button
                                onClick={() => updateTask(task.id, { status: TaskStatus.TODO })}
                                className="p-1.5 text-glass-muted hover:text-blue-500 transition-colors"
                                title="Move to To Do"
                              >
                                ←
                              </button>
                            )}
                            {column.status !== TaskStatus.DONE && (
                              <button
                                onClick={() => updateTask(task.id, {
                                  status: column.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.DONE
                                })}
                                className="p-1.5 text-glass-muted hover:text-green-500 transition-colors"
                                title="Move forward"
                              >
                                →
                              </button>
                            )}
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-glass-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </GlassColumn>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <GlassModal onClose={() => setShowModal(false)}>
          <form onSubmit={handleAddTask}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-glass-primary">Add Task</h3>
                  <p className="text-sm text-glass-secondary mt-1">Create a new task for your board</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 text-glass-muted hover:text-glass-primary transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Task Title</label>
                  <GlassInput
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    autoFocus
                  />
                </div>
                {projects.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Project (Optional)</label>
                    <select
                      className="glass-input cursor-pointer"
                      value={selectedProject}
                      onChange={e => setSelectedProject(e.target.value)}
                    >
                      <option value="">No project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <GlassButton type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  Add Task
                </GlassButton>
              </div>
            </div>
          </form>
        </GlassModal>
      )}
    </div>
  );
};

export default KanbanView;
