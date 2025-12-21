
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { TaskStatus, Task, Priority, ViewState } from '../types.ts';
import { 
  Plus, MoreHorizontal, ChevronRight, Filter, Search, 
  Clock, AlertCircle, CheckCircle2, Circle, Layout, Briefcase 
} from 'lucide-react';

const KanbanView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { tasks, projects, updateTask, addTask } = useStore();
  const [filterQuery, setFilterQuery] = useState('');

  const columns: { title: string; status: TaskStatus }[] = [
    { title: 'Backlog', status: TaskStatus.BACKLOG },
    { title: 'To Do', status: TaskStatus.TODO },
    { title: 'Processing', status: TaskStatus.IN_PROGRESS },
    { title: 'Internal Review', status: TaskStatus.REVIEW },
    { title: 'Verified', status: TaskStatus.DONE },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(filterQuery.toLowerCase()));
  }, [tasks, filterQuery]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.CRITICAL: return 'text-rose-600 bg-rose-50 border-rose-100';
      case Priority.HIGH: return 'text-orange-600 bg-orange-50 border-orange-100';
      case Priority.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <Layout size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Operational Flow Engine</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tighter leading-none mb-2">Kanban Orchestration</h1>
          <p className="text-gray-500 text-sm font-medium">Visual task lifecycle management across all active ecosystem nodes.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-50 transition-all w-64"
              placeholder="Filter node status..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-3">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">{col.title}</h3>
                   <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{colTasks.length}</span>
                </div>
                <button className="text-gray-300 hover:text-black transition-colors"><MoreHorizontal size={14}/></button>
              </div>

              <div className="flex-1 flex flex-col gap-3 min-h-[500px]">
                {colTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div 
                      key={task.id} 
                      className="card-professional p-5 space-y-4 group cursor-pointer hover:border-indigo-100 transition-all"
                      onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: task.projectId })}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="flex -space-x-1">
                           <div className="w-5 h-5 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-600">DP</div>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                      
                      <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <Briefcase size={12} />
                            <span className="truncate max-w-[120px]">{project?.title || 'System Task'}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-gray-300">
                            <Clock size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">2d</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
                
                <button 
                  onClick={() => {
                    const firstProject = projects[0];
                    if (firstProject) addTask({ projectId: firstProject.id, title: 'New task...', status: col.status, priority: Priority.MEDIUM });
                  }}
                  className="w-full py-4 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-300 hover:border-indigo-100 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all group"
                >
                  <Plus size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanView;
