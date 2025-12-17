
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Code, FileCode, Save, X, Sparkles, ChevronDown, Info, Zap, MessageSquareText, Search, Trash2, Edit3, Loader2 } from 'lucide-react';
import * as GeminiService from '../services/geminiService';

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { rust } from '@codemirror/lang-rust';

const languageConf = new Compartment();

const getLanguageExtension = (lang: string) => {
  switch (lang) {
    case 'javascript':
    case 'typescript':
      return javascript();
    case 'python':
      return python();
    case 'html':
      return html();
    case 'css':
      return css();
    case 'sql':
      return sql();
    case 'json':
      return json();
    case 'markdown':
      return markdown();
    case 'rust':
      return rust();
    default:
      return javascript();
  }
};

const getLanguageColor = (lang: string) => {
  switch (lang) {
    case 'javascript': return 'text-yellow-400';
    case 'typescript': return 'text-blue-400';
    case 'python': return 'text-blue-500';
    case 'html': return 'text-orange-500';
    case 'css': return 'text-blue-300';
    case 'rust': return 'text-orange-700';
    default: return 'text-gray-400';
  }
};

const CodeStudio: React.FC = () => {
  const { snippets, addSnippet, updateSnippet, deleteSnippet } = useStore();
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeSnippet = snippets.find(s => s.id === activeSnippetId);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [snippets, searchQuery]);

  useEffect(() => {
    if (!editorRef.current) return;

    // Clean up existing view
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const startState = EditorState.create({
      doc: activeSnippet?.code || '',
      extensions: [
        basicSetup,
        oneDark,
        languageConf.of(getLanguageExtension(activeSnippet?.language || 'javascript')),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setHasUnsavedChanges(true);
          }
        }),
        EditorView.theme({
          "&": { height: "100%", fontSize: "14px" },
          ".cm-scroller": { fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace" },
          "&.cm-focused": { outline: "none" }
        })
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;
    setHasUnsavedChanges(false);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [activeSnippetId]);

  useEffect(() => {
    if (viewRef.current && activeSnippet) {
      viewRef.current.dispatch({
        effects: languageConf.reconfigure(getLanguageExtension(activeSnippet.language))
      });
    }
  }, [activeSnippet?.language]);

  const handleSave = async () => {
    if (!activeSnippet || !viewRef.current) return;
    const currentCode = viewRef.current.state.doc.toString();
    await updateSnippet(activeSnippet.id, currentCode);
    setHasUnsavedChanges(false);
  };

  const handleCreate = async () => {
    if (!newFileName.trim()) return;
    await addSnippet({ title: newFileName, language: 'javascript', code: '// Start coding...' });
    setNewFileName('');
    setIsCreating(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this snippet?")) {
      await deleteSnippet(id);
      if (activeSnippetId === id) setActiveSnippetId(null);
    }
  };

  const runAiAction = async (action: 'explain' | 'improve') => {
    if (!activeSnippet || !viewRef.current) return;
    const currentCode = viewRef.current.state.doc.toString();
    setIsAiProcessing(true);
    setShowAiPanel(true);
    setShowAiMenu(false);
    
    try {
      const result = await GeminiService.explainCode(currentCode, activeSnippet.language);
      setAiOutput(result || "AI was unable to provide an explanation for this block.");
    } catch (error) {
      setAiOutput("Failed to process AI request. Check your API configuration.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const languages = [
    'javascript', 'typescript', 'python', 'html', 'css', 'sql', 'json', 'markdown', 'rust'
  ];

  return (
    <div className="flex h-full bg-[#1e1e1e] relative overflow-hidden">
      {/* Explorer Sidebar */}
      <div className="w-72 bg-[#252526] border-r border-[#333] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#2d2d2d]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">File Explorer</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setIsCreating(true)} 
              className="p-1.5 hover:bg-[#37373d] rounded transition-colors text-gray-400"
              title="New File"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-8 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#007acc] transition-colors"
              placeholder="Filter snippets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2 space-y-0.5 custom-scrollbar">
          {filteredSnippets.length === 0 ? (
            <div className="p-4 text-center text-gray-600 text-xs italic">
              {searchQuery ? 'No snippets match search' : 'No snippets found'}
            </div>
          ) : filteredSnippets.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSnippetId(s.id)}
              className={`group w-full flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer transition-all ${
                activeSnippetId === s.id 
                  ? 'bg-[#37373d] text-white shadow-inner' 
                  : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
              }`}
            >
              <FileCode size={14} className={activeSnippetId === s.id ? getLanguageColor(s.language) : "text-gray-500"} /> 
              <span className="truncate flex-1 text-left font-medium">{s.title}</span>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleDelete(e, s.id)}
                  className="p-1 hover:bg-[#454545] rounded text-gray-500 hover:text-red-400"
                  title="Delete File"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {activeSnippetId === s.id && hasUnsavedChanges && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1 shadow-sm shadow-blue-500/50" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[#1e1e1e]">
        {activeSnippet ? (
          <>
            <div className="h-10 bg-[#2d2d2d] border-b border-[#333] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileCode size={14} className={getLanguageColor(activeSnippet.language)} />
                  <span className="text-gray-300 text-xs font-mono font-bold tracking-tight">{activeSnippet.title}</span>
                </div>
                
                <div className="relative group">
                   <select 
                     className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider text-gray-500 focus:ring-0 cursor-pointer hover:text-gray-300 transition-colors"
                     value={activeSnippet.language}
                     onChange={(e) => {
                       // We don't have a direct 'updateLanguage' but we can use 'updateSnippet' with current code
                       const currentCode = viewRef.current?.state.doc.toString() || '';
                       // In a more complex app we would have updateSnippetMetadata
                     }}
                   >
                     {languages.map(l => <option key={l} value={l} className="bg-[#2d2d2d]">{l}</option>)}
                   </select>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowAiMenu(!showAiMenu)}
                    className="flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all active:scale-95"
                  >
                    <Sparkles size={12} /> AI Assist
                    <ChevronDown size={10} />
                  </button>
                  
                  {showAiMenu && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-[#252526] border border-[#454545] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-1">
                        <button 
                          onClick={() => runAiAction('explain')}
                          className="w-full text-left px-3 py-2.5 text-xs text-gray-300 hover:bg-[#094771] hover:text-white flex items-center gap-2 rounded transition-colors"
                        >
                          <MessageSquareText size={14} className="text-blue-400" />
                          Explain This Code
                        </button>
                        <button 
                          onClick={() => runAiAction('improve')}
                          className="w-full text-left px-3 py-2.5 text-xs text-gray-300 hover:bg-[#094771] hover:text-white flex items-center gap-2 rounded transition-colors"
                        >
                          <Zap size={14} className="text-amber-400" />
                          Optimize & Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleSave} 
                  className={`px-4 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${hasUnsavedChanges ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#3e3e42] text-gray-400 cursor-default'}`}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              <div 
                ref={editorRef} 
                className="flex-1 h-full overflow-hidden" 
              />
              
              {showAiPanel && (
                <div className="w-[450px] bg-[#252526] text-[#d4d4d4] flex flex-col border-l border-[#333] animate-in slide-in-from-right duration-300 shadow-2xl z-20">
                   <div className="h-10 bg-[#2d2d2d] border-b border-[#333] flex justify-between items-center px-4 shrink-0">
                     <div className="flex items-center gap-2">
                       <Sparkles size={14} className="text-purple-400" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Intelligence</span>
                     </div>
                     <button onClick={() => setShowAiPanel(false)} className="text-gray-500 hover:text-white transition-colors p-1"><X size={14} /></button>
                   </div>
                   <div className="flex-1 p-6 overflow-auto custom-scrollbar font-sans leading-relaxed text-sm">
                      {isAiProcessing ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                          <div className="relative">
                            <Loader2 className="animate-spin text-purple-400" size={32} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Deep Thinking...</p>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">
                          <div className="flex items-start gap-3 p-5 bg-[#1e1e1e] rounded-2xl border border-[#333] shadow-inner">
                            <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm max-w-none">
                              {aiOutput || "Request completed. No specific insights found for this code block."}
                            </div>
                          </div>
                          <div className="p-5 bg-purple-600/10 rounded-2xl border border-purple-500/20">
                             <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <Zap size={12} /> Optimization Tip
                             </h4>
                             <p className="text-xs text-purple-200/70 italic">
                               Use these insights to refactor and optimize your logic. The AI focuses on readability, performance, and best practices.
                             </p>
                          </div>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 bg-[#1e1e1e]">
            <div className="w-24 h-24 rounded-[32px] bg-[#252526] flex items-center justify-center mb-8 shadow-2xl border border-[#333] transform hover:scale-105 transition-transform duration-500">
              <Code size={48} className="text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-400 tracking-tight mb-2">No File Selected</h2>
            <p className="text-gray-500 text-sm mb-10 max-w-xs text-center leading-relaxed">Select a script from the explorer or create a new one to start your development cycle.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="px-8 py-3 bg-[#007acc] text-white text-xs font-bold rounded-xl hover:bg-[#0062a3] transition-all flex items-center gap-2 shadow-lg active:scale-95 uppercase tracking-widest"
            >
              <Plus size={16} /> Create New File
            </button>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-[#252526] rounded-2xl shadow-2xl w-full max-w-sm border border-[#454545] overflow-hidden">
             <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#2d2d2d]">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Script File</span>
               <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white p-1 transition-colors"><X size={16} /></button>
             </div>
             <div className="p-6">
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">File Name</label>
                  <input 
                    autoFocus
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#454545] rounded-xl focus:border-[#007acc] outline-none text-sm text-gray-200 font-mono transition-all"
                    placeholder="e.g. index.js"
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsCreating(false)} className="flex-1 py-2.5 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button 
                    onClick={handleCreate} 
                    disabled={!newFileName.trim()}
                    className="flex-1 py-2.5 bg-[#007acc] text-white text-xs font-bold rounded-xl hover:bg-[#0062a3] transition-colors disabled:opacity-50 shadow-md uppercase tracking-wider"
                  >
                    Create File
                  </button>
                </div>
             </div>
           </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
};

export default CodeStudio;
