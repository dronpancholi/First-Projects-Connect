import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Plus, Search, FileText, Calendar, X, ArrowUpRight, Trash2 } from 'lucide-react';
import { Note, ProjectStatus } from '../types.ts';
import { GlassCard, GlassModal, GlassButton, GlassInput, GlassTextarea, GlassBadge } from './ui/LiquidGlass.tsx';

const IdeasView: React.FC = () => {
  const { notes, projects, addNote, updateNote, addProject, deleteNote } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'IDEAS' | 'PROJECTS'>('ALL');
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'IDEAS') return !n.projectId;
    if (filter === 'PROJECTS') return !!n.projectId;
    return true;
  });

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await addNote({
      title: newTitle,
      content: newContent,
    });
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const handleUpdate = async () => {
    if (!editingNote) return;
    await updateNote(editingNote.id, editingNote.content);
    setEditingNote(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Delete note "${title}"?`)) {
      deleteNote(id);
      if (editingNote?.id === id) setEditingNote(null);
    }
  };

  const handlePromoteToProject = async () => {
    if (!editingNote) return;
    if (confirm(`Create a new project from "${editingNote.title}"?`)) {
      await addProject({
        title: editingNote.title,
        description: editingNote.content,
        status: ProjectStatus.ACTIVE,
        tags: ['promoted-idea']
      });
      setEditingNote(null);
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId)?.title;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <FileText size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Knowledge Base</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ideas & Notes</h1>
          <p className="text-gray-500 text-sm mt-1">Capture thoughts, draft plans, and document everything.</p>
        </div>
        <GlassButton variant="primary" onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus size={16} /> New Idea
        </GlassButton>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-11 pr-4 py-3 glass-input"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex glass-card-subtle p-1 rounded-xl">
          {(['ALL', 'IDEAS', 'PROJECTS'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {f === 'ALL' ? 'All Notes' : f === 'IDEAS' ? 'Loose Ideas' : 'Project Notes'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 overflow-auto custom-scrollbar">
        {filteredNotes.map(note => (
          <GlassCard
            key={note.id}
            onClick={() => setEditingNote(note)}
            className="cursor-pointer group"
          >
            <div className="p-5 flex flex-col h-64 relative">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{note.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    {getProjectName(note.projectId) && (
                      <GlassBadge variant="primary" className="text-[10px] truncate max-w-[100px]">
                        {getProjectName(note.projectId)}
                      </GlassBadge>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, note.id, note.title)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap flex-1">
                {note.content}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
            </div>
          </GlassCard>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full text-center py-16">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">No notes found</p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-sm text-blue-600 font-medium mt-2 hover:underline"
            >
              Create your first note
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <GlassModal onClose={() => setIsCreating(false)}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">New Idea</h3>
                <p className="text-sm text-gray-500 mt-1">Capture your thoughts</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Title</label>
                <GlassInput
                  placeholder="Title your thought..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Content</label>
                <GlassTextarea
                  placeholder="Start typing..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={8}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <GlassButton onClick={() => setIsCreating(false)}>
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleCreate}
                disabled={!newTitle.trim()}
              >
                Save Note
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Edit Modal */}
      {editingNote && (
        <GlassModal onClose={() => setEditingNote(null)}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{editingNote.title}</h3>
                <span className="text-xs text-gray-400">Last edited {new Date(editingNote.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                {!editingNote.projectId && (
                  <GlassButton onClick={handlePromoteToProject} className="flex items-center gap-1 text-xs">
                    <ArrowUpRight size={12} /> Convert to Project
                  </GlassButton>
                )}
                <button
                  onClick={(e) => handleDelete(e, editingNote.id, editingNote.title)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setEditingNote(null)} className="p-2 text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
            </div>

            <GlassTextarea
              value={editingNote.content}
              onChange={e => setEditingNote({ ...editingNote, content: e.target.value })}
              rows={12}
            />

            <div className="mt-8 flex justify-end gap-3">
              <GlassButton onClick={() => setEditingNote(null)}>
                Cancel
              </GlassButton>
              <GlassButton variant="primary" onClick={handleUpdate}>
                Save Changes
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};

export default IdeasView;
