import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Briefcase, FileText, CheckCircle, FolderOpen, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: ViewState) => void;
}

const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose, setView }) => {
  const { projects, tasks, notes, assets } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const items: { type: string; icon: React.ReactNode; title: string; subtitle: string; action: () => void }[] = [];

    projects.filter(p => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(p => items.push({
        type: 'Project',
        icon: <Briefcase size={18} className="text-purple-400" />,
        title: p.title,
        subtitle: p.description || 'No description',
        action: () => { setView({ type: 'PROJECT_DETAIL', projectId: p.id }); onClose(); }
      }));

    tasks.filter(t => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(t => items.push({
        type: 'Task',
        icon: <CheckCircle size={18} className="text-blue-400" />,
        title: t.title,
        subtitle: t.status,
        action: () => { setView({ type: 'KANBAN' }); onClose(); }
      }));

    notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(n => items.push({
        type: 'Note',
        icon: <FileText size={18} className="text-amber-400" />,
        title: n.title,
        subtitle: n.content.substring(0, 50) + '...',
        action: () => { setView({ type: 'IDEAS' }); onClose(); }
      }));

    assets.filter(a => a.name.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(a => items.push({
        type: 'Asset',
        icon: <FolderOpen size={18} className="text-orange-400" />,
        title: a.name,
        subtitle: a.type,
        action: () => { setView({ type: 'RESOURCES' }); onClose(); }
      }));

    return items;
  }, [query, projects, tasks, notes, assets, setView, onClose]);

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      results[selectedIndex].action();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] glass-overlay flex items-start justify-center pt-[15vh] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-2xl mx-6 overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 p-5 border-b border-white/10 relative">
          <Search size={22} className="text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyNavigation}
            placeholder="Search projects, tasks, notes..."
            className="flex-1 bg-transparent outline-none text-lg text-white placeholder-white/30"
          />
          <div className="flex items-center gap-2">
            <kbd className="glass-badge text-xs">ESC</kbd>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-white/30">
              <Search size={40} className="mx-auto mb-4 opacity-30" />
              <p>Start typing to search...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-white/30">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={result.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${index === selectedIndex
                      ? 'glass-card bg-purple-500/20 border-purple-500/30'
                      : 'hover:bg-white/5'
                    }`}
                >
                  <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{result.title}</p>
                      <span className="text-xs text-white/30">{result.type}</span>
                    </div>
                    <p className="text-sm text-white/40 truncate">{result.subtitle}</p>
                  </div>
                  <ArrowRight size={16} className="text-white/20" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="glass-badge px-1.5">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="glass-badge px-1.5">↵</kbd> Open
            </span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
