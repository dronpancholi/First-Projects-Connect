import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Terminal, Code, FileCode, Play, Trash2, Save, FileJson, FileType, Database } from 'lucide-react';
import { CodeSnippet } from '../types';

const CodeStudio: React.FC = () => {
  const { snippets, addSnippet, updateSnippet } = useStore();
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  
  const activeSnippet = snippets.find(s => s.id === activeSnippetId);
  const [localCode, setLocalCode] = useState(activeSnippet?.code || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local code when switching files
  React.useEffect(() => {
    if (activeSnippet) {
      setLocalCode(activeSnippet.code);
      setHasUnsavedChanges(false);
    }
  }, [activeSnippetId, snippets]);

  const handleCreate = async () => {
    const title = prompt("Filename (e.g., script.js):");
    if (!title) return;
    
    let language: CodeSnippet['language'] = 'javascript';
    if (title.endsWith('.ts')) language = 'typescript';
    if (title.endsWith('.py')) language = 'python';
    if (title.endsWith('.html')) language = 'html';
    if (title.endsWith('.css')) language = 'css';
    if (title.endsWith('.sql')) language = 'sql';
    if (title.endsWith('.json')) language = 'json';
    if (title.endsWith('.rs')) language = 'rust';
    if (title.endsWith('.go')) language = 'go';

    await addSnippet({
      title,
      language,
      code: '// Start coding...'
    });
  };

  const handleSave = async () => {
    if (activeSnippetId) {
      await updateSnippet(activeSnippetId, localCode);
      setHasUnsavedChanges(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalCode(e.target.value);
    setHasUnsavedChanges(true);
  };

  const getFileIcon = (lang: string) => {
    switch(lang) {
      case 'javascript': case 'typescript': return <FileCode size={16} className="text-yellow-500" />;
      case 'html': return <FileType size={16} className="text-orange-500" />;
      case 'css': return <FileType size={16} className="text-blue-500" />;
      case 'python': return <Terminal size={16} className="text-blue-400" />;
      case 'sql': return <Database size={16} className="text-purple-500" />;
      case 'json': return <FileJson size={16} className="text-gray-500" />;
      default: return <Code size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100/50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Explorer</span>
          <button onClick={handleCreate} className="text-gray-500 hover:text-black hover:bg-white p-1 rounded transition-all">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {snippets.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSnippetId(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                activeSnippetId === s.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'
              }`}
            >
              {getFileIcon(s.language)}
              <span className="truncate">{s.title}</span>
            </button>
          ))}
          {snippets.length === 0 && (
             <div className="text-center p-8 text-gray-400 text-xs">
               No files created.
             </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {activeSnippet ? (
          <>
            {/* Editor Toolbar */}
            <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <span>{activeSnippet.title}</span>
                {hasUnsavedChanges && <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    hasUnsavedChanges ? 'bg-blue-600 text-white hover:bg-blue-500' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Save size={14} />
                  Save
                </button>
                <button className="text-green-500 hover:bg-[#333] p-1.5 rounded transition-colors" title="Run (Simulated)">
                  <Play size={14} />
                </button>
              </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 relative">
              <textarea
                className="absolute inset-0 w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 resize-none outline-none leading-relaxed"
                value={localCode}
                onChange={handleChange}
                spellCheck={false}
                style={{ fontSize: '14px', lineHeight: '1.6' }}
              />
            </div>
            
            {/* Status Bar */}
            <div className="h-6 bg-[#007acc] text-white text-[10px] flex items-center px-4 justify-between">
               <div className="flex gap-4">
                 <span>Ln 1, Col 1</span>
                 <span>UTF-8</span>
               </div>
               <span className="uppercase">{activeSnippet.language}</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Code size={48} className="mb-4 opacity-20" />
            <p>Select or create a file to start coding.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeStudio;
