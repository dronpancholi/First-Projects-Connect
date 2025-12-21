
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { 
  Plus, MousePointer2, Type, Square, Circle as CircleIcon, 
  StickyNote, X, Wand2, Trash2, Image as ImageIcon, 
  Palette, Sparkles, Send, Layers, Copy, Trash, PenTool, 
  LayoutGrid, Loader2, Maximize, ZoomIn, ZoomOut, Move,
  Hand, BoxSelect, Network, ArrowRightCircle, Info, Link as LinkIcon
} from 'lucide-react';
import { CanvasElement } from '../types.ts';
import * as GeminiService from '../services/geminiService.ts';

const COLORS = [
  '#FFFFFF', '#F8FAFC', '#EFF6FF', '#ECFDF5', '#FFFBEB', 
  '#FEF2F2', '#F5F3FF', '#FDF2F8', '#FFF7ED', '#0F172A'
];

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const Whiteboard: React.FC = () => {
  const { whiteboards, addWhiteboard, updateWhiteboard, deleteWhiteboard } = useStore();
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High-Performance Spatial State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [tool, setTool] = useState<'select' | 'pan' | 'note' | 'text' | 'rect' | 'circle' | 'image'>('select');
  
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);
  const [linkingToPos, setLinkingToPos] = useState<{ x: number, y: number } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [aiPromptValue, setAiPromptValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<string>('');
  const [isAiMindMapPromptOpen, setIsAiMindMapPromptOpen] = useState(false);

  // Sync with active board
  useEffect(() => {
    if (whiteboards.length > 0 && !activeBoardId) {
      setActiveBoardId(whiteboards[0].id);
    }
  }, [whiteboards, activeBoardId]);

  useEffect(() => {
    const board = whiteboards.find(w => w.id === activeBoardId);
    if (board) {
      const boardElements = Array.isArray(board.elements) 
        ? board.elements 
        : JSON.parse((board.elements as any) || '[]');
      setElements(boardElements);
    } else {
      setElements([]);
    }
    setSelectedId(null);
  }, [activeBoardId, whiteboards]);

  const saveElements = useCallback((newElements: CanvasElement[]) => {
    if (activeBoardId) {
      updateWhiteboard(activeBoardId, newElements);
    }
  }, [activeBoardId, updateWhiteboard]);

  const screenToCanvas = useCallback((sx: number, sy: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (sx - rect.left - transform.x) / transform.scale,
      y: (sy - rect.top - transform.y) / transform.scale
    };
  }, [transform]);

  const handleZoom = (delta: number, centerX: number, centerY: number) => {
    setTransform(prev => {
      const scaleDelta = delta > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(prev.scale * scaleDelta, 0.1), 5);
      const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const mx = (centerX - rect.left - prev.x) / prev.scale;
      const my = (centerY - rect.top - prev.y) / prev.scale;
      return { x: centerX - rect.left - mx * newScale, y: centerY - rect.top - my * newScale, scale: newScale };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoom(e.deltaY, e.clientX, e.clientY);
    } else {
      setTransform(prev => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const addElement = async (e: React.MouseEvent) => {
    if (e.target !== containerRef.current || tool === 'select' || tool === 'pan') return;
    if (!activeBoardId) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const newEl: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: tool as any,
      x: x - 100, y: y - 50, width: 200, height: 100,
      color: tool === 'note' ? '#FEF3C7' : tool === 'text' ? 'transparent' : '#FFFFFF',
      content: ''
    };
    const next = [...elements, newEl];
    setElements(next);
    setSelectedId(newEl.id);
    setTool('select');
    saveElements(next);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (tool === 'pan') return;
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(it => it.id === id);
    if (el) { 
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      setDraggingId(id); 
      setDragOffset({ x: x - el.x, y: y - el.y }); 
    }
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, handle: ResizeHandle) => {
    e.stopPropagation();
    setResizingId(id);
    setResizeHandle(handle);
  };

  const handleLinkStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLinkingFromId(id);
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    setLinkingToPos({ x, y });
  };

  const deleteElement = (id: string) => {
    const next = elements.filter(el => el.id !== id).map(el => el.parentId === id ? { ...el, parentId: undefined } : el);
    setElements(next);
    setSelectedId(null);
    saveElements(next);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning || tool === 'pan') {
      if (e.buttons === 1) {
        setTransform(prev => ({ ...prev, x: prev.x + e.movementX, y: prev.y + e.movementY }));
      }
      return;
    }
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    if (linkingFromId) {
      setLinkingToPos({ x, y });
    } else if (draggingId) {
      const nextEls = elements.map(el => el.id === draggingId ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y } : el);
      setElements(nextEls);
    } else if (resizingId && resizeHandle) {
      setElements(prev => prev.map(el => {
        if (el.id !== resizingId) return el;
        let { x: ex, y: ey, width = 200, height = 100 } = el;
        const minSize = 40;
        switch (resizeHandle) {
          case 'bottom-right': width = Math.max(minSize, x - ex); height = Math.max(minSize, y - ey); break;
          case 'top-left': const dw = (ex + width) - x; const dh = (ey + height) - y; if (dw > minSize) { ex = x; width = dw; } if (dh > minSize) { ey = y; height = dh; } break;
          case 'top-right': width = Math.max(minSize, x - ex); const dhTR = (ey + height) - y; if (dhTR > minSize) { ey = y; height = dhTR; } break;
          case 'bottom-left': const dwBL = (ex + width) - x; if (dwBL > minSize) { ex = x; width = dwBL; } height = Math.max(minSize, y - ey); break;
        }
        return { ...el, x: ex, y: ey, width, height };
      }));
    }
  }, [draggingId, resizingId, resizeHandle, linkingFromId, dragOffset, elements, screenToCanvas, tool, isPanning]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (linkingFromId) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const target = elements.find(el => 
        el.id !== linkingFromId && 
        x >= el.x && x <= el.x + (el.width || 200) &&
        y >= el.y && y <= el.y + (el.height || 100)
      );
      if (target) {
        const next = elements.map(el => el.id === target.id ? { ...el, parentId: linkingFromId } : el);
        setElements(next);
        saveElements(next);
      }
      setLinkingFromId(null);
      setLinkingToPos(null);
    } else if (draggingId || resizingId) {
      saveElements(elements);
    }
    setDraggingId(null);
    setResizingId(null);
    setResizeHandle(null);
    setIsPanning(false);
  }, [linkingFromId, draggingId, resizingId, elements, screenToCanvas, saveElements]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseup', handleMouseUp); 
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleAiArchitect = async () => {
    if (!aiPromptValue.trim() || !activeBoardId) return;
    setIsGenerating(true);
    setGenStatus('Synthesis initiated...');
    setIsAiMindMapPromptOpen(false);
    try {
      const response = await GeminiService.generateWhiteboardLayout(aiPromptValue);
      setGenStatus(`Mapping ${response.diagramType}...`);
      const next = [...elements, ...response.elements];
      setElements(next);
      saveElements(next);
      if (response.elements.length > 0) {
        const first = response.elements[0];
        setTransform({ x: -first.x + 400, y: -first.y + 300, scale: 0.8 });
      }
    } catch (err) { console.error(err); } finally {
      setIsGenerating(false);
      setGenStatus('');
      setAiPromptValue('');
    }
  };

  const renderConnections = useMemo(() => {
    return (
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
          </marker>
        </defs>
        <g opacity="0.3">
          {elements.map(el => {
            if (!el.parentId) return null;
            const parent = elements.find(p => p.id === el.parentId);
            if (!parent) return null;
            const sX = parent.x + (parent.width || 200) / 2;
            const sY = parent.y + (parent.height || 100) / 2;
            const eX = el.x + (el.width || 200) / 2;
            const eY = el.y + (el.height || 100) / 2;
            const dx = eX - sX;
            return (
              <path key={`${el.id}-connection`} d={`M ${sX} ${sY} C ${sX + dx/2} ${sY}, ${sX + dx/2} ${eY}, ${eX} ${eY}`} fill="none" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arrow)" />
            );
          })}
        </g>
        {linkingFromId && linkingToPos && (
          <g>
            {(() => {
              const fromEl = elements.find(it => it.id === linkingFromId);
              if (!fromEl) return null;
              const sX = fromEl.x + (fromEl.width || 200) / 2;
              const sY = fromEl.y + (fromEl.height || 100) / 2;
              const eX = linkingToPos.x;
              const eY = linkingToPos.y;
              const dx = eX - sX;
              return <path d={`M ${sX} ${sY} C ${sX + dx/2} ${sY}, ${sX + dx/2} ${eY}, ${eX} ${eY}`} fill="none" stroke="#4f46e5" strokeWidth="3" strokeDasharray="5,5" markerEnd="url(#arrow)" />;
            })()}
          </g>
        )}
      </svg>
    );
  }, [elements, linkingFromId, linkingToPos]);

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] relative overflow-hidden select-none font-sans">
      <style>{`
        .spatial-grid { background-image: radial-gradient(#e2e8f0 1.5px, transparent 1.5px); background-size: 40px 40px; }
        .pro-node { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: grab; }
        .pro-node:active { cursor: grabbing; }
        .diamond-shape { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
        .triangle-shape { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
        .node-selected { ring: 4px; ring-color: #4f46e5; }
      `}</style>

      {/* Floating Tactical HUD */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4 pointer-events-none">
        <div className="pointer-events-auto glass-hud border border-slate-200/50 shadow-2xl rounded-[2.5rem] p-2 flex items-center gap-1">
          <div className="flex items-center gap-3 px-6 border-r border-slate-200 mr-2">
             <Network size={16} className="text-indigo-600" />
             <select className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-700 focus:ring-0 cursor-pointer min-w-[160px]" value={activeBoardId || ''} onChange={(e) => setActiveBoardId(e.target.value)}>
               {whiteboards.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
             </select>
          </div>

          {[
            { id: 'select', icon: <MousePointer2 size={18} /> },
            { id: 'pan', icon: <Hand size={18} /> },
            { id: 'note', icon: <StickyNote size={18} /> },
            { id: 'text', icon: <Type size={18} /> },
            { id: 'rect', icon: <Square size={18} /> },
            { id: 'circle', icon: <CircleIcon size={18} /> },
          ].map(t => (
            <button key={t.id} onClick={() => { setTool(t.id as any); setSelectedId(null); }} className={`p-3.5 rounded-2xl transition-all btn-tactile ${tool === t.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}>
              {t.icon}
            </button>
          ))}

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <button onClick={() => setIsAiMindMapPromptOpen(true)} className="p-3.5 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all group flex items-center gap-3 px-6 shadow-xl btn-tactile">
            <Sparkles size={18} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Architect</span>
          </button>
        </div>
      </div>

      {/* View Controls */}
      <div className="absolute bottom-10 right-10 z-[100] flex flex-col gap-4">
        <div className="glass-hud border border-slate-200 p-2 rounded-3xl shadow-2xl flex flex-col">
          <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(p.scale + 0.1, 5) }))} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors btn-tactile"><ZoomIn size={20}/></button>
          <div className="text-[10px] font-black text-slate-400 text-center py-2">{Math.round(transform.scale * 100)}%</div>
          <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(p.scale - 0.1, 0.1) }))} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors btn-tactile"><ZoomOut size={20}/></button>
        </div>
        <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="glass-hud border border-slate-200 p-4 rounded-[1.5rem] shadow-2xl text-slate-400 hover:text-indigo-600 transition-colors btn-tactile"><Maximize size={20}/></button>
      </div>

      <div className="absolute top-8 left-8 z-[100] flex gap-3">
         <button onClick={() => { if(activeBoardId && confirm('Purge workspace?')) deleteWhiteboard(activeBoardId) }} className="glass-hud border border-slate-200 p-4 rounded-2xl shadow-xl text-slate-300 hover:text-rose-500 transition-all btn-tactile"><Trash size={20}/></button>
         <button onClick={() => addWhiteboard({ title: 'New Visualizer', elements: [] })} className="glass-hud border border-slate-200 p-4 rounded-2xl shadow-xl text-slate-300 hover:text-indigo-600 transition-all btn-tactile"><Plus size={20}/></button>
      </div>

      {/* Node Context Bar */}
      {selectedId && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-6 duration-300 pointer-events-none">
          <div className="pointer-events-auto bg-slate-900 text-white px-10 py-5 rounded-[3rem] shadow-2xl flex items-center gap-10 border border-white/10 ring-1 ring-slate-800">
             <div className="flex gap-3">
               {COLORS.map(c => (
                 <button key={c} onClick={() => { const n = elements.map(it => it.id === selectedId ? {...it, color: c} : it); setElements(n); saveElements(n); }} className={`w-8 h-8 rounded-full border border-white/10 transition-all hover:scale-125 ${elements.find(e => e.id === selectedId)?.color === c ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-900 scale-110' : ''}`} style={{ backgroundColor: c }} />
               ))}
             </div>
             <div className="w-px h-8 bg-slate-800" />
             <div className="flex items-center gap-6">
                <button onClick={() => { const n = elements.map(it => it.id === selectedId ? {...it, parentId: undefined} : it); setElements(n); saveElements(n); }} className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-2 btn-tactile">
                  <LinkIcon size={14} className="rotate-45" /> Unlink Node
                </button>
                <button onClick={() => deleteElement(selectedId)} className="flex items-center gap-2 text-rose-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-300 btn-tactile">
                  <Trash2 size={18} /> Remove
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Infinite Drawing Engine */}
      <div ref={containerRef} onWheel={onWheel} onMouseDown={(e) => { if (tool === 'pan' || (e.button === 0 && e.target === containerRef.current)) setIsPanning(true); addElement(e); }} className={`flex-1 overflow-hidden relative spatial-grid bg-slate-50 transition-all cursor-${tool === 'pan' || isPanning ? 'grabbing' : tool === 'select' ? 'default' : 'crosshair'}`}>
        <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', transition: isPanning ? 'none' : 'transform 0.1s ease-out' }} className="absolute inset-0 pointer-events-none">
          {renderConnections}
          {elements.map(el => (
            <div key={el.id} onMouseDown={(e) => handleMouseDown(e, el.id)} className={`absolute group pro-node pointer-events-auto overflow-visible shadow-lg bg-white ${el.type === 'circle' ? 'rounded-full' : 'rounded-3xl'} ${selectedId === el.id ? 'ring-4 ring-indigo-500 shadow-[0_20px_50px_rgba(79,70,229,0.2)] z-50' : 'border border-slate-200'} ${el.type === 'diamond' ? 'diamond-shape' : ''} ${el.type === 'triangle' ? 'triangle-shape' : ''}`} style={{ left: el.x, top: el.y, width: el.width || 200, height: el.height || 100, backgroundColor: el.color || '#FFFFFF' }}>
              {selectedId === el.id && (
                <>
                  <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-left')} className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize z-[60] shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-right')} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize z-[60] shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-left')} className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize z-[60] shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-right')} className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize z-[60] shadow-md" />
                  <div onMouseDown={(e) => handleLinkStart(e, el.id)} className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 bg-white border-2 border-indigo-600 rounded-full cursor-crosshair z-[60] shadow-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"><Plus size={14} strokeWidth={3} /></div>
                </>
              )}
              <div className={`w-full h-full flex flex-col p-6 relative ${el.type === 'circle' ? 'rounded-full text-center items-center justify-center' : ''} ${el.type === 'diamond' ? 'items-center justify-center p-8' : ''}`}>
                <textarea className={`w-full h-full bg-transparent outline-none resize-none text-base font-black tracking-tight scrollbar-hide text-slate-900 placeholder:text-slate-300 ${ (el.type === 'circle' || el.type === 'diamond' || el.type === 'triangle' ) ? 'text-center' : '' }`} value={el.content} placeholder="Enter insight..." onChange={(e) => { const n = elements.map(it => it.id === el.id ? { ...it, content: e.target.value } : it); setElements(n); saveElements(n); }} onMouseDown={e => e.stopPropagation()} />
              </div>
            </div>
          ))}
        </div>

        {elements.length === 0 && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-1000">
            <div className="p-20 rounded-[5rem] bg-white border border-slate-100 mb-10 shadow-inner">
              <PenTool size={100} className="text-slate-100" />
            </div>
            <h3 className="font-black text-5xl text-slate-900 tracking-tighter uppercase mb-4 opacity-10">Spatial Archive</h3>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em] opacity-30">Neural Rendering Engine Active</p>
          </div>
        )}
      </div>

      {/* Architect Interface */}
      {isAiMindMapPromptOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-white/20 w-full max-w-2xl transform transition-all">
             <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                   <Sparkles size={40} />
                </div>
                <div>
                   <h3 className="font-black text-4xl tracking-tighter text-slate-900">AI Architect</h3>
                   <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-2">Neural Visualization Engine</p>
                </div>
             </div>
             <textarea autoFocus className="w-full bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-10 text-xl font-black text-slate-900 focus:ring-8 focus:ring-indigo-50 focus:border-indigo-600 outline-none h-64 resize-none mb-12 shadow-inner placeholder:text-slate-300" placeholder="Describe the logical architecture or process flow..." value={aiPromptValue} onChange={(e) => setAiPromptValue(e.target.value)} />
             <div className="flex gap-8">
               <button onClick={() => setIsAiMindMapPromptOpen(false)} className="flex-1 py-6 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors btn-tactile">Abort</button>
               <button onClick={handleAiArchitect} disabled={!aiPromptValue.trim() || isGenerating} className="flex-[2] bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl btn-tactile flex items-center justify-center gap-4">
                 {isGenerating ? <Loader2 className="animate-spin" size={24}/> : <ArrowRightCircle size={24}/>}
                 Synthesize Logic
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Synthesis State */}
      {isGenerating && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-white/60 backdrop-blur-3xl animate-in fade-in">
           <div className="flex flex-col items-center">
              <div className="relative mb-10">
                 <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-30 animate-pulse" />
                 <Loader2 size={80} className="text-indigo-600 animate-spin" />
              </div>
              <h4 className="font-black text-3xl text-slate-900 uppercase tracking-tighter">{genStatus || 'Processing...'}</h4>
              <div className="flex items-center gap-3 mt-6 px-6 py-3 bg-indigo-50 rounded-full border border-indigo-100">
                <Info size={16} className="text-indigo-600" />
                <p className="text-[11px] text-indigo-600 font-black uppercase tracking-[0.4em] animate-pulse">Running Architectural Simulation</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;
