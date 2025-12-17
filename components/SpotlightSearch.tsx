import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Folder, CheckSquare, FileText, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: ViewState) => void;
}

const SpotlightSearch: React.FC<SpotlightProps> = ({ isOpen, onClose, setView }) => {
  const { projects, tasks, notes } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    
    const projectResults = projects
      .filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .map(p => ({ type: 'Project', id: p.id, title: p.title, detail: p.description, onClick: () => setView({ type: 'PROJECT_DETAIL', projectId: p.id }) }));
      
    const taskResults = tasks
      .filter(t => t.title.toLowerCase().includes(q))
      .map(t => ({ type: 'Task', id: t.id, title: t.title, detail: 'Task', onClick: () => setView({ type: 'PROJECT_DETAIL', projectId: t.projectId }) })); // Ideally deep link to task

    const noteResults = notes
      .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .map(n => ({ type: 'Note', id: n.id, title: n.title, detail: 'Note', onClick: () => setView({ type: 'PROJECT_DETAIL', projectId: n.projectId || '' }) }));

    return [...projectResults, ...taskResults, ...noteResults].slice(0, 5);
  }, [query, projects, tasks, notes, setView]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onMouseDown={onClose}>
      <div 
        className="w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <Search className="text-gray-400 mr-3" size={20} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-lg text-gray-900 placeholder-gray-400"
            placeholder="Search ecosystem..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ESC</div>
        </div>

        {filtered.length > 0 && (
          <div className="py-2">
            {filtered.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className="w-full px-4 py-3 flex items-center hover:bg-apple-blue hover:text-white transition-colors group text-left"
              >
                <div className="mr-4 text-gray-400 group-hover:text-white/80">
                  {item.type === 'Project' && <Folder size={18} />}
                  {item.type === 'Task' && <CheckSquare size={18} />}
                  {item.type === 'Note' && <FileText size={18} />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500 group-hover:text-white/70">{item.detail}</div>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
        
        {query && filtered.length === 0 && (
           <div className="p-8 text-center text-gray-500">No results found.</div>
        )}

        {!query && (
           <div className="p-4 bg-gray-50/50 text-xs text-gray-400 text-center">
             Type to search projects, tasks, notes, and assets.
           </div>
        )}
      </div>
    </div>
  );
};

export default SpotlightSearch;
