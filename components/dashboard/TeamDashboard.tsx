
import React, { useEffect, useState } from 'react';
import { ViewState } from '../../types.ts';
import { Users, TrendingUp, Calendar, Zap, Award, BarChart3, Clock } from 'lucide-react';
import { GlassCard, GlassPanel, GlassButton, GlassBadge } from '../ui/LiquidGlass.tsx';
import { supabase } from '../../context/AuthContext.tsx';

import { Skeleton } from '../ui/Skeleton.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import ActivityFeed from '../team/ActivityFeed.tsx';
import TeamProductivityChart from '../team/TeamProductivityChart.tsx';
import TeamInsights from '../analytics/TeamInsights.tsx';

// Placeholder type until real integration
interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    deepWork: number;
    tasks: number;
    score: number;
}

import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface TeamDashboardProps {
    setView?: (view: ViewState) => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ setView }) => {
    const { user } = useAuth();
    const { deepWorkSessions, teamActivity, teamMetrics, joinDeepWorkSession, startDeepWorkSession } = useStore();
    const [loading, setLoading] = useState(true);

    // Mock aggregate data until backend aggregation is ready
    const totalDeepWorkHours = 42.5;
    const teamConsistency = 92.4;

    // Check for active session
    const activeSession = deepWorkSessions.find(s => s.status === 'active');

    useEffect(() => {
        // Simulate data fetching for refined feel
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-pink-500 mb-3">
                        <Users size={18} />
                        <span className="text-xs font-semibold uppercase tracking-widest">Team Command</span>
                    </div>
                    <h1 className="text-4xl font-bold text-glass-primary tracking-tight mb-2">Team Performance</h1>
                    <p className="text-glass-secondary text-sm">Collaborative insights and velocity tracking.</p>
                </div>

                <div className="flex items-center gap-3">
                    <GlassButton variant="secondary" className="flex items-center gap-2">
                        <Calendar size={16} /> Schedule Sync
                    </GlassButton>
                    <GlassButton
                        variant="primary"
                        className="flex items-center gap-2"
                        onClick={async () => {
                            if (startDeepWorkSession) {
                                await startDeepWorkSession('team-1');
                                setView?.({ type: 'LIVE_SESSION' });
                            }
                        }}
                    >
                        <Zap size={16} /> Start Session
                    </GlassButton>
                </div>
            </header>

            {/* Team Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="h-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Zap size={20} className="text-purple-500" />
                            </div>
                            <GlassBadge variant="success">+12%</GlassBadge>
                        </div>
                        <p className="text-3xl font-bold text-glass-primary mb-1">{totalDeepWorkHours}h</p>
                        <p className="text-sm text-glass-secondary">Total Deep Work (This Week)</p>
                    </div>
                </GlassCard>

                <GlassCard className="h-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Award size={20} className="text-blue-500" />
                            </div>
                            <GlassBadge variant="info">Top 5%</GlassBadge>
                        </div>
                        <p className="text-3xl font-bold text-glass-primary mb-1">{teamConsistency}</p>
                        <p className="text-sm text-glass-secondary">Team Consistency Score</p>
                    </div>
                </GlassCard>

                <GlassCard className="h-full col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="p-6 h-full flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-glass-primary mb-1">Weekly Top Contributor</h3>
                            <p className="text-2xl font-bold text-glass-primary">Alex Chen</p>
                            <div className="flex items-center gap-2 mt-2">
                                <GlassBadge variant="purple">7 Tasks</GlassBadge>
                                <GlassBadge variant="success">10.2h Focus</GlassBadge>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-amber-400/30 overflow-hidden shadow-lg shadow-amber-500/20">
                                <img src="https://ui-avatars.com/api/?name=Alex+Chen&background=random" alt="Winner" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full border border-white/20">
                                #1
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Main Content Grid: Leaderboard & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leaderboard Table */}
                <div className="lg:col-span-2">
                    <GlassPanel initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="p-6 border-b border-glass-border-subtle flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-glass-primary flex items-center gap-2">
                                <BarChart3 size={18} /> Performance Leaderboard
                            </h2>
                        </div>
                        <div className="p-6 text-center text-glass-secondary text-sm">
                            Leaderboard data aggregation in progress...
                        </div>
                    </GlassPanel>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-1">
                    <ActivityFeed />
                </div>
            </div>

            {/* Analytics Section */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                <div className="lg:col-span-2 h-full">
                    <TeamProductivityChart />
                </div>
                <div className="lg:col-span-1 h-full">
                    <TeamInsights />
                </div>
            </div>

            {/* Live Deep Work Session */}
            {activeSession ? (
                <GlassPanel
                    className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-green-500/50 flex items-center justify-center animate-pulse">
                                    <Clock size={24} className="text-green-400" />
                                </div>
                                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Live Team Session Active</h3>
                                <p className="text-white/60">{activeSession.participants.length} members are currently focusing. Join them?</p>
                            </div>
                        </div>
                        <GlassButton
                            variant="primary"
                            size="lg"
                            className="shadow-lg shadow-blue-500/20"
                            onClick={async () => {
                                if (joinDeepWorkSession) {
                                    await joinDeepWorkSession(activeSession.id);
                                    setView?.({ type: 'LIVE_SESSION' });
                                }
                            }}
                        >
                            Join Session
                        </GlassButton>
                    </div>
                </GlassPanel>
            ) : (
                <GlassPanel
                    className="bg-glass-panel/30 border-glass-border-subtle"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full border-2 border-glass-border-subtle flex items-center justify-center">
                                <Clock size={24} className="text-glass-secondary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-glass-primary mb-1">No Active Sessions</h3>
                                <p className="text-glass-secondary">Start a focused work block for the team.</p>
                            </div>
                        </div>
                        <GlassButton
                            variant="secondary"
                            size="lg"
                            onClick={async () => {
                                if (startDeepWorkSession) {
                                    await startDeepWorkSession('team-1');
                                    setView?.({ type: 'LIVE_SESSION' });
                                }
                            }}
                        >
                            Start New Session
                        </GlassButton>
                    </div>
                </GlassPanel>
            )}
        </div>
    );
};

export default TeamDashboard;
