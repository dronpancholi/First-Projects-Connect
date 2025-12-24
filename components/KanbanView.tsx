import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { TaskStatus, Task, Priority, ViewState } from '../types.ts';
import {
  Plus, MoreHorizontal, Clock, AlertCircle, CheckCircle2,
  Layout, Briefcase, Zap, Search
} from 'lucide-react';
import { GlassCard, GlassColumn, GlassButton, GlassBadge, GlassInput } from './ui/LiquidGlass.tsx';

const KanbanView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { tasks, projects, updateTask, addTask, deleteTask } = useStore();
  const [filterQuery, setFilterQuery] = useState('');

  const columns: { title: string; status: TaskStatus; color: string }[] = [
    { title: 'Backlog', status: TaskStatus.BACKLOG, color: 'from-gray-400 to-gray-500' },
    { title: 'To Do', status: TaskStatus.TODO, color: 'from-blue-400 to-blue-500' },
    { title: 'In Progress', status: TaskStatus.IN_PROGRESS, color: 'from-amber-400 to-orange-500' },
    { title: 'Review', status: TaskStatus.REVIEW, color: 'from-purple-400 to-purple-500' },
    { title: 'Done', status: TaskStatus.DONE, color: 'from-green-400 to-green-500' },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(filterQuery.toLowerCase()));
  }, [tasks, filterQuery]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case Priority.CRITICAL: return <GlassBadge variant="danger">{p}</GlassBadge>;
      case Priority.HIGH: return <GlassBadge variant="warning">{p}</GlassBadge>;
      case Priority.MEDIUM: return <GlassBadge variant="primary">{p}</GlassBadge>;
      default: return <GlassBadge>{p}</GlassBadge>;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <Layout size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Operations Board</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Task Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tasks through validation stages.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="pl-11 pr-4 py-3 glass-input w-72"
            placeholder="Search tasks..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Kanban Columns */}
      <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="flex-shrink-0 w-80">
              <GlassColumn>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${col.color}`} />
                    <h3 className="text-sm font-semibold text-gray-900">{col.title}</h3>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                {/* Tasks */}
                <div className="space-y-3 min-h-[300px]">
                  {colTasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-gray-300">
                      <Zap size={24} className="mb-2" />
                      <p className="text-xs font-medium">No tasks</p>
                    </div>
                  )}

                  {colTasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <GlassCard
                        key={task.id}
                        className="cursor-pointer group"
                        onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: task.projectId })}
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            {getPriorityBadge(task.priority)}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {col.status !== TaskStatus.DONE && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, TaskStatus.DONE); }}
                                  className="p-1.5 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <AlertCircle size={14} />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {task.title}
                          </h4>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Briefcase size={12} className="text-blue-500" />
                              <span className="truncate max-w-[120px]">{project?.title || 'System'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50/80 rounded text-xs text-gray-400">
                              <Clock size={10} />
                              <span>Active</span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>

                {/* Add Task Button */}
                <button
                  onClick={() => {
                    const fp = projects[0];
                    if (fp) addTask({ projectId: fp.id, title: 'New task...', status: col.status, priority: Priority.MEDIUM });
                    else alert("Create a Workspace first.");
                  }}
                  className="w-full mt-4 py-3 border-2 border-dashed border-gray-200/80 rounded-xl flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all group"
                >
                  <Plus size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </GlassColumn>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanView;
