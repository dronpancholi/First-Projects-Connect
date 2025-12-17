
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { 
  Plus, MousePointer, Type, Square, Circle as CircleIcon, 
  StickyNote, X, Wand2, Trash2, Image as ImageIcon, 
  Palette, Sparkles, Send, Layers, Copy, Trash, PenTool, 
  ChevronDown, LayoutGrid, Loader2
} from 'lucide-react';
import { CanvasElement } from '../types.ts';
import * as GeminiService from '../services/geminiService.ts';

const COLORS = [
  '#FFFFFF', '#F3F4F6', '#DBEAFE', '#D1FAE5', '#FEF3C7', 
  '#FEE2E2', '#EDE9FE', '#FCE7F3', '#FFEDD5', '#334155', '#1E293B'
];

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const Whiteboard: React.FC = () => {
  const { whiteboards, addWhiteboard, updateWhiteboard, deleteWhiteboard } = useStore();
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<'select' | 'note' | 'text' | 'rect' | 'circle' | 'image'>('select');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [aiPromptValue, setAiPromptValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingClickPos, setPendingClickPos] = useState<{ x: number, y: number } | null>(null);
  const [isAiMindMapPromptOpen, setIsAiMindMapPromptOpen] = useState(false);

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

  const addElement = async (e: React.MouseEvent) => {
    if (e.target !== containerRef.current || tool === 'select') return;
    if (!activeBoardId) {
      alert("Please select or create a whiteboard first.");
      return;
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'image') { 
      setPendingClickPos({ x, y }); 
      setIsAiPromptOpen(true); 
      return; 
    }

    const newEl: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: tool as any,
      x: x - 75,
      y: y - 75,
      width: 150,
      height: 150,
      color: tool === 'note' ? '#FEF3C7' : tool === 'text' ? 'transparent' : '#DBEAFE',
      content: tool === 'text' ? 'New Text' : ''
    };

    const next = [...elements, newEl];
    setElements(next);
    setSelectedId(newEl.id);
    setTool('select');
    saveElements(next);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(it => it.id === id);
    if (el) { 
      setDraggingId(id); 
      setDragOffset({ x: e.clientX - el.x, y: e.clientY - el.y }); 
    }
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, handle: ResizeHandle) => {
    e.stopPropagation();
    setResizingId(id);
    setResizeHandle(handle);
  };

  const deleteElement = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    if ('stopPropagation' in e) e.stopPropagation();
    const next = elements.filter(el => el.id !== id);
    setElements(next);
    setSelectedId(null);
    saveElements(next);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingId) {
      const nextEls = elements.map(el => el.id === draggingId ? { 
        ...el, 
        x: e.clientX - dragOffset.x, 
        y: e.clientY - dragOffset.y 
      } : el);
      setElements(nextEls);
    } else if (resizingId && resizeHandle && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mX = e.clientX - rect.left;
      const mY = e.clientY - rect.top;

      setElements(prev => prev.map(el => {
        if (el.id !== resizingId) return el;
        
        let { x, y, width = 150, height = 150 } = el;
        const minSize = 40;

        switch (resizeHandle) {
          case 'bottom-right':
            width = Math.max(minSize, mX - x);
            height = Math.max(minSize, mY - y);
            break;
          case 'bottom-left':
            const newWidthBL = Math.max(minSize, (x + width) - mX);
            x = (x + width) - newWidthBL;
            width = newWidthBL;
            height = Math.max(minSize, mY - y);
            break;
          case 'top-right':
            width = Math.max(minSize, mX - x);
            const newHeightTR = Math.max(minSize, (y + height) - mY);
            y = (y + height) - newHeightTR;
            height = newHeightTR;
            break;
          case 'top-left':
            const newWidthTL = Math.max(minSize, (x + width) - mX);
            const newHeightTL = Math.max(minSize, (y + height) - mY);
            x = (x + width) - newWidthTL;
            y = (y + height) - newHeightTL;
            width = newWidthTL;
            height = newHeightTL;
            break;
        }

        return { ...el, x, y, width, height };
      }));
    }
  }, [draggingId, resizingId, resizeHandle, dragOffset, elements]);

  const handleMouseUp = useCallback(() => {
    if (draggingId || resizingId) {
      saveElements(elements);
    }
    setDraggingId(null);
    setResizingId(null);
    setResizeHandle(null);
  }, [draggingId, resizingId, elements, saveElements]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseup', handleMouseUp); 
    };
  }, [handleMouseMove, handleMouseUp]);

  const updateElementContent = (id: string, content: string) => {
    const next = elements.map(el => el.id === id ? { ...el, content } : el);
    setElements(next);
    saveElements(next);
  };

  const handleAiGenerate = async () => {
    if (!aiPromptValue.trim() || !pendingClickPos || !activeBoardId) return;
    setIsGenerating(true);
    setIsAiPromptOpen(false);
    try {
      const dataUrl = await GeminiService.generateImageForWhiteboard(aiPromptValue);
      if (dataUrl) {
        const newEl: CanvasElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          x: pendingClickPos.x - 100,
          y: pendingClickPos.y - 100,
          content: dataUrl,
          width: 200,
          height: 200,
          color: '#FFFFFF'
        };
        const next = [...elements, newEl];
        setElements(next);
        setSelectedId(newEl.id);
        saveElements(next);
      }
    } catch (err) {
      console.error("AI Gen Failed", err);
    } finally {
      setIsGenerating(false);
      setAiPromptValue('');
      setPendingClickPos(null);
      setTool('select');
    }
  };

  const handleAiMindMap = async () => {
    if (!aiPromptValue.trim() || !activeBoardId) return;
    setIsGenerating(true);
    setIsAiMindMapPromptOpen(false);
    try {
      const generatedElements = await GeminiService.generateWhiteboardLayout(aiPromptValue);
      const next = [...elements, ...generatedElements];
      setElements(next);
      saveElements(next);
    } catch (err) {
      console.error("Mind Map AI Failed", err);
    } finally {
      setIsGenerating(false);
      setAiPromptValue('');
    }
  };

  const handleDeleteBoard = async () => {
    if (!activeBoardId) return;
    if (confirm('Permanently delete this whiteboard?')) {
      const idToDelete = activeBoardId;
      const remaining = whiteboards.filter(w => w.id !== idToDelete);
      // Change active board ID first for smoother transition
      setActiveBoardId(remaining.length > 0 ? remaining[0].id : null);
      setElements([]);
      setSelectedId(null);
      await deleteWhiteboard(idToDelete);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative overflow-hidden select-none">
      {/* HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between pointer-events-none items-start gap-4">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200 rounded-[24px] p-1.5 flex gap-1 items-center">
           <div className="flex items-center px-3 border-r border-gray-100 gap-2">
             <LayoutGrid size={14} className="text-blue-600" />
             <select 
               className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer min-w-[140px]" 
               value={activeBoardId || ''} 
               onChange={(e) => setActiveBoardId(e.target.value)}
             >
               <option value="" disabled>Select Board</option>
               {whiteboards.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
             </select>
           </div>
           <button 
             onClick={() => addWhiteboard({ title: `Board ${whiteboards.length + 1}`, elements: [] })} 
             className="p-2.5 hover:bg-gray-100 rounded-2xl text-gray-500 hover:text-black transition-all"
             title="New Board"
           >
             <Plus size={18} />
           </button>
           {activeBoardId && (
             <button 
               onClick={handleDeleteBoard} 
               className="p-2.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
               title="Delete Board"
             >
               <Trash2 size={18} />
             </button>
           )}
        </div>

        <div className="pointer-events-auto bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200 rounded-full p-2 flex gap-1 ring-1 ring-black/5">
          {[
            { id: 'select', icon: <MousePointer size={18} /> },
            { id: 'note', icon: <StickyNote size={18} /> },
            { id: 'text', icon: <Type size={18} /> },
            { id: 'rect', icon: <Square size={18} /> },
            { id: 'circle', icon: <CircleIcon size={18} /> },
            { id: 'image', icon: <ImageIcon size={18} /> }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => { setTool(t.id as any); if(t.id !== 'select') setSelectedId(null); }} 
              className={`p-3 rounded-full transition-all duration-300 ${tool === t.id ? 'bg-black text-white scale-110 shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
              title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
            >
              {t.icon}
            </button>
          ))}
          <div className="w-px h-8 bg-gray-200 mx-1 self-center" />
          <button 
            onClick={() => { setIsAiMindMapPromptOpen(true); }}
            className="p-3 rounded-full text-blue-600 hover:bg-blue-50 transition-all group"
            title="AI Visual Architect"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {selectedId ? (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200 rounded-[24px] p-2 flex gap-1 items-center animate-in slide-in-from-top duration-300 ease-out">
            <div className="flex gap-1.5 pr-2 border-r border-gray-100 px-1">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  onClick={() => {
                    const n = elements.map(it => it.id === selectedId ? {...it, color: c} : it);
                    setElements(n);
                    saveElements(n);
                  }} 
                  className={`w-6 h-6 rounded-full border border-gray-200 hover:scale-125 transition-transform ${elements.find(e => e.id === selectedId)?.color === c ? 'ring-2 ring-black ring-offset-2' : ''}`} 
                  style={{ backgroundColor: c }} 
                />
              ))}
            </div>
            <button 
              onClick={(e) => deleteElement(e, selectedId)} 
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              title="Remove Item"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ) : <div className="w-20" />}
      </div>

      {/* Main Drawing Area */}
      <div 
        ref={containerRef} 
        className="flex-1 cursor-crosshair relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:32px_32px] bg-white overflow-hidden transition-all duration-500" 
        onMouseDown={addElement}
      >
        {isGenerating && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4 bg-white/90 p-10 rounded-[40px] shadow-2xl border border-gray-100">
               <div className="relative">
                 <Sparkles className="text-blue-600 animate-spin-slow" size={48} />
                 <Loader2 className="text-blue-600 animate-spin absolute inset-0" size={48} />
               </div>
               <div className="text-center">
                 <h3 className="font-black tracking-tight text-xl mb-1">Architecting Vision</h3>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Gemini is laying out your ideas...</p>
               </div>
            </div>
          </div>
        )}

        {/* AI Drawing / Mind Map Prompts */}
        {(isAiPromptOpen || isAiMindMapPromptOpen) && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/10 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white/95 backdrop-blur p-8 rounded-[40px] shadow-2xl border border-white/20 w-full max-w-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-black text-2xl tracking-tight">{isAiMindMapPromptOpen ? "Visual Architect" : "AI Illustration"}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Gemini reasoning engine</p>
                </div>
              </div>
              <textarea
                autoFocus
                className="w-full bg-gray-50 border border-gray-100 rounded-[24px] p-5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none h-40 resize-none mb-6 shadow-inner transition-all"
                placeholder={isAiMindMapPromptOpen 
                  ? "Describe a topic for a mind map (e.g., Solar Energy Market, App Features, Project Roadmap)..." 
                  : "Describe the icon or image you want (e.g., A minimalist database icon, neon style)..."}
                value={aiPromptValue}
                onChange={(e) => setAiPromptValue(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={() => { setIsAiPromptOpen(false); setIsAiMindMapPromptOpen(false); setTool('select'); }} className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-black transition-colors">Cancel</button>
                <button 
                  onClick={isAiMindMapPromptOpen ? handleAiMindMap : handleAiGenerate} 
                  disabled={!aiPromptValue.trim()} 
                  className="flex-[2] bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-30 shadow-xl active:scale-95"
                >
                  Create Visuals
                </button>
              </div>
            </div>
          </div>
        )}

        {elements.map(el => (
          <div 
            key={el.id} 
            onMouseDown={(e) => handleMouseDown(e, el.id)} 
            className={`absolute group transition-shadow shadow-sm ${el.type === 'circle' ? 'rounded-full' : 'rounded-2xl'} ${selectedId === el.id ? 'ring-4 ring-blue-500/30 z-40' : 'hover:ring-4 hover:ring-blue-400/20'}`} 
            style={{ 
              left: el.x, 
              top: el.y, 
              width: el.width, 
              height: el.height, 
              backgroundColor: el.color,
              zIndex: selectedId === el.id ? 10 : 1
            }}
          >
            {/* Resizing Handles */}
            {selectedId === el.id && (
              <>
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-left')} className="absolute -top-2 -left-2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-50 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-right')} className="absolute -top-2 -right-2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-50 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-left')} className="absolute -bottom-2 -left-2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-50 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-right')} className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-50 shadow-md opacity-100" />
              </>
            )}

            <div className={`w-full h-full relative overflow-hidden ${el.type === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>
              {el.type === 'text' || el.type === 'note' ? (
                <textarea 
                  className="w-full h-full bg-transparent p-5 outline-none resize-none text-sm font-black text-gray-800 placeholder:text-gray-400/50 scrollbar-hide" 
                  value={el.content} 
                  placeholder={el.type === 'text' ? "Aa..." : "Content..."}
                  onChange={(e) => updateElementContent(el.id, e.target.value)} 
                  onMouseDown={e => e.stopPropagation()} 
                />
              ) : el.type === 'image' ? (
                <img src={el.content} className="w-full h-full object-contain p-2 pointer-events-none" />
              ) : null}
            </div>
          </div>
        ))}
        
        {elements.length === 0 && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none animate-in fade-in duration-700">
            <div className="p-8 rounded-[60px] bg-gray-50/50 mb-6 ring-1 ring-gray-100">
              <PenTool size={80} className="opacity-10" />
            </div>
            <h3 className="font-black text-2xl text-gray-400 tracking-tight uppercase">Infinite Canvas</h3>
            <p className="text-sm text-gray-300 font-bold uppercase tracking-widest mt-2">Start with a thought or ask AI for a mind map.</p>
          </div>
        )}
      </div>
      
      {/* Footer Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-black/90 text-white/50 text-[10px] px-6 py-2.5 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-xl border border-white/10">
          Double Click to Edit • Drag to Move • <span className="text-blue-400">Alt + Click to Rapid Note</span>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
