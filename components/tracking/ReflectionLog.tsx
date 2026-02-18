import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { GlassCard, GlassButton, GlassTextarea, GlassBadge } from '../ui/LiquidGlass.tsx';
import { Sparkles, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReflectionLog: React.FC = () => {
    const { reflections, addReflection } = useStore();
    const [content, setContent] = useState('');

    // Check if recorded today
    const today = new Date().toDateString();
    const hasReflectedToday = reflections.some(r => new Date(r.created_at).toDateString() === today);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        await addReflection({
            user_id: '',
            content,
            type: 'daily'
        });
        setContent('');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-glass-primary flex items-center gap-2">
                    <Sparkles className="text-yellow-400" /> Daily Reflection
                </h2>
                {hasReflectedToday && (
                    <GlassBadge variant="success">Completed for Today</GlassBadge>
                )}
            </div>

            {!hasReflectedToday ? (
                <GlassCard>
                    <form onSubmit={handleSubmit} className="p-6">
                        <p className="text-glass-secondary mb-4 text-sm">
                            Take a moment to reflect on your progress. What went well? What could be improved?
                        </p>
                        <div>
                            <label className="block text-sm text-glass-secondary mb-1">Reflection</label>
                            <GlassTextarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Today I accomplished..."
                                className="min-h-[120px] mb-4"
                            />
                        </div>
                        <div className="flex justify-end">
                            <GlassButton variant="primary" type="submit" disabled={!content.trim()} className="gap-2">
                                <Send size={16} /> Save Reflection
                            </GlassButton>
                        </div>
                    </form>
                </GlassCard>
            ) : (
                <div className="grid gap-4">
                    {reflections.slice(0, 3).map((reflection, i) => (
                        <GlassCard key={reflection.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2 text-xs text-glass-secondary uppercase tracking-wider font-semibold">
                                    <MessageSquare size={12} />
                                    {new Date(reflection.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                </div>
                                <p className="text-glass-primary whitespace-pre-wrap leading-relaxed">
                                    {reflection.content}
                                </p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};
