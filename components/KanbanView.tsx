
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { TaskStatus, Task, Priority, ViewState } from '../types.ts';
import { 
  Plus, MoreHorizontal, ChevronRight, Filter, Search, 
  Clock, AlertCircle, CheckCircle2, Circle, Layout, Briefcase,
  // Added missing Zap icon
  Zap
} from 'lucide-react';

const KanbanView: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { tasks, projects, updateTask, addTask, deleteTask } = useStore();
  const [filterQuery, setFilterQuery] = useState('');

  const columns: { title: string; status: TaskStatus }[] = [
    { title: 'Backlog', status: TaskStatus.BACKLOG },
    { title: 'To Do', status: TaskStatus.TODO },
    { title: 'Processing', status: TaskStatus.IN_PROGRESS },
    { title: 'Peer Review', status: TaskStatus.REVIEW },
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
      case Priority.MEDIUM: return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-12">
        <div>
          <div className="flex items-center gap-3 text-yellow-600 mb-3">
             <Layout size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Throughput Engine active</span>
          </div>
          <h1 className="text-5xl font-display font-black text-gray-900 tracking-tighter leading-none mb-3">Lifecycle Board</h1>
          <p className="text-gray-500 text-sm font-medium">Orchestrate mission tasks through industrial validation cycles.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              className="pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold outline-none focus:ring-4 focus:ring-yellow-50 focus:border-yellow-400 transition-all w-80 shadow-inner"
              placeholder="Query task registry..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex gap-8 overflow-x-auto pb-12 no-scrollbar px-1">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="flex-shrink-0 w-80 flex flex-col gap-6">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-4">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900">{col.title}</h3>
                   <span className="px-2.5 py-0.5 rounded-full bg-gray-900 text-yellow-400 text-[10px] font-black">{colTasks.length}</span>
                </div>
                <button className="text-gray-300 hover:text-black transition-colors"><MoreHorizontal size={16}/></button>
              </div>

              <div className="flex-1 flex flex-col gap-4 min-h-[600px] p-2 bg-gray-50/50 rounded-[2rem] border border-gray-100/50">
                {colTasks.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                      <Zap size={32} className="mb-4" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Zone Clear</p>
                   </div>
                )}
                {colTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div 
                      key={task.id} 
                      className="card-professional p-6 space-y-5 group cursor-pointer rounded-2xl hover:translate-y-[-4px] transition-all bg-white"
                      onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: task.projectId })}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="flex gap-1.5">
                           {col.status !== TaskStatus.DONE && (
                              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, TaskStatus.DONE); }} className="p-1.5 text-gray-200 hover:text-emerald-500 bg-gray-50 rounded-lg">
                                 <CheckCircle2 size={14} />
                              </button>
                           )}
                           <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="p-1.5 text-gray-200 hover:text-rose-500 bg-gray-50 rounded-lg">
                              <AlertCircle size={14} />
                           </button>
                        </div>
                      </div>
                      
                      <h4 className="text-[15px] font-black text-gray-900 leading-snug group-hover:text-yellow-600 transition-colors tracking-tight">{task.title}</h4>
                      
                      <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                         <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Briefcase size={12} className="text-yellow-500" />
                            <span className="truncate max-w-[140px]">{project?.title || 'System'}</span>
                         </div>
                         <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
                            <Clock size={12} className="text-gray-300" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
                
                <button 
                  onClick={() => {
                    const fp = projects[0];
                    if (fp) addTask({ projectId: fp.id, title: 'Define new mission target...', status: col.status, priority: Priority.MEDIUM });
                    else alert("Initialize a Workspace node first.");
                  }}
                  className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50/50 transition-all group"
                >
                  <Plus size={24} className="group-hover:scale-125 transition-all" />
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
