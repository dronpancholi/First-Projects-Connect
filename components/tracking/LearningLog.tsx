import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { GlassCard, GlassButton, GlassInput, GlassTextarea, GlassBadge } from '../ui/LiquidGlass.tsx';
import { Clock, BookOpen, Plus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LearningLog: React.FC = () => {
    const { learningSessions, addLearningSession, isLoading } = useStore();
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        await addLearningSession({
            user_id: '', // Handled by backend/store
            topic,
            duration_minutes: Math.round(elapsedSeconds / 60) || 30, // Default or calculated
            notes,
            started_at: new Date().toISOString(),
            ended_at: new Date().toISOString()
        });

        setTopic('');
        setNotes('');
        setShowForm(false);
        setElapsedSeconds(0);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-glass-primary flex items-center gap-2">
                    <BookOpen className="text-purple-400" /> Learning Log
                </h2>
                <GlassButton size="sm" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} /> Log Session
                </GlassButton>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <GlassCard className="mb-6">
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-glass-secondary mb-1">Topic / Subject</label>
                                    <GlassInput
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="What are you learning?"
                                        required
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-glass-secondary mb-1">Duration (min)</label>
                                        <GlassInput
                                            type="number"
                                            value={Math.round(elapsedSeconds / 60) || 30}
                                            onChange={(e) => setElapsedSeconds(parseInt(e.target.value) * 60)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm text-glass-secondary mb-1">Date</label>
                                        <GlassInput
                                            type="datetime-local"
                                            defaultValue={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-glass-secondary mb-1">Key Takeaways</label>
                                    <GlassTextarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="What did you learn today?"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <GlassButton variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</GlassButton>
                                    <GlassButton variant="primary" type="submit">Save Entry</GlassButton>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {learningSessions.slice(0, 5).map((session, i) => (
                    <GlassCard key={session.id} className="group hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-glass-primary">{session.topic}</h3>
                                <p className="text-sm text-glass-secondary mt-1">{session.notes}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-glass-secondary">
                                    <Calendar size={12} />
                                    {new Date(session.started_at).toLocaleDateString()}
                                    <span className="w-1 h-1 rounded-full bg-glass-border" />
                                    <Clock size={12} />
                                    {session.duration_minutes} min
                                </div>
                            </div>
                            <GlassBadge variant="default">Completed</GlassBadge>
                        </div>
                    </GlassCard>
                ))}
                {learningSessions.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-glass-secondary">
                        No learning sessions recorded yet. Start tracking your progress!
                    </div>
                )}
            </div>
        </div>
    );
};
