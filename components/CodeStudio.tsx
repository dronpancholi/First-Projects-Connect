
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

// CodeMirror imports using direct importmap keys
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
    Object.entries(folderTree).forEach(([folder, items]) => {
      /* Fixed: Explicitly cast items to CodeSnippet[] to resolve 'Property filter does not exist on type unknown' */
      const matched = (items as CodeSnippet[]).filter(s => s.title.toLowerCase().includes(q));
      if (matched.length > 0) result[folder] = matched;
    });
    return result;
  }, [folderTree, searchQuery]);

  useEffect(() => {
    if (activeSnippetId && !openSnippetIds.includes(activeSnippetId)) {
      setOpenSnippetIds(prev => [...prev, activeSnippetId]);
    }
  }, [activeSnippetId, openSnippetIds]);

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newOpenIds = openSnippetIds.filter(tid => tid !== id);
    setOpenSnippetIds(newOpenIds);
    if (activeSnippetId === id) {
      setActiveSnippetId(newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : null);
    }
  };

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
        // Fix: Use 'top' instead of 'topPanel' as per CodeMirror @codemirror/search SearchConfig
        search({ top: true }),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) setHasUnsavedChanges(true);
        })
      ],
    });

    const view = new EditorView({ state: startState, parent: editorRef.current });
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
    const mappedLang = (lang === 'js' ? 'javascript' : lang === 'py' ? 'python' : lang);
    await addSnippet({ 
      title: newFileName, 
      language: mappedLang as any, 
      code: '// Initializing ecosystem script...',
      folder: newFolderName.trim() || undefined
    });
    setNewFileName('');
    setNewFolderName('');
    setIsCreating(false);
  };

  const runAiAction = async () => {
    if (!activeSnippet || !viewRef.current) return;
    const currentCode = viewRef.current.state.doc.toString();
    setIsAiProcessing(true);
    setShowAiPanel(true);
    setShowAiMenu(false);
    try {
      const result = await GeminiService.explainCode(currentCode, activeSnippet.language);
      setAiOutput(result || "Unable to parse logic.");
    } catch (error) {
      setAiOutput("AI processing failed.");
    } finally { setIsAiProcessing(false); }
  };

  return (
    <div className="flex h-full bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none">
      <div className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-4 border-r border-black/20 shrink-0">
        <button className="p-2 text-white bg-[#ffffff11] rounded-lg"><Files size={20} /></button>
        <button className="p-2 text-gray-500 hover:text-gray-300"><Search size={20} /></button>
        <button className="p-2 text-gray-500 hover:text-gray-300 mt-auto"><SettingsIcon size={20} /></button>
      </div>

      <div style={{ width: sidebarWidth }} className="bg-[#252526] border-r border-black/20 flex flex-col shrink-0 overflow-hidden">
        <div className="h-9 px-4 flex items-center justify-between bg-[#252526] text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-black/10">
          <span>Explorer</span>
          <button onClick={() => setIsCreating(true)} className="p-1 hover:bg-[#ffffff11] rounded" title="New File"><Plus size={14} /></button>
        </div>
        
        <div className="p-2">
          <input 
            className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-1.5 text-xs text-gray-300 outline-none"
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto py-1 custom-scrollbar">
          {Object.entries(filteredFolders).sort(([a], [b]) => (a === 'root' ? 1 : b === 'root' ? -1 : a.localeCompare(b))).map(([folder, items]) => (
            <div key={folder}>
              {folder !== 'root' && (
                <div onClick={() => toggleFolder(folder)} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gray-400 hover:bg-[#2a2d2e] cursor-pointer">
                  {expandedFolders.has(folder) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Folder size={14} className="text-blue-400" />
                  <span className="truncate flex-1">{folder}</span>
                </div>
              )}
              {(folder === 'root' || expandedFolders.has(folder)) && (items as CodeSnippet[]).map(s => (
                <div
                  key={s.id}
                  onClick={() => setActiveSnippetId(s.id)}
                  className={`flex items-center gap-2 px-4 py-1 text-xs cursor-pointer ${activeSnippetId === s.id ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                >
                  <FileCode size={14} className={getLanguageColor(s.language)} /> 
                  <span className="truncate flex-1">{s.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        <div className="h-9 bg-[#252526] flex items-center overflow-x-auto no-scrollbar border-b border-black/20">
          {openSnippetIds.map(tid => {
            const snip = snippets.find(s => s.id === tid);
            if (!snip) return null;
            return (
              <div key={tid} onClick={() => setActiveSnippetId(tid)} className={`flex items-center gap-2 px-3 h-full border-r border-black/20 cursor-pointer min-w-[120px] ${activeSnippetId === tid ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-500'}`}>
                <FileCode size={14} className={getLanguageColor(snip.language)} />
                <span className="text-xs font-medium truncate flex-1">{snip.title}</span>
                <X size={12} onClick={(e) => closeTab(e, tid)} className="hover:text-white" />
              </div>
            );
          })}
        </div>

        {activeSnippet ? (
          <>
            <div className="h-8 bg-[#1e1e1e] flex items-center justify-between px-4 border-b border-black/10">
              <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                <span className="uppercase">{activeSnippet.language}</span>
                <span className="flex items-center gap-1"><Command size={10} /> S to Save</span>
              </div>
              <div className="flex gap-2">
                <button onClick={runAiAction} className="p-1 hover:bg-[#ffffff11] rounded text-purple-400"><Sparkles size={16} /></button>
                <button onClick={handleSave} className={`p-1 rounded ${hasUnsavedChanges ? 'text-blue-400' : 'text-gray-600'}`}><Save size={16} /></button>
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div ref={editorRef} className="flex-1 h-full overflow-hidden" />
              {showAiPanel && (
                <div className="w-96 bg-[#252526] border-l border-black/20 flex flex-col p-5">
                   <div className="flex justify-between mb-4"><span className="text-xs font-bold uppercase">AI Analysis</span><X size={14} onClick={() => setShowAiPanel(false)} className="cursor-pointer" /></div>
                   <div className="text-xs text-gray-300 leading-relaxed overflow-auto custom-scrollbar">{aiOutput}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Code size={40} className="mb-4 opacity-20" />
            <p className="text-xs uppercase tracking-widest font-bold">Select a script to edit</p>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-[#252526] rounded-2xl p-6 w-full max-w-sm border border-[#454545]">
              <h3 className="text-xs font-bold uppercase mb-4">New script</h3>
              <input autoFocus className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#454545] rounded-xl outline-none text-sm mb-4" placeholder="filename.js" value={newFileName} onChange={e => setNewFileName(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => setIsCreating(false)} className="flex-1 py-2 text-xs text-gray-400">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2 bg-[#007acc] text-white text-xs font-bold rounded-xl">Create</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CodeStudio;
