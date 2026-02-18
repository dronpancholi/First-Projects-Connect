import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { GlassButton, GlassInput } from '../ui/LiquidGlass.tsx';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PeerFeedbackProps {
    reflectionId: string;
    onClose?: () => void;
}

const PeerFeedback: React.FC<PeerFeedbackProps> = ({ reflectionId, onClose }) => {
    const { comments, addComment } = useStore();
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');

    const reflectionComments = comments.filter(c => c.reflection_id === reflectionId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        await addComment({
            reflection_id: reflectionId,
            user_id: user.id,
            content: newComment
        });
        setNewComment('');
    };

    return (
        <div className="mt-4 bg-glass-subtle/50 rounded-xl p-4 border border-glass-border-subtle">
            <h4 className="text-sm font-semibold text-glass-primary mb-3 flex items-center gap-2">
                <MessageSquare size={14} /> Peer Feedback
            </h4>

            <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                    {reflectionComments.length === 0 ? (
                        <p className="text-xs text-glass-secondary/60 italic text-center py-2">No feedback yet. Be the first!</p>
                    ) : (
                        reflectionComments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 text-sm"
                            >
                                <div className="w-6 h-6 rounded-full bg-glass-border flex-shrink-0 flex items-center justify-center text-[10px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                    {comment.author?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-medium text-glass-primary text-xs">{comment.author?.full_name || 'User'}</span>
                                        <span className="text-[10px] text-glass-muted">{new Date(comment.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-glass-secondary text-xs mt-0.5">{comment.content}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <GlassInput
                    placeholder="Add your feedback..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="pr-10 py-2 text-xs"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
};

export default PeerFeedback;
