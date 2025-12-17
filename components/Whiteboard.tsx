
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { 
  Plus, MousePointer, Type, Square, Circle as CircleIcon, 
  StickyNote, X, Wand2, Trash2, Image as ImageIcon, 
  Palette, Sparkles, Send, Layers, Copy
} from 'lucide-react';
import { CanvasElement } from '../types.ts';
import * as GeminiService from '../services/geminiService.ts';

const COLORS = [
  '#FFFFFF', '#F3F4F6', '#DBEAFE', '#D1FAE5', '#FEF3C7', 
  '#FEE2E2', '#EDE9FE', '#FCE7F3', '#FFEDD5', '#000000'
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15);
};

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const Whiteboard: React.FC = () => {
  const { whiteboards, addWhiteboard, updateWhiteboard } = useStore();
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
    if (whiteboards.length > 0 && !activeBoardId) setActiveBoardId(whiteboards[0].id);
  }, [whiteboards, activeBoardId]);

  useEffect(() => {
    const board = whiteboards.find(w => w.id === activeBoardId);
    if (board) setElements(board.elements || []);
    else setElements([]);
    setSelectedId(null);
  }, [activeBoardId, whiteboards]);

  const addElement = async (e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;

    if (tool === 'select') {
      setSelectedId(null);
      return;
    }

    if (!activeBoardId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'image') {
      setPendingClickPos({ x, y });
      setIsAiPromptOpen(true);
      return;
    }

    let content: string | undefined = undefined;
    let color = '#DBEAFE';
    let width = 150;
    let height = 150;

    if (tool === 'note') {
      content = '';
      color = '#FEF3C7';
    } else if (tool === 'text') {
      content = 'New Text';
      height = 50;
      color = 'transparent';
    } else if (tool === 'rect' || tool === 'circle') {
      color = '#DBEAFE';
    }

    const newEl: CanvasElement = {
      id: generateId(),
      type: tool as any,
      x: x - (width / 2),
      y: y - (height / 2),
      content,
      color,
      width,
      height
    };

    const newElements = [...elements, newEl];
    setElements(newElements);
    setTool('select'); 
    setSelectedId(newEl.id);
    updateWhiteboard(activeBoardId, newElements);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(el => el.id === id);
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingId) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setElements(prev => prev.map(el => el.id === draggingId ? { ...el, x: newX, y: newY } : el));
    } else if (resizingId && containerRef.current && resizeHandle) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setElements(prev => prev.map(el => {
        if (el.id === resizingId) {
          let newX = el.x;
          let newY = el.y;
          let newWidth = el.width || 150;
          let newHeight = el.height || 150;

          const right = el.x + (el.width || 0);
          const bottom = el.y + (el.height || 0);

          switch (resizeHandle) {
            case 'bottom-right':
              newWidth = Math.max(40, mouseX - el.x);
              newHeight = Math.max(40, mouseY - el.y);
              break;
            case 'bottom-left':
              newWidth = Math.max(40, right - mouseX);
              newX = right - newWidth;
              newHeight = Math.max(40, mouseY - el.y);
              break;
            case 'top-right':
              newWidth = Math.max(40, mouseX - el.x);
              newHeight = Math.max(40, bottom - mouseY);
              newY = bottom - newHeight;
              break;
            case 'top-left':
              newWidth = Math.max(40, right - mouseX);
              newX = right - newWidth;
              newHeight = Math.max(40, bottom - mouseY);
              newY = bottom - newHeight;
              break;
          }

          return { ...el, x: newX, y: newY, width: newWidth, height: newHeight };
        }
        return el;
      }));
    }
  }, [draggingId, resizingId, resizeHandle, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if ((draggingId || resizingId) && activeBoardId) {
      updateWhiteboard(activeBoardId, elements);
    }
    setDraggingId(null);
    setResizingId(null);
    setResizeHandle(null);
  }, [draggingId, resizingId, activeBoardId, elements, updateWhiteboard]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const deleteElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newEls = elements.filter(el => el.id !== id);
    setElements(newEls);
    if (selectedId === id) setSelectedId(null);
    if (activeBoardId) updateWhiteboard(activeBoardId, newEls);
  };

  const changeColor = (color: string) => {
    if (!selectedId || !activeBoardId) return;
    const newEls = elements.map(el => el.id === selectedId ? { ...el, color } : el);
    setElements(newEls);
    updateWhiteboard(activeBoardId, newEls);
  };

  const duplicateElement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedId || !activeBoardId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    const newEl = { ...el, id: generateId(), x: el.x + 20, y: el.y + 20 };
    const newEls = [...elements, newEl];
    setElements(newEls);
    setSelectedId(newEl.id);
    updateWhiteboard(activeBoardId, newEls);
  };

  const bringToFront = () => {
    if (!selectedId || !activeBoardId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    const newEls = [...elements.filter(e => e.id !== selectedId), el];
    setElements(newEls);
    updateWhiteboard(activeBoardId, newEls);
  };

  const handleAiGenerate = async () => {
    if (!aiPromptValue.trim() || !pendingClickPos || !activeBoardId) return;
    setIsGeneratingImage(true);
    setIsAiPromptOpen(false);
    try {
      const dataUrl = await GeminiService.generateImageForWhiteboard(aiPromptValue);
      if (dataUrl) {
        const newEl: CanvasElement = {
          id: generateId(),
          type: 'image',
          x: pendingClickPos.x - 125,
          y: pendingClickPos.y - 125,
          content: dataUrl,
          color: '#FFFFFF',
          width: 250,
          height: 250
        };
        const newElements = [...elements, newEl];
        setElements(newElements);
        setSelectedId(newEl.id);
        updateWhiteboard(activeBoardId, newElements);
      }
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGeneratingImage(false);
      setAiPromptValue('');
      setPendingClickPos(null);
      setTool('select');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur shadow-sm border border-gray-200 rounded-2xl p-1.5">
           <select 
              className="bg-transparent border-none text-sm font-bold focus:ring-0 py-1 pl-3 pr-8 cursor-pointer"
              value={activeBoardId || ''}
              onChange={(e) => setActiveBoardId(e.target.value)}
            >
              <option value="" disabled>Whiteboards</option>
              {whiteboards.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
           </select>
           <button 
             onClick={() => addWhiteboard({ title: `Board ${whiteboards.length + 1}`, elements: [] })} 
             className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-blue-600 transition-colors"
           >
             <Plus size={18} />
           </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          {activeBoardId && (
            <div className="pointer-events-auto bg-white/90 backdrop-blur shadow-xl border border-gray-200 rounded-full p-2 flex gap-1.5">
              {[
                { id: 'select', icon: <MousePointer size={18} />, bg: 'hover:bg-gray-100', activeBg: 'bg-black text-white' },
                { id: 'note', icon: <StickyNote size={18} />, bg: 'hover:bg-yellow-50', activeBg: 'bg-yellow-200 text-yellow-800' },
                { id: 'text', icon: <Type size={18} />, bg: 'hover:bg-blue-50', activeBg: 'bg-blue-100 text-blue-700' },
                { id: 'rect', icon: <Square size={18} />, bg: 'hover:bg-gray-100', activeBg: 'bg-gray-800 text-white' },
                { id: 'circle', icon: <CircleIcon size={18} />, bg: 'hover:bg-indigo-50', activeBg: 'bg-indigo-100 text-indigo-700' },
                { id: 'image', icon: <ImageIcon size={18} />, bg: 'hover:bg-purple-50', activeBg: 'bg-purple-600 text-white' }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTool(t.id as any)} 
                  className={`p-2.5 rounded-full transition-all ${tool === t.id ? t.activeBg : `text-gray-500 ${t.bg}`}`}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          )}

          {selectedId && (
            <div className="pointer-events-auto bg-white/90 backdrop-blur shadow-lg border border-gray-200 rounded-2xl p-2 flex gap-1 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1.5 px-2 border-r border-gray-200 mr-1">
                <Palette size={14} className="text-gray-400" />
              </div>
              <div className="flex gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => changeColor(c)}
                    className="w-6 h-6 rounded-full border border-gray-200 transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 px-2 border-l border-gray-200 ml-1">
                <button onClick={duplicateElement} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500" title="Duplicate"><Copy size={14} /></button>
                <button onClick={bringToFront} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500" title="Bring to Front"><Layers size={14} /></button>
                <button onClick={(e) => deleteElement(e, selectedId)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 w-full h-full cursor-crosshair relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:32px_32px] bg-white"
        onMouseDown={addElement}
      >
        {isGeneratingImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-[60]">
            <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-[40px] shadow-2xl">
               <Sparkles className="text-purple-600 animate-pulse" size={48} />
               <span className="font-bold text-gray-900">AI Painting...</span>
            </div>
          </div>
        )}

        {isAiPromptOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-md">
              <h3 className="font-bold text-gray-900 mb-2">Generate Visual</h3>
              <textarea
                autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-100 outline-none h-32 resize-none mb-4"
                placeholder="Describe your image..."
                value={aiPromptValue}
                onChange={(e) => setAiPromptValue(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => setIsAiPromptOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-400">Cancel</button>
                <button onClick={handleAiGenerate} className="flex-2 bg-black text-white px-8 py-3 rounded-2xl font-bold">Generate</button>
              </div>
            </div>
          </div>
        )}

        {elements.map(el => (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
            className={`absolute shadow-md group transition-all ${el.type === 'circle' ? 'rounded-full' : 'rounded-2xl'} ${selectedId === el.id ? 'ring-2 ring-blue-500 z-40' : 'hover:ring-2 hover:ring-blue-400/50'}`}
            style={{ 
              left: el.x, 
              top: el.y, 
              width: el.width, 
              height: el.height, 
              backgroundColor: el.color,
              zIndex: draggingId === el.id || resizingId === el.id ? 100 : undefined
            }}
          >
            {/* Resize Handles */}
            {selectedId === el.id && (
              <>
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-left')} className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-50 shadow-sm" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-right')} className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-50 shadow-sm" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-left')} className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-50 shadow-sm" />
                <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-right')} className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-50 shadow-sm" />
              </>
            )}
            
            <div className="w-full h-full overflow-hidden relative rounded-inherit">
              {el.type === 'image' && el.content ? (
                <img src={el.content} className="w-full h-full object-contain p-4 pointer-events-none" />
              ) : (el.type === 'note' || el.type === 'text') ? (
                <textarea
                  className="w-full h-full bg-transparent resize-none outline-none p-4 text-sm font-semibold text-gray-800 leading-relaxed placeholder-gray-400"
                  value={el.content}
                  placeholder={el.type === 'text' ? "Enter text..." : "Write something..."}
                  onChange={(e) => {
                     const newEls = elements.map(item => item.id === el.id ? { ...item, content: e.target.value } : item);
                     setElements(newEls);
                     updateWhiteboard(activeBoardId!, newEls);
                  }}
                  onMouseDown={e => e.stopPropagation()}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Whiteboard;
