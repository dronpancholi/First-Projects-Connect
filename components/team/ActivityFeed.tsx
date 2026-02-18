import React from 'react';
import { GlassPanel, GlassBadge } from '../ui/LiquidGlass.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { CheckCircle2, Flame, BookOpen, Clock, Award } from 'lucide-react';
import { TeamActivity } from '../../types.ts';
import { formatDistanceToNow } from 'date-fns'; // We'll need to install date-fns or use lightweight alternative

// Simple time formatter if date-fns not available
const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};

const ActivityIcon = ({ type }: { type: TeamActivity['type'] }) => {
    switch (type) {
        case 'milestone_completed': return <CheckCircle2 size={16} className="text-green-400" />;
        case 'streak_improved': return <Flame size={16} className="text-orange-400" />;
        case 'deep_work_session': return <Clock size={16} className="text-purple-400" />;
        case 'reflection_posted': return <Award size={16} className="text-pink-400" />;
        default: return <div className="w-2 h-2 rounded-full bg-glass-secondary" />;
    }
};

import PeerFeedback from './PeerFeedback.tsx';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const ActivityFeed: React.FC = () => {
    const { teamActivity } = useStore();
    const [expandedActivityId, setExpandedActivityId] = React.useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedActivityId(prev => prev === id ? null : id);
    };

    // Mock data if empty
    const activities = teamActivity.length > 0 ? teamActivity : [
        { id: '1', type: 'milestone_completed', user: { full_name: 'Sarah' }, metadata: { title: 'Backend API' }, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: '2', type: 'deep_work_session', user: { full_name: 'Alex' }, metadata: { duration: '2h' }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: '3', type: 'streak_improved', user: { full_name: 'Mike' }, metadata: { days: 5 }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: '4', type: 'reflection_posted', user: { full_name: 'David' }, metadata: { reflectionId: 'mock-ref-1' }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
    ] as TeamActivity[];

    return (
        <GlassPanel className="h-full flex flex-col">
            <div className="p-4 border-b border-glass-border-subtle flex justify-between items-center flex-shrink-0">
                <h3 className="font-semibold text-glass-primary">Team Activity</h3>
                <GlassBadge variant="default">Live</GlassBadge>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {activities.map((activity) => (
                    <div key={activity.id} className="group">
                        <div className="flex gap-3 items-start">
                            <div className="mt-1 p-1.5 rounded-lg bg-glass-subtle border border-glass-border-subtle group-hover:border-glass-border transition-colors">
                                <ActivityIcon type={activity.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div>
                                    <p className="text-sm text-glass-primary">
                                        <span className="font-medium text-white">{activity.user?.full_name || 'Member'}</span>
                                        <span className="text-glass-secondary">
                                            {activity.type === 'milestone_completed' && ` completed milestone "${activity.metadata?.title}"`}
                                            {activity.type === 'deep_work_session' && ` focused for ${activity.metadata?.duration}`}
                                            {activity.type === 'streak_improved' && ` hit a ${activity.metadata?.days} day streak!`}
                                            {activity.type === 'reflection_posted' && ` posted a daily reflection`}
                                        </span>
                                    </p>
                                    <p className="text-xs text-glass-muted mt-0.5">{timeAgo(activity.created_at)}</p>
                                </div>

                                {activity.type === 'reflection_posted' && (
                                    <button
                                        onClick={() => toggleExpand(activity.id)}
                                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                    >
                                        <MessageSquare size={12} />
                                        {expandedActivityId === activity.id ? 'Hide Feedback' : 'Give Feedback'}
                                        {expandedActivityId === activity.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        {expandedActivityId === activity.id && activity.type === 'reflection_posted' && (
                            <div className="ml-10">
                                <PeerFeedback reflectionId={activity.metadata?.reflectionId || 'unknown'} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </GlassPanel>
    );
};

export default ActivityFeed;
