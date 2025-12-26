import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Lightbulb, Plus, X, Trash2, Clock, Edit3, Search } from 'lucide-react';
import { GlassCard, GlassModal, GlassButton, GlassInput, GlassTextarea, GlassBadge } from './ui/LiquidGlass.tsx';

const IdeasView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addNote({ title, content });
    resetForm();
  };

  const handleUpdate = (noteId: string) => {
    updateNote(noteId, content);
    setEditingNote(null);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setShowModal(false);
    setEditingNote(null);
  };

  const getRandomGradient = (index: number) => {
    const gradients = [
      'from-purple-500/20 to-pink-500/20',
      'from-blue-500/20 to-cyan-500/20',
      'from-green-500/20 to-emerald-500/20',
      'from-amber-500/20 to-orange-500/20',
      'from-rose-500/20 to-red-500/20'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <Lightbulb size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest">Knowledge Base</span>
          </div>
          <h1 className="text-4xl font-bold text-glass-primary tracking-tight mb-2">Insights</h1>
          <p className="text-glass-secondary text-sm">Capture ideas, notes, and documentation.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-muted" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="glass-input pl-11 pr-4 py-3 w-64"
            />
          </div>
          <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus size={18} /> New Note
          </GlassButton>
        </div>
      </header>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-card-subtle p-20 text-center rounded-3xl border-2 border-dashed border-white/10">
          <Lightbulb size={64} className="mx-auto text-white/20 mb-6" />
          <h3 className="text-xl font-semibold text-white/40 mb-3">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-sm text-white/30 mb-8 max-w-md mx-auto">
            {searchQuery ? 'Try a different search term' : 'Start capturing your ideas and thoughts.'}
          </p>
          {!searchQuery && (
            <GlassButton variant="primary" onClick={() => setShowModal(true)}>
              Create First Note
            </GlassButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, index) => (
            <GlassCard key={note.id} className={`group bg-gradient-to-br ${getRandomGradient(index)}`}>
              <div className="p-6 flex flex-col h-full min-h-[200px]">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-glass-primary truncate flex-1">{note.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingNote(note.id);
                        setContent(note.content);
                      }}
                      className="p-2 text-glass-muted hover:text-blue-500 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-2 text-glass-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {editingNote === note.id ? (
                  <div className="flex-1 flex flex-col gap-3">
                    <textarea
                      className="flex-1 glass-input resize-none text-sm"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <GlassButton size="sm" onClick={() => setEditingNote(null)}>Cancel</GlassButton>
                      <GlassButton size="sm" variant="primary" onClick={() => handleUpdate(note.id)}>Save</GlassButton>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-glass-secondary flex-1 line-clamp-4 leading-relaxed">
                    {note.content || 'No content'}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-glass-border-subtle flex items-center gap-2 text-xs text-glass-muted">
                  <Clock size={12} />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <GlassModal onClose={resetForm}>
          <form onSubmit={handleCreate}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-glass-primary">New Note</h3>
                  <p className="text-sm text-glass-secondary mt-1">Capture your thoughts</p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 text-glass-muted hover:text-glass-primary transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Title</label>
                  <GlassInput
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Note title"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Content</label>
                  <GlassTextarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your notes here..."
                    rows={6}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <GlassButton type="button" onClick={resetForm}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  Create Note
                </GlassButton>
              </div>
            </div>
          </form>
        </GlassModal>
      )}
    </div>
  );
};

export default IdeasView;
