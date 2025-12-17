import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Move, MousePointer, Type, Square, Circle as CircleIcon, StickyNote, X, Trash2 } from 'lucide-react';
import { CanvasElement } from '../types';

const Whiteboard: React.FC = () => {
  const { whiteboards, addWhiteboard, updateWhiteboard } = useStore();
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  
  // Create default board if none
  useEffect(() => {
    if (whiteboards.length === 0 && !activeBoardId) {
      // Don't auto create for now, show empty state
    } else if (whiteboards.length > 0 && !activeBoardId) {
      setActiveBoardId(whiteboards[0].id);
    }
  }, [whiteboards]);

  const activeBoard = whiteboards.find(w => w.id === activeBoardId);

  // Interaction State
  const [tool, setTool] = useState<'select' | 'note' | 'text' | 'rect' | 'circle'>('select');
  const [elements, setElements] = useState<CanvasElement[]>(activeBoard?.elements || []);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Update local elements when board changes
  useEffect(() => {
    if (activeBoard) setElements(activeBoard.elements);
  }, [activeBoard]);

  const handleCreateBoard = async () => {
    const title = prompt("Whiteboard Name:");
    if (title) {
      await addWhiteboard({ title, elements: [] });
    }
  };

  const handleSave = async () => {
    if (activeBoardId) {
      await updateWhiteboard(activeBoardId, elements);
    }
  };

  const addElement = (e: React.MouseEvent) => {
    if (tool === 'select') return;
    
    // Calculate position relative to container
    // For V1, simple click to add at predefined spot or mouse pos
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newEl: CanvasElement = {
      id: crypto.randomUUID(),
      type: tool,
      x: x - 50, // Center
      y: y - 50,
      content: tool === 'note' ? 'New Note' : tool === 'text' ? 'Type here' : undefined,
      color: tool === 'note' ? '#FEF08A' : tool === 'rect' ? '#E5E7EB' : '#BFDBFE',
      width: 150,
      height: tool === 'text' ? 40 : 150
    };

    const newElements = [...elements, newEl];
    setElements(newElements);
    setTool('select'); // Reset tool
    if (activeBoardId) updateWhiteboard(activeBoardId, newElements);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    const el = elements.find(el => el.id === id);
    if (el) {
      setDraggingId(id);
      setDragOffset({
        x: e.clientX - el.x,
        y: e.clientY - el.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setElements(prev => prev.map(el => 
        el.id === draggingId ? { ...el, x: newX, y: newY } : el
      ));
    }
  };

  const handleMouseUp = () => {
    if (draggingId) {
      // Autosave on drag end
      if (activeBoardId) updateWhiteboard(activeBoardId, elements);
      setDraggingId(null);
    }
  };

  const deleteElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newEls = elements.filter(el => el.id !== id);
    setElements(newEls);
    if (activeBoardId) updateWhiteboard(activeBoardId, newEls);
  };

  const updateContent = (id: string, content: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, content } : el));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 p-1.5 flex items-center gap-1 z-20">
        <button onClick={() => setTool('select')} className={`p-2 rounded-full transition-colors ${tool === 'select' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`} title="Select">
          <MousePointer size={18} />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <button onClick={() => setTool('note')} className={`p-2 rounded-full transition-colors ${tool === 'note' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100 text-gray-500'}`} title="Sticky Note">
          <StickyNote size={18} />
        </button>
        <button onClick={() => setTool('text')} className={`p-2 rounded-full transition-colors ${tool === 'text' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100 text-gray-500'}`} title="Text">
          <Type size={18} />
        </button>
        <button onClick={() => setTool('rect')} className={`p-2 rounded-full transition-colors ${tool === 'rect' ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 text-gray-500'}`} title="Rectangle">
          <Square size={18} />
        </button>
        <button onClick={() => setTool('circle')} className={`p-2 rounded-full transition-colors ${tool === 'circle' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100 text-gray-500'}`} title="Circle">
          <CircleIcon size={18} />
        </button>
      </div>

      {/* Board Selector */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
         <select 
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none shadow-sm"
            value={activeBoardId || ''}
            onChange={(e) => setActiveBoardId(e.target.value)}
          >
            <option value="" disabled>Select Board</option>
            {whiteboards.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
         </select>
         <button onClick={handleCreateBoard} className="bg-black text-white p-2 rounded-lg shadow-sm hover:opacity-80">
            <Plus size={18} />
         </button>
      </div>

      {/* Canvas Area */}
      <div 
        className="flex-1 w-full h-full cursor-crosshair overflow-hidden relative"
        onClick={addElement}
        style={{ backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        {!activeBoardId && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <p>Select or create a whiteboard to start.</p>
            </div>
          </div>
        )}

        {elements.map(el => (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
            className="absolute shadow-sm group cursor-move"
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              backgroundColor: el.color || 'white',
              borderRadius: el.type === 'circle' ? '50%' : '8px',
              border: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
          >
            {/* Delete Button */}
            <button 
              onClick={(e) => deleteElement(e, el.id)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-red-500 hover:bg-red-50"
            >
              <X size={12} />
            </button>

            {/* Content Editable */}
            {(el.type === 'note' || el.type === 'text') && (
              <textarea
                className="w-full h-full bg-transparent resize-none outline-none text-center text-sm font-medium overflow-hidden"
                value={el.content}
                onChange={(e) => updateContent(el.id, e.target.value)}
                onMouseDown={e => e.stopPropagation()} // Allow text selection
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Whiteboard;
