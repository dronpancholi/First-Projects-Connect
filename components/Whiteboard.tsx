
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { 
  Plus, MousePointer2, Type, Square, Circle as CircleIcon, 
  StickyNote, X, Wand2, Trash2, Image as ImageIcon, 
  Palette, Sparkles, Send, Layers, Copy, Trash, PenTool, 
  LayoutGrid, Loader2, Maximize, ZoomIn, ZoomOut, Move,
  Hand, BoxSelect, Network, ArrowRightCircle, Info
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
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [aiPromptValue, setAiPromptValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<string>('');
  const [pendingClickPos, setPendingClickPos] = useState<{ x: number, y: number } | null>(null);
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

  // Coordinate Mapping Logic
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
      
      return {
        x: centerX - rect.left - mx * newScale,
        y: centerY - rect.top - my * newScale,
        scale: newScale
      };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoom(e.deltaY, e.clientX, e.clientY);
    } else {
      setTransform(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const addElement = async (e: React.MouseEvent) => {
    if (e.target !== containerRef.current || tool === 'select' || tool === 'pan') return;
    if (!activeBoardId) return;
    
    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (tool === 'image') { 
      setPendingClickPos({ x, y }); 
      setIsAiPromptOpen(true); 
      return; 
    }

    const newEl: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: tool as any,
      x: x - 100,
      y: y - 50,
      width: 200,
      height: 100,
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

  const deleteElement = (id: string) => {
    const next = elements.filter(el => el.id !== id);
    setElements(next);
    setSelectedId(null);
    saveElements(next);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning || tool === 'pan') {
      if (e.buttons === 1) {
        setTransform(prev => ({
          ...prev,
          x: prev.x + e.movementX,
          y: prev.y + e.movementY
        }));
      }
      return;
    }

    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (draggingId) {
      const nextEls = elements.map(el => el.id === draggingId ? { 
        ...el, 
        x: x - dragOffset.x, 
        y: y - dragOffset.y 
      } : el);
      setElements(nextEls);
    } else if (resizingId && resizeHandle) {
      setElements(prev => prev.map(el => {
        if (el.id !== resizingId) return el;
        let { x: ex, y: ey, width = 200, height = 100 } = el;
        const minSize = 40;

        switch (resizeHandle) {
          case 'bottom-right':
            width = Math.max(minSize, x - ex);
            height = Math.max(minSize, y - ey);
            break;
          case 'top-left':
            const dw = (ex + width) - x;
            const dh = (ey + height) - y;
            if (dw > minSize) { ex = x; width = dw; }
            if (dh > minSize) { ey = y; height = dh; }
            break;
          case 'top-right':
            width = Math.max(minSize, x - ex);
            const dhTR = (ey + height) - y;
            if (dhTR > minSize) { ey = y; height = dhTR; }
            break;
          case 'bottom-left':
            const dwBL = (ex + width) - x;
            if (dwBL > minSize) { ex = x; width = dwBL; }
            height = Math.max(minSize, y - ey);
            break;
        }
        return { ...el, x: ex, y: ey, width, height };
      }));
    }
  }, [draggingId, resizingId, resizeHandle, dragOffset, elements, screenToCanvas, tool, isPanning]);

  const handleMouseUp = useCallback(() => {
    if (draggingId || resizingId) {
      saveElements(elements);
    }
    setDraggingId(null);
    setResizingId(null);
    setResizeHandle(null);
    setIsPanning(false);
  }, [draggingId, resizingId, elements, saveElements]);

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
    setGenStatus('Determining Diagram Logic...');
    setIsAiMindMapPromptOpen(false);
    try {
      const response = await GeminiService.generateWhiteboardLayout(aiPromptValue);
      setGenStatus(`Architecting ${response.diagramType}...`);
      
      const next = [...elements, ...response.elements];
      setElements(next);
      saveElements(next);
      
      // Cinematic focusing
      if (response.elements.length > 0) {
        const first = response.elements[0];
        setTransform({ x: -first.x + 400, y: -first.y + 300, scale: 0.8 });
      }
    } catch (err) {
      console.error("FP-Engine Architect Failed", err);
    } finally {
      setIsGenerating(false);
      setGenStatus('');
      setAiPromptValue('');
    }
  };

  const renderConnections = useMemo(() => {
    return (
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible opacity-30">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
          </marker>
        </defs>
        {elements.map(el => {
          if (!el.parentId) return null;
          const parent = elements.find(p => p.id === el.parentId);
          if (!parent) return null;
          
          const sX = parent.x + (parent.width || 200) / 2;
          const sY = parent.y + (parent.height || 100) / 2;
          const eX = el.x + (el.width || 200) / 2;
          const eY = el.y + (el.height || 100) / 2;
          
          const dx = eX - sX;
          const dy = eY - sY;
          
          return (
            <path 
              key={`${el.id}-connection`}
              d={`M ${sX} ${sY} C ${sX + dx/2} ${sY}, ${sX + dx/2} ${eY}, ${eX} ${eY}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
          );
        })}
      </svg>
    );
  }, [elements]);

  return (
    <div className="h-full flex flex-col bg-[#F1F5F9] relative overflow-hidden select-none font-sans">
      <style>{`
        .spatial-grid {
          background-image: radial-gradient(#CBD5E1 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .pro-node {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pro-node:hover { transform: translateY(-3px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
        .hud-blur { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(24px); }
        
        .diamond-shape { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
        .triangle-shape { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
      `}</style>

      {/* Strategic HUD */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4 pointer-events-none">
        <div className="pointer-events-auto hud-blur border border-white/40 shadow-2xl rounded-[2.5rem] p-2 flex items-center gap-1.5 ring-1 ring-slate-200/50">
          <div className="flex items-center gap-2 px-4 border-r border-slate-200 mr-2">
             <Network size={16} className="text-blue-600" />
             <select 
               className="bg-transparent border-none text-[11px] font-black uppercase tracking-tighter text-slate-700 focus:ring-0 cursor-pointer min-w-[140px]" 
               value={activeBoardId || ''} 
               onChange={(e) => setActiveBoardId(e.target.value)}
             >
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
            <button 
              key={t.id} 
              onClick={() => { setTool(t.id as any); setSelectedId(null); }} 
              className={`p-3 rounded-2xl transition-all ${tool === t.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}
              title={t.id.toUpperCase()}
            >
              {t.icon}
            </button>
          ))}

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <button 
            onClick={() => setIsAiMindMapPromptOpen(true)}
            className="p-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all group flex items-center gap-2 px-5 shadow-lg shadow-blue-200"
          >
            <Sparkles size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Architect</span>
          </button>
        </div>
      </div>

      {/* Floating Canvas State Control */}
      <div className="absolute bottom-8 right-8 z-[100] flex flex-col gap-3">
        <div className="hud-blur border border-slate-200 p-1.5 rounded-3xl shadow-2xl flex flex-col">
          <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(p.scale + 0.1, 5) }))} className="p-3 text-slate-400 hover:text-slate-900"><ZoomIn size={18}/></button>
          <div className="text-[10px] font-black text-slate-400 text-center py-1">{Math.round(transform.scale * 100)}%</div>
          <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(p.scale - 0.1, 0.1) }))} className="p-3 text-slate-400 hover:text-slate-900"><ZoomOut size={18}/></button>
        </div>
        <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="hud-blur border border-slate-200 p-4 rounded-3xl shadow-2xl text-slate-400 hover:text-slate-900"><Maximize size={18}/></button>
      </div>

      {/* Left Workspace Management */}
      <div className="absolute top-6 left-6 z-[100] flex gap-2">
         <button onClick={() => { if(activeBoardId) deleteWhiteboard(activeBoardId) }} className="hud-blur border border-slate-200 p-3.5 rounded-2xl shadow-xl text-slate-400 hover:text-rose-600"><Trash size={18}/></button>
         <button onClick={() => addWhiteboard({ title: 'New Workspace', elements: [] })} className="hud-blur border border-slate-200 p-3.5 rounded-2xl shadow-xl text-slate-400 hover:text-blue-600"><Plus size={18}/></button>
      </div>

      {/* Selected Action Bar */}
      {selectedId && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 pointer-events-none">
          <div className="pointer-events-auto bg-slate-900 text-white px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-8 border border-white/10 ring-1 ring-slate-800">
             <div className="flex gap-2.5">
               {COLORS.map(c => (
                 <button 
                  key={c} 
                  onClick={() => {
                    const n = elements.map(it => it.id === selectedId ? {...it, color: c} : it);
                    setElements(n);
                    saveElements(n);
                  }} 
                  className={`w-7 h-7 rounded-full border border-white/10 transition-transform hover:scale-125 ${elements.find(e => e.id === selectedId)?.color === c ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                  style={{ backgroundColor: c }}
                 />
               ))}
             </div>
             <div className="w-px h-8 bg-slate-800" />
             <button onClick={() => deleteElement(selectedId)} className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest hover:text-rose-300">
               <Trash2 size={18} /> Remove
             </button>
          </div>
        </div>
      )}

      {/* Infinite Drawing Engine */}
      <div 
        ref={containerRef} 
        onWheel={onWheel}
        onMouseDown={(e) => { 
          if (tool === 'pan' || (e.button === 0 && e.target === containerRef.current)) {
            setIsPanning(true);
          }
          addElement(e);
        }}
        className={`flex-1 overflow-hidden relative spatial-grid bg-white transition-all cursor-${tool === 'pan' || isPanning ? 'grabbing' : tool === 'select' ? 'default' : 'crosshair'}`}
      >
        <div 
          style={{ 
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {renderConnections}

          {elements.map(el => (
            <div 
              key={el.id} 
              onMouseDown={(e) => handleMouseDown(e, el.id)} 
              className={`absolute group pro-node pointer-events-auto overflow-visible 
                ${el.type === 'circle' ? 'rounded-full' : 'rounded-2xl'} 
                ${selectedId === el.id ? 'ring-4 ring-blue-500 shadow-2xl z-50 scale-[1.02]' : 'border border-slate-200'}
                ${el.type === 'diamond' ? 'diamond-shape' : ''}
                ${el.type === 'triangle' ? 'triangle-shape' : ''}
              `} 
              style={{ 
                left: el.x, 
                top: el.y, 
                width: el.width || 200, 
                height: el.height || 100, 
                backgroundColor: el.color || '#FFFFFF',
              }}
            >
              {/* Pro Handles */}
              {selectedId === el.id && (
                <>
                  <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-left')} className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize z-[60] shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-right')} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize z-[60] shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-left')} className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize z-[60] shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-right')} className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize z-[60] shadow-md" />
                </>
              )}

              <div className={`w-full h-full flex flex-col p-4 relative ${el.type === 'circle' ? 'rounded-full text-center items-center justify-center' : ''} ${el.type === 'diamond' ? 'items-center justify-center p-6' : ''}`}>
                <textarea 
                  className={`w-full h-full bg-transparent outline-none resize-none text-sm font-bold scrollbar-hide text-slate-800 placeholder:text-slate-300 
                    ${(el.type === 'circle' || el.type === 'diamond' || el.type === 'triangle') ? 'text-center' : ''}`}
                  value={el.content}
                  placeholder="Insert Insight..."
                  onChange={(e) => {
                    const n = elements.map(it => it.id === el.id ? { ...it, content: e.target.value } : it);
                    setElements(n);
                    saveElements(n);
                  }}
                  onMouseDown={e => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>

        {elements.length === 0 && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-1000">
            <div className="p-16 rounded-[4rem] bg-slate-50 border border-slate-100 mb-8 shadow-inner">
              <PenTool size={80} className="text-slate-200" />
            </div>
            <h3 className="font-black text-4xl text-slate-300 tracking-tighter uppercase mb-4">Spatial Architecture</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.4em] opacity-40">FP-Engine Synthesis Engine Active</p>
          </div>
        )}
      </div>

      {/* Strategic Architect Overlay */}
      {isAiMindMapPromptOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-[0_50px_150px_rgba(0,0,0,0.3)] border border-white/20 w-full max-w-2xl transform transition-all">
             <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-2xl">
                   <Sparkles size={32} />
                </div>
                <div>
                   <h3 className="font-black text-3xl tracking-tighter text-slate-900">FP-Engine Architect</h3>
                   <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">Universal Visual Architecture System</p>
                </div>
             </div>
             <textarea 
               autoFocus
               className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-8 text-lg font-bold text-slate-900 focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none h-60 resize-none mb-10 shadow-inner"
               placeholder="Describe a process, strategy, or project structure. The AI will decide on the best visualization type..."
               value={aiPromptValue}
               onChange={(e) => setAiPromptValue(e.target.value)}
             />
             <div className="flex gap-4">
               <button onClick={() => setIsAiMindMapPromptOpen(false)} className="flex-1 py-6 text-sm font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Abort</button>
               <button 
                onClick={handleAiArchitect}
                disabled={!aiPromptValue.trim() || isGenerating}
                className="flex-[2] bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
               >
                 {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <ArrowRightCircle size={20}/>}
                 Synthesize Logic
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Synthesis Animation Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-white/50 backdrop-blur-3xl animate-in fade-in">
           <div className="flex flex-col items-center">
              <div className="relative mb-8">
                 <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-30 animate-pulse" />
                 <Loader2 size={64} className="text-blue-600 animate-spin" />
              </div>
              <h4 className="font-black text-2xl text-slate-900 uppercase tracking-tighter">{genStatus || 'Synthesizing...'}</h4>
              <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                <Info size={14} className="text-blue-600" />
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em] animate-pulse">Running Neural Blueprint Simulation</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;
