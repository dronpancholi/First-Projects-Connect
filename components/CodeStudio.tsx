
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { 
  Plus, Code, FileCode, Save, X, Sparkles, ChevronDown, ChevronRight,
  Info, Zap, MessageSquareText, Search, Trash2, Edit3, Loader2, Files, 
  Settings as SettingsIcon, Layout, Monitor, Globe, Command, ListTree, 
  PanelRightClose, PanelRightOpen, Folder, FolderOpen
} from 'lucide-react';
import { CodeSnippet } from '../types.ts';
import * as GeminiService from '../services/geminiService.ts';

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { search } from '@codemirror/search';
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
    case 'typescript': return javascript();
    case 'python': return python();
    case 'html': return html();
    case 'css': return css();
    case 'sql': return sql();
    case 'json': return json();
    case 'markdown': return markdown();
    case 'rust': return rust();
    default: return javascript();
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
  const [openSnippetIds, setOpenSnippetIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const activeSnippet = snippets.find(s => s.id === activeSnippetId);

  // Group snippets by folder
  const folderTree = useMemo(() => {
    const tree: Record<string, CodeSnippet[]> = { 'root': [] };
    snippets.forEach(s => {
      const folder = s.folder || 'root';
      if (!tree[folder]) tree[folder] = [];
      tree[folder].push(s);
    });
    return tree;
  }, [snippets]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folderTree;
    const q = searchQuery.toLowerCase();
    const result: Record<string, CodeSnippet[]> = {};
    // Cast Object.entries to fix TS error: Property 'filter' does not exist on type 'unknown'
    (Object.entries(folderTree) as [string, CodeSnippet[]][]).forEach(([folder, items]) => {
      const matched = items.filter(s => s.title.toLowerCase().includes(q));
      if (matched.length > 0) result[folder] = matched;
    });
    return result;
  }, [folderTree, searchQuery]);

  // Sync open tabs when a snippet is selected
  useEffect(() => {
    if (activeSnippetId && !openSnippetIds.includes(activeSnippetId)) {
      setOpenSnippetIds(prev => [...prev, activeSnippetId]);
    }
  }, [activeSnippetId]);

  // Handle Tab Closing
  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newOpenIds = openSnippetIds.filter(tid => tid !== id);
    setOpenSnippetIds(newOpenIds);
    if (activeSnippetId === id) {
      setActiveSnippetId(newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : null);
    }
  };

  // Editor Lifecycle
  useEffect(() => {
    if (!editorRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    if (!activeSnippet) return;

    const startState = EditorState.create({
      doc: activeSnippet.code || '',
      extensions: [
        basicSetup,
        oneDark,
        languageConf.of(getLanguageExtension(activeSnippet.language)),
        keymap.of([...defaultKeymap, indentWithTab]),
        search({ topPanel: true }),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) setHasUnsavedChanges(true);
        }),
        EditorView.theme({
          "&": { height: "100%", fontSize: "14px" },
          ".cm-scroller": { fontFamily: "'JetBrains Mono', monospace" },
          "&.cm-focused": { outline: "none" },
          ".cm-gutters": { backgroundColor: "#1e1e1e", color: "#858585", border: "none" },
          ".cm-activeLineGutter": { backgroundColor: "#2c2c2c", color: "#c6c6c6" },
          ".cm-activeLine": { backgroundColor: "#2c2c2c55" }
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

  const handleSave = async () => {
    if (!activeSnippet || !viewRef.current) return;
    const currentCode = viewRef.current.state.doc.toString();
    await updateSnippet(activeSnippet.id, currentCode);
    setHasUnsavedChanges(false);
  };

  const handleCreate = async () => {
    if (!newFileName.trim()) return;
    const lang = newFileName.includes('.') ? newFileName.split('.').pop() : 'javascript';
    const mappedLang = (lang === 'js' ? 'javascript' : lang === 'py' ? 'python' : lang) as any;
    
    await addSnippet({ 
      title: newFileName, 
      language: mappedLang, 
      code: '// Start coding here...',
      folder: newFolderName.trim() || undefined
    });
    
    setNewFileName('');
    setNewFolderName('');
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
      setAiOutput(result || "AI was unable to provide insights for this block.");
    } catch (error) {
      setAiOutput("Failed to process AI request. Check your API configuration.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex h-full bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none">
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-4 border-r border-black/20 shrink-0">
        <button className="p-2 text-white bg-[#ffffff11] rounded-lg"><Files size={20} /></button>
        <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors"><Search size={20} /></button>
        <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors"><Monitor size={20} /></button>
        <button className="p-2 text-gray-500 hover:text-gray-300 mt-auto transition-colors"><SettingsIcon size={20} /></button>
      </div>

      {/* Explorer Sidebar */}
      <div 
        style={{ width: sidebarWidth }}
        className="bg-[#252526] border-r border-black/20 flex flex-col shrink-0 overflow-hidden"
      >
        <div className="h-9 px-4 flex items-center justify-between bg-[#252526] text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-black/10">
          <span>Explorer</span>
          <div className="flex gap-1">
            <button onClick={() => setIsCreating(true)} className="p-1 hover:bg-[#ffffff11] rounded transition-colors" title="New File"><Plus size={14} /></button>
            <button className="p-1 hover:bg-[#ffffff11] rounded transition-colors" title="Refresh"><Globe size={14} /></button>
          </div>
        </div>
        
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
            <input 
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-8 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#007acc] transition-colors"
              placeholder="Search scripts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto py-1 custom-scrollbar">
          {/* Cast Object.entries to fix TS error: Property 'length' and 'map' do not exist on type 'unknown' */}
          {(Object.entries(filteredFolders) as [string, CodeSnippet[]][]).sort((a, b) => {
            if (a[0] === 'root') return 1;
            if (b[0] === 'root') return -1;
            return a[0].localeCompare(b[0]);
          }).map(([folder, items]) => (
            <div key={folder}>
              {folder !== 'root' && (
                <div 
                  onClick={() => toggleFolder(folder)}
                  className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gray-400 hover:bg-[#2a2d2e] cursor-pointer group"
                >
                  {expandedFolders.has(folder) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {expandedFolders.has(folder) ? <FolderOpen size={14} className="text-blue-400" /> : <Folder size={14} className="text-blue-400" />}
                  <span className="truncate flex-1">{folder}</span>
                  <span className="text-[10px] text-gray-600 group-hover:text-gray-400">{items.length}</span>
                </div>
              )}
              
              {(folder === 'root' || expandedFolders.has(folder)) && items.map(s => (
                <div
                  key={s.id}
                  onClick={() => setActiveSnippetId(s.id)}
                  className={`group flex items-center gap-2 px-4 py-1 text-xs cursor-pointer transition-all border-l-2 ${
                    activeSnippetId === s.id 
                      ? 'bg-[#37373d] text-white border-blue-500' 
                      : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200 border-transparent'
                  } ${folder !== 'root' ? 'pl-8' : ''}`}
                >
                  <FileCode size={14} className={getLanguageColor(s.language)} /> 
                  <span className="truncate flex-1 font-medium">{s.title}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Delete script?')) deleteSnippet(s.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-900/30 rounded text-gray-500 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ))}
          
          {snippets.length === 0 && !isCreating && (
            <div className="px-4 py-8 text-center">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-4">No scripts yet</p>
              <button onClick={() => setIsCreating(true)} className="text-[11px] text-blue-400 hover:underline">Create your first file</button>
            </div>
          )}
        </div>
      </div>

      {/* Main IDE Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {/* Tab Bar */}
        <div className="h-9 bg-[#252526] flex items-center overflow-x-auto no-scrollbar border-b border-black/20">
          {openSnippetIds.map(tid => {
            const snip = snippets.find(s => s.id === tid);
            if (!snip) return null;
            return (
              <div
                key={tid}
                onClick={() => setActiveSnippetId(tid)}
                className={`flex items-center gap-2 px-3 h-full border-r border-black/20 cursor-pointer min-w-[120px] max-w-[200px] transition-colors group relative ${
                  activeSnippetId === tid ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'bg-[#2d2d2d] text-gray-500 hover:bg-[#2b2b2b]'
                }`}
              >
                <FileCode size={14} className={getLanguageColor(snip.language)} />
                <span className="text-xs font-medium truncate flex-1">{snip.title}</span>
                {tid === activeSnippetId && hasUnsavedChanges ? (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                ) : (
                  <button 
                    onClick={(e) => closeTab(e, tid)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[#ffffff11] rounded text-gray-400 transition-all"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {activeSnippet ? (
          <>
            {/* Editor Toolbar */}
            <div className="h-8 bg-[#1e1e1e] flex items-center justify-between px-4 border-b border-black/10">
              <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                <span className="uppercase tracking-widest">{activeSnippet.language}</span>
                {activeSnippet.folder && <span className="text-gray-600 font-bold px-1.5 bg-white/5 rounded">FOLDER: {activeSnippet.folder}</span>}
                <span className="flex items-center gap-1"><Command size={10} /> S to Save</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAiMenu(!showAiMenu)}
                  className="p-1 hover:bg-[#ffffff11] rounded text-purple-400 transition-colors"
                  title="AI Assist"
                >
                  <Sparkles size={16} />
                </button>
                <button 
                  onClick={handleSave}
                  className={`p-1 rounded transition-colors ${hasUnsavedChanges ? 'text-blue-400 hover:bg-[#ffffff11]' : 'text-gray-600'}`}
                  title="Save"
                >
                  <Save size={16} />
                </button>
                <button 
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className={`p-1 rounded transition-colors ${showAiPanel ? 'text-blue-400 bg-[#ffffff11]' : 'text-gray-500 hover:bg-[#ffffff11]'}`}
                  title="Toggle Assistant"
                >
                  {showAiPanel ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                </button>
              </div>
            </div>

            {/* Editor + AI Side-by-Side */}
            <div className="flex-1 flex overflow-hidden">
              <div ref={editorRef} className="flex-1 h-full overflow-hidden bg-[#1e1e1e]" />
              
              {showAiPanel && (
                <div className="w-96 bg-[#252526] border-l border-black/20 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                  <div className="h-9 px-4 flex items-center justify-between bg-[#2d2d2d] border-b border-black/20 shrink-0">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Assistant Insights</span>
                    <button onClick={() => setShowAiPanel(false)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                  </div>
                  <div className="flex-1 overflow-auto p-5 custom-scrollbar">
                    {isAiProcessing ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                        <Loader2 className="animate-spin text-purple-400" size={32} />
                        <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">Analyzing Logic...</span>
                      </div>
                    ) : (
                      <div className="space-y-6 prose prose-invert prose-sm">
                        <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5 shadow-inner">
                           <div className="flex items-center gap-2 mb-3 text-blue-400">
                             <Info size={16} />
                             <span className="font-bold text-[11px] uppercase tracking-wider">Analysis</span>
                           </div>
                           <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                             {aiOutput || "Select 'Explain' or 'Improve' from AI Assist to generate insights."}
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => runAiAction('explain')} className="flex-1 py-2 bg-[#ffffff0a] hover:bg-[#ffffff11] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"><MessageSquareText size={14}/> Explain</button>
                           <button onClick={() => runAiAction('improve')} className="flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"><Zap size={14}/> Optimize</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 cursor-pointer h-full"><Monitor size={10} /> Main</div>
                <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 cursor-pointer h-full"><Globe size={10} /> UTF-8</div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="px-2 hover:bg-white/10 cursor-pointer h-full flex items-center uppercase font-bold">{activeSnippet.language}</div>
                 <div className="px-2 hover:bg-white/10 cursor-pointer h-full flex items-center"><Zap size={10} className="fill-white" /> AI Ready</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-20 h-20 rounded-3xl bg-[#252526] border border-black/10 flex items-center justify-center mb-6 shadow-2xl">
              <Code size={40} className="text-gray-700" />
            </div>
            <h2 className="text-lg font-bold text-gray-400 tracking-tight">Ecosystem Code Studio</h2>
            <p className="text-xs text-gray-600 mb-8">Select a script or create a new one to begin.</p>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
               <button onClick={() => setIsCreating(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#007acc] text-white text-[11px] font-bold rounded-lg hover:bg-[#0062a3] shadow-lg uppercase tracking-wider transition-all">
                 <Plus size={14}/> New File
               </button>
               <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2d2d2d] text-gray-400 text-[11px] font-bold rounded-lg hover:bg-[#333] border border-black/10 uppercase tracking-wider transition-all">
                 <Command size={14}/> Search
               </button>
            </div>
          </div>
        )}
      </div>

      {/* New File Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-[#252526] rounded-2xl shadow-2xl w-full max-w-sm border border-[#454545] overflow-hidden">
             <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#2d2d2d]">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Create New Script</span>
               <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white p-1 transition-colors"><X size={16} /></button>
             </div>
             <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">File Name</label>
                  <input 
                    autoFocus
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#454545] rounded-xl focus:border-[#007acc] outline-none text-sm text-gray-200 font-mono transition-all"
                    placeholder="e.g. index.js"
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Folder (Optional)</label>
                  <input 
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#454545] rounded-xl focus:border-[#007acc] outline-none text-sm text-gray-200 font-mono transition-all"
                    placeholder="e.g. utils"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsCreating(false)} className="flex-1 py-2.5 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button 
                    onClick={handleCreate} 
                    disabled={!newFileName.trim()}
                    className="flex-1 py-2.5 bg-[#007acc] text-white text-xs font-bold rounded-xl hover:bg-[#0062a3] transition-colors disabled:opacity-50 shadow-md uppercase tracking-wider"
                  >
                    Create
                  </button>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* AI Action Menu Overlay */}
      {showAiMenu && (
        <div className="fixed inset-0 z-[60]" onClick={() => setShowAiMenu(false)}>
           <div 
             className="absolute top-[8.5rem] right-12 w-56 bg-[#252526] border border-[#454545] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
             onClick={e => e.stopPropagation()}
           >
             <div className="p-1.5 flex flex-col">
               <button onClick={() => runAiAction('explain')} className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-gray-300 hover:bg-[#094771] hover:text-white rounded-lg transition-colors uppercase tracking-wider">
                 <MessageSquareText size={14} className="text-blue-400" /> Explain Code
               </button>
               <button onClick={() => runAiAction('improve')} className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-gray-300 hover:bg-[#094771] hover:text-white rounded-lg transition-colors uppercase tracking-wider">
                 <Zap size={14} className="text-amber-400" /> Optimize Logic
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CodeStudio;
