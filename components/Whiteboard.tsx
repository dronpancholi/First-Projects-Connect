
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
// Added Layout icon to imports from lucide-react to fix "Cannot find name 'Layout'" error
import { Plus, MousePointer, Type, Square, Circle as CircleIcon, StickyNote, X, Wand2, Trash2, Image as ImageIcon, Save, Layout } from 'lucide-react';
import { CanvasElement } from '../types';
import * as GeminiService from '../services/geminiService';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15);
};

const Whiteboard: React.FC = () => {
  const { whiteboards, addWhiteboard, updateWhiteboard } = useStore();
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<'select' | 'note' | 'text' | 'rect' | 'circle' | 'image'>('select');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (whiteboards.length > 0 && !activeBoardId) setActiveBoardId(whiteboards[0].id);
  }, [whiteboards]);

  useEffect(() => {
    const board = whiteboards.find(w => w.id === activeBoardId);
    if (board) setElements(board.elements || []);
    else setElements([]);
  }, [activeBoardId, whiteboards]);

  const addElement = async (e: React.MouseEvent) => {
    // Only add if clicking directly on the canvas background
    if (tool === 'select' || !activeBoardId || !containerRef.current || e.target !== containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let content: string | undefined = undefined;
    let color = '#E5E7EB';
    let width = 150;
    let height = 150;

    if (tool === 'image') {
      const prompt = window.prompt("AI Image Prompt:");
      if (!prompt) return;
      setIsGeneratingImage(true);
      const dataUrl = await GeminiService.generateImageForWhiteboard(prompt);
      setIsGeneratingImage(false);
      if (!dataUrl) return;
      content = dataUrl;
      width = 250;
      height = 250;
    } else if (tool === 'note') {
      content = 'Sticky Note';
      color = '#FEF08A';
    } else if (tool === 'text') {
      content = 'Enter text...';
      height = 60;
      color = 'transparent';
    }

    const newEl: CanvasElement = {
      id: generateId(),
      type: tool === 'image' ? 'note' : tool as any,
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
    updateWhiteboard(activeBoardId, newElements);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    const el = elements.find(el => el.id === id);
    if (el) {
      setDraggingId(id);
      setDragOffset({ x: e.clientX - el.x, y: e.clientY - el.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setElements(prev => prev.map(el => el.id === draggingId ? { ...el, x: newX, y: newY } : el));
    }
  };

  const handleMouseUp = () => {
    if (draggingId && activeBoardId) {
      updateWhiteboard(activeBoardId, elements);
      setDraggingId(null);
    }
  };

  const deleteElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newEls = elements.filter(el => el.id !== id);
    setElements(newEls);
    if (activeBoardId) updateWhiteboard(activeBoardId, newEls);
  };

  const clearCanvas = () => {
    if (activeBoardId && confirm("Clear entire canvas?")) {
      setElements([]);
      updateWhiteboard(activeBoardId, []);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative overflow-hidden select-none">
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
             title="New Board"
           >
             <Plus size={18} />
           </button>
           {activeBoardId && (
             <button onClick={clearCanvas} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors" title="Clear Canvas">
               <Trash2 size={18} />
             </button>
           )}
        </div>

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
      </div>

      <div 
        ref={containerRef}
        className="flex-1 w-full h-full cursor-crosshair relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:32px_32px] bg-white"
        onMouseMove={handleMouseMove} 
        onMouseUp={handleMouseUp}
        onMouseDown={addElement}
      >
        {!activeBoardId && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-12 bg-white/80 backdrop-blur rounded-[32px] border border-gray-100 shadow-2xl max-w-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Layout size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Creative Canvas</h2>
              <p className="text-gray-500 mb-8">Choose a board or create a new one to start brainstorming visually.</p>
              <button 
                onClick={() => addWhiteboard({ title: `Board ${whiteboards.length + 1}`, elements: [] })}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> New Whiteboard
              </button>
            </div>
          </div>
        )}

        {isGeneratingImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-[60]">
            <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100">
               <div className="relative">
                 <Wand2 className="text-purple-600 animate-pulse" size={48} />
                 <div className="absolute inset-0 animate-spin border-2 border-purple-200 border-t-purple-600 rounded-full scale-150" />
               </div>
               <span className="font-bold text-gray-900 tracking-tight">AI Painting...</span>
            </div>
          </div>
        )}

        {elements.map(el => (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
            className={`absolute shadow-lg group hover:ring-2 hover:ring-blue-400/50 transition-shadow ${el.type === 'circle' ? 'rounded-full' : 'rounded-2xl'} overflow-hidden bg-white border border-gray-100`}
            style={{ 
              left: el.x, 
              top: el.y, 
              width: el.width, 
              height: el.height, 
              backgroundColor: el.color,
              zIndex: draggingId === el.id ? 50 : 10
            }}
          >
            <button 
              onClick={(e) => deleteElement(e, el.id)} 
              className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-sm text-red-500 hover:bg-red-50 z-20 transition-all"
            >
              <X size={14} />
            </button>
            
            {el.content?.startsWith('data:image') ? (
              <img src={el.content} className="w-full h-full object-contain p-4 pointer-events-none select-none" />
            ) : (el.type === 'note' || el.type === 'text') && (
              <textarea
                className={`w-full h-full bg-transparent resize-none outline-none p-5 text-sm font-semibold text-gray-800 leading-relaxed ${el.type === 'text' ? 'placeholder-gray-300' : ''}`}
                value={el.content}
                placeholder={el.type === 'text' ? "Enter text..." : ""}
                onChange={(e) => {
                   const newEls = elements.map(item => item.id === el.id ? { ...item, content: e.target.value } : item);
                   setElements(newEls);
                   updateWhiteboard(activeBoardId!, newEls);
                }}
                onMouseDown={e => e.stopPropagation()}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Whiteboard;
