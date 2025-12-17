
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { 
  Plus, MousePointer, Type, Square, Circle as CircleIcon, 
  StickyNote, X, Wand2, Trash2, Image as ImageIcon, 
  Palette, Sparkles, Send, Layers, Copy, Trash, PenTool
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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [pendingClickPos, setPendingClickPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (whiteboards.length > 0 && !activeBoardId) {
      setActiveBoardId(whiteboards[0].id);
    }
  }, [whiteboards, activeBoardId]);

  useEffect(() => {
    const board = whiteboards.find(w => w.id === activeBoardId);
    if (board) {
      // Handle the case where elements might be stored as a string or array
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

  const deleteElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
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

  const updateElementColor = (id: string, color: string) => {
    // Fixed typo: changed 'it' to 'el' to correctly reference the map iteration variable
    const next = elements.map(el => el.id === id ? { ...el, color } : el);
    setElements(next);
    saveElements(next);
  };

  const handleAiGenerate = async () => {
    if (!aiPromptValue.trim() || !pendingClickPos || !activeBoardId) return;
    setIsGeneratingImage(true);
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
      setIsGeneratingImage(false);
      setAiPromptValue('');
      setPendingClickPos(null);
      setTool('select');
    }
  };

  const handleDeleteBoard = async () => {
    if (!activeBoardId) return;
    if (confirm('Are you sure you want to delete this whiteboard?')) {
      const toDelete = activeBoardId;
      // Optimistic update
      const remaining = whiteboards.filter(w => w.id !== toDelete);
      setActiveBoardId(remaining.length > 0 ? remaining[0].id : null);
      await deleteWhiteboard(toDelete);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative overflow-hidden select-none">
      {/* HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur shadow-sm border border-gray-200 rounded-2xl p-1.5 flex gap-2 items-center">
           <select 
             className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer" 
             value={activeBoardId || ''} 
             onChange={(e) => setActiveBoardId(e.target.value)}
           >
             <option value="" disabled>Whiteboards</option>
             {whiteboards.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
           </select>
           <button 
             onClick={() => addWhiteboard({ title: `Board ${whiteboards.length + 1}`, elements: [] })} 
             className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"
             title="New Board"
           >
             <Plus size={18} />
           </button>
           {activeBoardId && (
             <button 
               onClick={handleDeleteBoard} 
               className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
               title="Delete Board"
             >
               <Trash size={18} />
             </button>
           )}
        </div>

        <div className="pointer-events-auto bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-full p-2 flex gap-1">
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
              className={`p-2.5 rounded-full transition-all ${tool === t.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {selectedId && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur shadow-lg border border-gray-200 rounded-2xl p-2 flex gap-1 items-center animate-in slide-in-from-top duration-200">
            <div className="flex gap-1 pr-2 border-r border-gray-100">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  onClick={() => {
                    const n = elements.map(it => it.id === selectedId ? {...it, color: c} : it);
                    setElements(n);
                    saveElements(n);
                  }} 
                  className={`w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform ${elements.find(e => e.id === selectedId)?.color === c ? 'ring-2 ring-black ring-offset-1' : ''}`} 
                  style={{ backgroundColor: c }} 
                />
              ))}
            </div>
            <button 
              onClick={(e) => deleteElement(e, selectedId)} 
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Element"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Main Drawing Area */}
      <div 
        ref={containerRef} 
        className="flex-1 cursor-crosshair relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:32px_32px] bg-white overflow-hidden" 
        onMouseDown={addElement}
      >
        {isGeneratingImage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
               <Sparkles className="text-purple-600 animate-pulse" size={40} />
               <span className="font-bold text-gray-800">AI Drawing...</span>
            </div>
          </div>
        )}

        {isAiPromptOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-md animate-in zoom-in duration-200">
              <h3 className="font-bold text-gray-900 mb-2">AI Illustration</h3>
              <p className="text-xs text-gray-500 mb-4">Describe the visual you want to add to your board.</p>
              <textarea
                autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black outline-none h-32 resize-none mb-4"
                placeholder="e.g. A minimalist cloud icon, flat design, blue tones..."
                value={aiPromptValue}
                onChange={(e) => setAiPromptValue(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => { setIsAiPromptOpen(false); setTool('select'); }} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                <button onClick={handleAiGenerate} disabled={!aiPromptValue.trim()} className="flex-2 bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">Generate</button>
              </div>
            </div>
          </div>
        )}

        {elements.map(el => (
          <div 
            key={el.id} 
            onMouseDown={(e) => handleMouseDown(e, el.id)} 
            className={`absolute group transition-shadow shadow-sm ${el.type === 'circle' ? 'rounded-full' : 'rounded-2xl'} ${selectedId === el.id ? 'ring-2 ring-blue-500 z-40' : 'hover:ring-2 hover:ring-blue-400/50'}`} 
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
            {selectedId === el.id && (el.type === 'rect' || el.type === 'circle' || el.type === 'image' || el.type === 'note') && (
              <>
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-left')} className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-right')} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-left')} className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-right')} className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-50 shadow-sm opacity-100" />
              </>
            )}

            <div className={`w-full h-full relative overflow-hidden ${el.type === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>
              {el.type === 'text' || el.type === 'note' ? (
                <textarea 
                  className="w-full h-full bg-transparent p-4 outline-none resize-none text-sm font-medium text-gray-800 placeholder:text-gray-400/50" 
                  value={el.content} 
                  placeholder={el.type === 'text' ? "Aa..." : "Note details..."}
                  onChange={(e) => updateElementContent(el.id, e.target.value)} 
                  onMouseDown={e => e.stopPropagation()} 
                />
              ) : el.type === 'image' ? (
                <img src={el.content} className="w-full h-full object-contain p-2 pointer-events-none" />
              ) : null}
            </div>
          </div>
        ))}
        
        {elements.length === 0 && !isGeneratingImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
            {/* Fixed: Added missing PenTool component import and usage */}
            <PenTool size={64} className="mb-4 opacity-20" />
            <p className="font-medium text-lg opacity-40">Your creative space is ready.</p>
            <p className="text-sm opacity-30 mt-1">Select a tool to start brainstorming.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
