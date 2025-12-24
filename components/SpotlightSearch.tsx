import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Search, Folder, CheckSquare, FileText, ArrowRight, Link as LinkIcon, X, Command } from 'lucide-react';
import { ViewState } from '../types.ts';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: ViewState) => void;
}

const SpotlightSearch: React.FC<SpotlightProps> = ({ isOpen, onClose, setView }) => {
  const { projects, tasks, notes, assets } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    const projectResults = projects
      .filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .map(p => ({
        type: 'Project',
        id: p.id,
        title: p.title,
        detail: 'Project Workspace',
        onClick: () => setView({ type: 'PROJECT_DETAIL', projectId: p.id })
      }));

    const taskResults = tasks
      .filter(t => t.title.toLowerCase().includes(q))
      .map(t => ({
        type: 'Task',
        id: t.id,
        title: t.title,
        detail: `Task in ${projects.find(p => p.id === t.projectId)?.title || 'Unknown Project'}`,
        onClick: () => setView({ type: 'PROJECT_DETAIL', projectId: t.projectId })
      }));

    const noteResults = notes
      .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .map(n => ({
        type: 'Note',
        id: n.id,
        title: n.title,
        detail: 'Note / Idea',
        onClick: () => {
          if (n.projectId) setView({ type: 'PROJECT_DETAIL', projectId: n.projectId });
          else setView({ type: 'IDEAS' });
        }
      }));

    const assetResults = assets
      .filter(a => a.name.toLowerCase().includes(q) || a.url.toLowerCase().includes(q))
      .map(a => ({
        type: 'Asset',
        id: a.id,
        title: a.name,
        detail: `Linked ${a.type}`,
        onClick: () => window.open(a.url, '_blank')
      }));

    return [...projectResults, ...assetResults, ...taskResults, ...noteResults].slice(0, 8);
  }, [query, projects, tasks, notes, assets, setView]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].onClick();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'Project': return <Folder size={18} />;
      case 'Task': return <CheckSquare size={18} />;
      case 'Note': return <FileText size={18} />;
      case 'Asset': return <LinkIcon size={18} />;
      default: return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] glass-overlay animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl glass-modal overflow-hidden flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-5 py-4 border-b border-gray-100/50">
          <Search className="text-gray-400 mr-4" size={20} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-lg text-gray-900 placeholder-gray-400"
            placeholder="Search projects, tasks, notes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <kbd className="text-xs text-gray-400 bg-gray-100/80 px-2 py-1 rounded border border-gray-200/50 flex items-center gap-1">
              <Command size={10} /> K
            </kbd>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100/50 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Results */}
        {filtered.length > 0 && (
          <div className="py-2 max-h-[400px] overflow-auto custom-scrollbar">
            {filtered.map((item, index) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className={`w-full px-5 py-3 flex items-center text-left transition-all group ${index === selectedIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'hover:bg-gray-50/80'
                  }`}
              >
                <div className={`mr-4 w-6 flex justify-center ${index === selectedIndex ? 'text-white/80' : 'text-gray-400'
                  }`}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${index === selectedIndex ? 'text-white' : 'text-gray-900'
                    }`}>{item.title}</div>
                  <div className={`text-xs truncate ${index === selectedIndex ? 'text-white/70' : 'text-gray-500'
                    }`}>{item.detail}</div>
                </div>
                {item.type === 'Asset' ? (
                  <LinkIcon size={14} className={`rotate-[-45deg] ${index === selectedIndex ? 'text-white/60' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                    } transition-opacity`} />
                ) : (
                  <ArrowRight size={14} className={`${index === selectedIndex ? 'text-white/60' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                    } transition-opacity`} />
                )}
              </button>
            ))}
          </div>
        )}

        {query && filtered.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <Search size={32} className="mx-auto mb-3 text-gray-200" />
            <p>No results found for "{query}"</p>
          </div>
        )}

        {!query && (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-400">Type to search your entire ecosystem</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><kbd className="bg-gray-100/80 px-1.5 rounded">↑</kbd><kbd className="bg-gray-100/80 px-1.5 rounded">↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-gray-100/80 px-1.5 rounded">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="bg-gray-100/80 px-2 rounded">esc</kbd> close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotlightSearch;
