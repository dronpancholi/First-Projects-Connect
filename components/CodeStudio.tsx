
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Code, FileCode, Save, X, Sparkles, ChevronDown, Check, Info, Zap, Bug, MessageSquareText } from 'lucide-react';
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

const CodeStudio: React.FC = () => {
  const { snippets, addSnippet, updateSnippet } = useStore();
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  
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

  useEffect(() => {
    if (!editorRef.current) return;

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

  const runAiAction = async (action: 'explain' | 'improve') => {
    if (!activeSnippet || !viewRef.current) return;
    const currentCode = viewRef.current.state.doc.toString();
    setIsAiProcessing(true);
    setShowAiPanel(true);
    setShowAiMenu(false);
    
    try {
      const result = await GeminiService.explainCode(currentCode, activeSnippet.language);
      setAiOutput(result);
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
      <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#333] flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Explorer</span>
          <button 
            onClick={() => setIsCreating(true)} 
            className="p-1 hover:bg-[#37373d] rounded transition-colors text-gray-400"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-0.5">
          {snippets.map(s => (
            <button 
              key={s.id} 
              onClick={() => setActiveSnippetId(s.id)} 
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${activeSnippetId === s.id ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'}`}
            >
              <FileCode size={14} className={activeSnippetId === s.id ? "text-blue-400" : "text-gray-500"} /> 
              <span className="truncate flex-1 text-left">{s.title}</span>
              {activeSnippetId === s.id && hasUnsavedChanges && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {activeSnippet ? (
          <>
            <div className="h-10 bg-[#2d2d2d] border-b border-[#333] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-4">
                <span className="text-gray-300 text-xs font-mono">{activeSnippet.title}</span>
                
                <div className="relative group">
                   <button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#3c3c3c] text-xs text-gray-400 transition-colors">
                     <span className="capitalize">{activeSnippet.language}</span>
                     <ChevronDown size={12} />
                   </button>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowAiMenu(!showAiMenu)}
                    className="flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all"
                  >
                    <Sparkles size={12} /> AI Studio
                    <ChevronDown size={10} />
                  </button>
                  
                  {showAiMenu && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-[#252526] border border-[#454545] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-1">
                        <button 
                          onClick={() => runAiAction('explain')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#094771] hover:text-white flex items-center gap-2 rounded"
                        >
                          <MessageSquareText size={14} className="text-blue-400" />
                          Explain This Code
                        </button>
                        <button 
                          onClick={() => runAiAction('improve')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#094771] hover:text-white flex items-center gap-2 rounded"
                        >
                          <Zap size={14} className="text-amber-400" />
                          Fix & Improve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleSave} 
                  className={`px-4 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${hasUnsavedChanges ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#3e3e42] text-gray-400'}`}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div 
                ref={editorRef} 
                className="flex-1 h-full overflow-hidden" 
              />
              
              {showAiPanel && (
                <div className="w-[450px] bg-[#1e1e1e] text-[#d4d4d4] flex flex-col border-l border-[#333] animate-in slide-in-from-right duration-300 shadow-2xl z-20">
                   <div className="h-10 bg-[#252526] border-b border-[#333] flex justify-between items-center px-4 shrink-0">
                     <div className="flex items-center gap-2">
                       <Sparkles size={14} className="text-purple-400" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Intelligence Output</span>
                     </div>
                     <button onClick={() => setShowAiPanel(false)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                   </div>
                   <div className="flex-1 p-6 overflow-auto font-sans leading-relaxed text-sm">
                      {isAiProcessing ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                          <div className="relative">
                            <Sparkles className="animate-pulse text-purple-400" size={32} />
                            <div className="absolute inset-0 animate-ping border border-purple-500/30 rounded-full scale-150 opacity-20" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Analyzing logic...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-4 bg-[#2d2d2d] rounded-xl border border-[#333]">
                            <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {aiOutput || "Request completed. No specific suggestions found."}
                            </div>
                          </div>
                          <div className="p-4 bg-purple-600/10 rounded-xl border border-purple-500/20">
                             <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <Zap size={12} /> Optimization Tip
                             </h4>
                             <p className="text-xs text-purple-200/70 italic">
                               Use AI results as a guide for architectural improvements rather than direct replacement.
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
            <div className="w-20 h-20 rounded-3xl bg-[#252526] flex items-center justify-center mb-6 shadow-xl border border-[#333]">
              <Code size={40} className="text-[#333]" />
            </div>
            <h2 className="text-xl font-bold text-gray-400 mb-2">Workspace Empty</h2>
            <button 
              onClick={() => setIsCreating(true)}
              className="mt-8 px-6 py-2 bg-[#007acc] text-white text-xs font-bold rounded hover:bg-[#0062a3] transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={14} /> New Script
            </button>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-[#252526] rounded-xl shadow-2xl w-full max-w-sm border border-[#454545] overflow-hidden">
             <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#2d2d2d]">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Resource</span>
               <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
             </div>
             <div className="p-6">
                <input 
                  autoFocus
                  className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#454545] rounded focus:border-[#007acc] outline-none text-sm text-gray-200 font-mono"
                  placeholder="filename.js"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setIsCreating(false)} className="flex-1 py-2 text-xs text-gray-400">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 py-2 bg-[#007acc] text-white text-xs font-bold rounded">Create</button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CodeStudio;
