import React, { useState, useEffect } from 'react';
import { GlassPanel, GlassButton, GlassInput, GlassBadge } from '../ui/LiquidGlass.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Clock, Users, Mic, MicOff, MessageSquare, X, Play, Pause, Square } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveSessionPanel: React.FC = () => {
    const { deepWorkSessions, endDeepWorkSession, joinDeepWorkSession } = useStore();
    const { user } = useAuth();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [goal, setGoal] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    // Find the active session for the current user or the first active team session
    const activeSession = deepWorkSessions.find(s =>
        s.status === 'active' &&
        (s.participants.some(p => p.user_id === user?.id && p.status === 'active') || s.host_id === user?.id)
    );

    // If not in a session, maybe show available sessions to join?
    // For now, let's assume we are directed here when joining/creating.
    // But if we refresh, we need to find it.

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeSession) {
            const startTime = new Date(activeSession.started_at).getTime();
            interval = setInterval(() => {
                const now = new Date().getTime();
                setElapsedTime(Math.floor((now - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!activeSession) {
        return (
            <div className="h-full flex items-center justify-center">
                <GlassPanel className="p-8 text-center max-w-md">
                    <Clock size={48} className="mx-auto mb-4 text-glass-muted" />
                    <h2 className="text-xl font-bold text-glass-primary mb-2">No Active Session</h2>
                    <p className="text-glass-secondary mb-6">You are not currently in a Live Deep Work session.</p>
                    <GlassButton variant="primary" onClick={() => { /* Navigate back? */ }}>Return to Dashboard</GlassButton>
                </GlassPanel>
            </div>
        );
    }

    const isHost = activeSession.host_id === user?.id;

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            </div>

            <GlassPanel className="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden min-h-[500px] h-auto relative z-10 p-0">
                {/* Main Focus Area */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center border-r border-glass-border-subtle">
                    <div className="mb-8 text-center">
                        <GlassBadge variant="primary" className="mb-4">Deep Work Session</GlassBadge>
                        <motion.div
                            className="text-8xl font-bold tabular-nums bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 tracking-tighter"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            {formatTime(elapsedTime)}
                        </motion.div>
                        <p className="text-glass-secondary mt-2">Focus Time</p>
                    </div>

                    <div className="w-full max-w-md mb-8">
                        <GlassInput
                            placeholder="What are you working on?"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="text-center bg-glass-subtle/50 border-transparent focus:border-glass-border"
                        />
                    </div>

                    <div className="flex gap-4">
                        <GlassButton
                            variant={isMuted ? "ghost" : "secondary"}
                            onClick={() => setIsMuted(!isMuted)}
                            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </GlassButton>

                        {isHost ? (
                            <GlassButton variant="danger" onClick={() => endDeepWorkSession(activeSession.id)} className="px-8">
                                End Session
                            </GlassButton>
                        ) : (
                            <GlassButton variant="secondary" onClick={() => {/* Leave logic */ }} className="px-8">
                                Leave Session
                            </GlassButton>
                        )}
                    </div>
                </div>

                {/* Sidebar / Participants */}
                <div className="w-full md:w-80 bg-glass-subtle/30 flex flex-col">
                    <div className="p-4 border-b border-glass-border-subtle flex justify-between items-center">
                        <h3 className="font-semibold text-glass-primary flex items-center gap-2">
                            <Users size={16} /> Participants
                            <span className="text-xs bg-glass-background px-2 py-0.5 rounded-full text-glass-secondary">
                                {activeSession.participants.length}
                            </span>
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {activeSession.participants.map((p, i) => (
                            <div key={p.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass-subtle transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-glass-border flex items-center justify-center text-sm font-bold text-glass-primary">
                                    {/* Placeholder avatar logic */}
                                    U{i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-glass-primary truncate">User {p.user_id.slice(0, 4)}</p>
                                    <p className="text-xs text-glass-secondary truncate">{p.status === 'active' ? 'Focusing...' : 'Away'}</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-glass-border-subtle">
                        <GlassButton variant="ghost" className="w-full justify-start gap-2 text-xs">
                            <MessageSquare size={14} /> Team Chat (Coming Soon)
                        </GlassButton>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};

export default LiveSessionPanel;
