import React from 'react';
import { GlassPanel, GlassBadge } from '../ui/LiquidGlass.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { TrendingUp, AlertTriangle, Zap, Brain } from 'lucide-react';

const TeamInsights: React.FC = () => {
    const { teamMetrics, teamActivity } = useStore();

    // Mock logic for generating insights
    // In a real app, this would analyze trends over time
    const insights = [
        {
            id: '1',
            type: 'positive',
            icon: TrendingUp,
            title: 'Consistency Rising',
            description: 'Team consistency score improved by 12% compared to last week.',
            color: 'text-green-400'
        },
        {
            id: '2',
            type: 'neutral',
            icon: Brain,
            title: 'Deep Work Focus',
            description: 'Most deep work sessions occur between 9 AM and 11 AM.',
            color: 'text-purple-400'
        },
        {
            id: '3',
            type: 'warning',
            icon: AlertTriangle,
            title: 'Deadline Approaching',
            description: '3 high-priority tasks in "Planning" phase due in 2 days.',
            color: 'text-amber-400'
        }
    ];

    return (
        <GlassPanel className="h-full">
            <div className="p-4 border-b border-glass-border-subtle flex justify-between items-center">
                <h3 className="font-semibold text-glass-primary flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" /> AI Insights
                </h3>
                <GlassBadge variant="purple">Beta</GlassBadge>
            </div>
            <div className="p-4 space-y-4">
                {insights.map(insight => (
                    <div key={insight.id} className="p-3 rounded-xl bg-glass-subtle border border-glass-border-subtle hover:bg-glass-subtle/80 transition-colors">
                        <div className="flex gap-3">
                            <div className={`mt-0.5 p-1.5 rounded-lg bg-glass-background/50 ${insight.color}`}>
                                <insight.icon size={16} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-glass-primary">{insight.title}</h4>
                                <p className="text-xs text-glass-secondary mt-1 leading-relaxed">
                                    {insight.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </GlassPanel>
    );
};

export default TeamInsights;
