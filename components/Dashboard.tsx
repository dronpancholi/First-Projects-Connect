import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProjectStatus, TaskStatus, ViewState } from '../types';
import { Activity, CheckCircle, Clock, Folder } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  setView: (view: ViewState) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string }> = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
    <div className="flex items-start justify-between">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-600">{icon}</div>
      {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-apple-text tracking-tight">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { projects, tasks, notes } = useStore();

  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const recentNotes = notes.slice(0, 3); // Mock recent

  const taskData = [
    { name: 'Done', value: completedTasks, color: '#10B981' }, // Emerald-500
    { name: 'Pending', value: pendingTasks, color: '#3B82F6' }, // Blue-500
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-apple-text tracking-tight">Welcome back, John.</h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your ecosystem today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Projects" value={activeProjects} icon={<Folder size={20} />} />
        <StatCard title="Pending Tasks" value={pendingTasks} icon={<Clock size={20} />} trend="-2 from yesterday" />
        <StatCard title="Completed Tasks" value={completedTasks} icon={<CheckCircle size={20} />} trend="+5 this week" />
        <StatCard title="Total Ideas" value={notes.length} icon={<Activity size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Project Momentum</h2>
            <button onClick={() => setView({ type: 'PROJECTS' })} className="text-sm text-apple-blue font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 4).map(project => (
              <div key={project.id} className="group cursor-pointer" onClick={() => setView({ type: 'PROJECT_DETAIL', projectId: project.id })}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium group-hover:text-apple-blue transition-colors">{project.title}</span>
                  <span className="text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-apple-text h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${project.progress}%`, opacity: project.status === ProjectStatus.COMPLETED ? 0.4 : 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Completion Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Task Balance</h2>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-bold">{pendingTasks + completedTasks}</span>
              <span className="text-xs text-gray-500 uppercase">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
