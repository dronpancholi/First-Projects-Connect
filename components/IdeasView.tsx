import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, FileText, Tag, Calendar, X, ExternalLink } from 'lucide-react';
import { Note } from '../types';

const IdeasView: React.FC = () => {
  const { notes, projects, addNote, updateNote } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'IDEAS' | 'PROJECTS'>('ALL');
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Note State
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
      // projectId is undefined for standalone ideas
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

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId)?.title;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-apple-text tracking-tight">Ideas & Notes</h1>
          <p className="text-gray-500 mt-1">Capture thoughts, draft plans, and document everything.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 w-fit"
        >
          <Plus size={16} />
          New Idea
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['ALL', 'IDEAS', 'PROJECTS'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === f ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'ALL' ? 'All Notes' : f === 'IDEAS' ? 'Loose Ideas' : 'Project Notes'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredNotes.map(note => (
          <div 
            key={note.id}
            onClick={() => setEditingNote(note)}
            className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-apple-blue/30 transition-all cursor-pointer flex flex-col h-64 relative overflow-hidden"
          >
            <div className="mb-2">
              <h3 className="font-bold text-gray-900 line-clamp-1">{note.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                {getProjectName(note.projectId) && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                    {getProjectName(note.projectId)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap">
              {note.content}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        ))}
        
        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400">
            <FileText className="mx-auto mb-3 opacity-20" size={48} />
            <p>No notes found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <span className="text-sm font-semibold text-gray-500">New Idea</span>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto flex flex-col gap-4">
              <input 
                className="text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none w-full bg-transparent"
                placeholder="Title your thought..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                autoFocus
              />
              <textarea 
                className="flex-1 resize-none outline-none text-gray-600 leading-relaxed min-h-[300px] bg-transparent placeholder-gray-300"
                placeholder="Start typing..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <span className="text-sm font-semibold text-gray-500">Editing</span>
              <button onClick={() => setEditingNote(null)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{editingNote.title}</h2>
                {editingNote.projectId && (
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 flex items-center gap-1">
                    <Tag size={10} />
                    Linked to Project
                  </div>
                )}
              </div>
              <textarea 
                className="flex-1 resize-none outline-none text-gray-600 leading-relaxed min-h-[300px] bg-transparent"
                value={editingNote.content}
                onChange={e => setEditingNote({...editingNote, content: e.target.value})}
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-400">Last edited {new Date(editingNote.updatedAt).toLocaleString()}</span>
              <button 
                onClick={handleUpdate}
                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasView;
