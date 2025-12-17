
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Terminal, Code, FileCode, Play, Save, FileJson, FileType, Database, Eye, X, Sparkles } from 'lucide-react';
import { CodeSnippet } from '../types';
import * as GeminiService from '../services/geminiService';

const CodeStudio: React.FC = () => {
  const { snippets, addSnippet, updateSnippet } = useStore();
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  
  const activeSnippet = snippets.find(s => s.id === activeSnippetId);
  const [localCode, setLocalCode] = useState(activeSnippet?.code || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  React.useEffect(() => {
    if (activeSnippet) {
      setLocalCode(activeSnippet.code);
      setHasUnsavedChanges(false);
      setShowPreview(false);
    }
  }, [activeSnippetId]);

  const handleCreate = async () => {
    if (!newFileName.trim()) return;
    await addSnippet({ title: newFileName, language: 'javascript', code: '// Start coding...' });
    setNewFileName('');
    setIsCreating(false);
  };

  const handleAiHelp = async () => {
    if (!activeSnippet) return;
    setIsAiProcessing(true);
    const explanation = await GeminiService.explainCode(localCode, activeSnippet.language);
    setConsoleOutput([explanation]);
    setShowPreview(true);
    setIsAiProcessing(false);
  };

  return (
    <div className="flex h-full bg-white relative overflow-hidden">
      <div className="w-64 bg-gray-50 border-r flex flex-col shrink-0">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400">EXPLORER</span>
          <button onClick={() => setIsCreating(true)} className="p-1 hover:bg-white rounded shadow-sm border"><Plus size={16} /></button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {snippets.map(s => (
            <button key={s.id} onClick={() => setActiveSnippetId(s.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${activeSnippetId === s.id ? 'bg-white text-blue-600 shadow-sm border' : 'text-gray-600'}`}>
              <FileCode size={16} /> <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative h-full">
        {activeSnippet ? (
          <>
            <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4 shrink-0">
              <span className="text-gray-300 text-sm">{activeSnippet.title}</span>
              <div className="flex gap-2">
                <button 
                  onClick={handleAiHelp}
                  disabled={isAiProcessing}
                  className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50"
                >
                  <Sparkles size={14} /> AI Help
                </button>
                <button onClick={() => updateSnippet(activeSnippet.id, localCode).then(() => setHasUnsavedChanges(false))} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded">Save</button>
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <textarea
                className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 outline-none leading-relaxed resize-none"
                value={localCode}
                onChange={e => { setLocalCode(e.target.value); setHasUnsavedChanges(true); }}
                spellCheck={false}
              />
              {showPreview && (
                <div className="w-1/3 bg-[#0d0d0d] text-green-400 p-4 font-mono text-xs overflow-auto border-l border-[#333]">
                   <div className="flex justify-between mb-4 border-b border-green-900 pb-2">
                     <span className="uppercase font-bold">Output</span>
                     <button onClick={() => setShowPreview(false)}><X size={14} /></button>
                   </div>
                   {consoleOutput.map((l, i) => <div key={i} className="mb-2 whitespace-pre-wrap">{l}</div>)}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600"><Code size={64} className="opacity-10 mb-4" /><p>Select a file to edit</p></div>
        )}
      </div>
    </div>
  );
};

export default CodeStudio;
