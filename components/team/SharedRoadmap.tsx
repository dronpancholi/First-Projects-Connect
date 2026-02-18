import React, { useState } from 'react';
import { GlassPanel, GlassBadge, GlassButton } from '../ui/LiquidGlass.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { Task } from '../../types.ts';
import { AlertTriangle, Calendar, CheckCircle2, Circle, ChevronRight, Plus } from 'lucide-react';

const RiskIndicator = ({ level }: { level?: string }) => {
    switch (level) {
        case 'high': return <GlassBadge variant="danger" className="flex items-center gap-1"><AlertTriangle size={12} /> High Risk</GlassBadge>;
        case 'medium': return <GlassBadge variant="warning">Medium Risk</GlassBadge>;
        case 'low': return <GlassBadge variant="success">Low Risk</GlassBadge>;
        default: return null;
    }
};

const PhaseCard = ({ phase, tasks }: { phase: string, tasks: Task[] }) => {
    const completed = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return (
        <GlassPanel className="min-w-[300px] w-full md:w-[350px] flex-shrink-0 flex flex-col max-h-[calc(100vh-250px)]">
            <div className="p-4 border-b border-glass-border-subtle sticky top-0 bg-glass-background/80 backdrop-blur-md z-10">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-glass-primary uppercase tracking-wider text-sm">{phase}</h3>
                    <span className="text-xs text-glass-secondary">{completed}/{total}</span>
                </div>
                <div className="h-1 bg-glass-border rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                {tasks.map(task => (
                    <div key={task.id} className="p-3 rounded-xl bg-glass-subtle border border-glass-border-subtle hover:border-glass-border transition-all hover:translate-x-1 group">
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="text-sm font-medium text-glass-primary leading-tight">{task.title}</h4>
                            {task.status === 'done' ? <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" /> : <Circle size={16} className="text-glass-muted flex-shrink-0" />}
                        </div>

                        {(task.risk_level && task.risk_level !== 'none') || task.due_date ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                                <RiskIndicator level={task.risk_level} />
                                {task.due_date && (
                                    <span className="text-xs text-glass-muted flex items-center gap-1 bg-glass-background px-2 py-0.5 rounded-full border border-glass-border-subtle">
                                        <Calendar size={10} /> {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        ) : null}

                        {task.assignee && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-glass-border flex items-center justify-center text-[10px] text-glass-primary overflow-hidden">
                                    {task.assignee.avatar_url ? <img src={task.assignee.avatar_url} alt="" /> : task.assignee.full_name?.charAt(0)}
                                </div>
                                <span className="text-xs text-glass-secondary">{task.assignee.full_name}</span>
                            </div>
                        )}
                    </div>
                ))}

                <button className="w-full py-2 text-xs text-glass-secondary border border-dashed border-glass-border-subtle rounded-lg hover:bg-glass-subtle transition-colors flex items-center justify-center gap-1 group">
                    <Plus size={14} className="group-hover:text-blue-400" /> Add Milestone
                </button>
            </div>
        </GlassPanel>
    );
};

const SharedRoadmap: React.FC = () => {
    const { tasks } = useStore();

    // Group tasks by phase
    const phases = ['Planning', 'Development', 'Testing', 'Launch'].reduce((acc, phase) => {
        acc[phase] = tasks.filter(t => (t.phase || 'Planning') === phase);
        return acc;
    }, {} as Record<string, Task[]>);

    // Handle unknown phases
    const unknownPhases = tasks.filter(t => t.phase && !['Planning', 'Development', 'Testing', 'Launch'].includes(t.phase));
    if (unknownPhases.length > 0) {
        phases['Other'] = unknownPhases;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Shared Roadmap</h1>
                    <p className="text-glass-secondary mt-1">Strategic timeline and risk assessment</p>
                </div>
                <div className="flex gap-3">
                    <GlassButton variant="secondary" size="sm">Filter View</GlassButton>
                    <GlassButton variant="primary" size="sm"><Plus size={16} /> New Phase</GlassButton>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-6 -mx-6 px-6 custom-scrollbar">
                <div className="flex gap-6 h-full min-w-max">
                    {Object.entries(phases).map(([phase, tasks]) => (
                        <PhaseCard key={phase} phase={phase} tasks={tasks} />
                    ))}

                    {/* Empty Phase State / Add New Column */}
                    <div className="min-w-[300px] w-[300px] flex-shrink-0 flex flex-col justify-center items-center border-2 border-dashed border-glass-border-subtle rounded-2xl opacity-50 hover:opacity-100 transition-opacity cursor-pointer group">
                        <Plus size={48} className="text-glass-muted group-hover:text-glass-primary transition-colors" />
                        <span className="text-glass-secondary mt-2 font-medium">Add Phase</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedRoadmap;
