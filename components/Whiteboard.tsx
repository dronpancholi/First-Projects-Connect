
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Plus, MousePointer2, Type, Square, Circle as CircleIcon, 
  StickyNote, X, Wand2, Trash2, Image as ImageIcon, 
  Palette, Sparkles, Send, Layers, Copy, Trash, PenTool, 
  LayoutGrid, Loader2, Maximize, ZoomIn, ZoomOut, Move,
  Hand, BoxSelect, Network, ArrowRightCircle, Info, Link as LinkIcon,
  MoveRight, Scissors, Share2, MoveUpRight, Download, Check
} from 'lucide-react';
import { CanvasElement } from '../types';
import * as GeminiService from '../services/geminiService';

const COLORS = [
  '#FFFFFF', '#F8FAFC', '#EFF6FF', '#ECFDF5', '#FFFBEB', 
  '#FEF2F2', '#F5F3FF', '#FDF2F8', '#FFF7ED', '#0F172A', '#4f46e5'
];

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ExportConfig {
  format: 'png' | 'jpg';
  scale: number;
  transparent: boolean;
}

const Whiteboard: React.FC = () => {
  const { whiteboards, addWhiteboard, updateWhiteboard, deleteWhiteboard } = useStore();
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  
  // High-Performance Spatial State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [tool, setTool] = useState<'select' | 'pan' | 'note' | 'text' | 'rect' | 'circle' | 'image' | 'connection'>('select');
  
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draggingIds, setDraggingIds] = useState<string[]>([]);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);
  const [linkingToPos, setLinkingToPos] = useState<{ x: number, y: number } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [aiPromptValue, setAiPromptValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<string>('');
  const [isAiMindMapPromptOpen, setIsAiMindMapPromptOpen] = useState(false);

  // Export State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'png',
    scale: 2,
    transparent: true
  });

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
    setSelectedIds([]);
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
    if (e.target !== containerRef.current || tool === 'select' || tool === 'pan' || tool === 'connection') return;
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
    setSelectedIds([newEl.id]);
    setTool('select');
    saveElements(next);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (tool === 'connection') {
      setLinkingFromId(id);
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      setLinkingToPos({ x, y });
      return;
    }

    if (tool === 'pan') return;
    
    const isShiftPressed = e.shiftKey;
    if (isShiftPressed) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(it => it !== id) : [...prev, id]);
    } else {
      if (!selectedIds.includes(id)) {
        setSelectedIds([id]);
      }
    }

    const el = elements.find(it => it.id === id);
    if (el && el.type !== 'connection') { 
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      setDraggingIds(isShiftPressed ? [...selectedIds, id] : (selectedIds.includes(id) ? selectedIds : [id]));
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

  const deleteElements = (ids: string[]) => {
    const next = elements.filter(el => 
      !ids.includes(el.id) && 
      !ids.includes(el.fromId || '') && 
      !ids.includes(el.toId || '')
    ).map(el => ids.includes(el.parentId || '') ? { ...el, parentId: undefined } : el);
    setElements(next);
    setSelectedIds([]);
    saveElements(next);
  };

  const handleConnectSelected = () => {
    if (selectedIds.length < 2) return;
    const newConnections: CanvasElement[] = [];
    for (let i = 0; i < selectedIds.length - 1; i++) {
      newConnections.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'connection',
        fromId: selectedIds[i],
        toId: selectedIds[i+1],
        x: 0, y: 0,
        color: '#4f46e5'
      });
    }
    const next = [...elements, ...newConnections];
    setElements(next);
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
    } else if (draggingIds.length > 0) {
      setElements(prev => prev.map(el => {
        if (draggingIds.includes(el.id)) {
          return { ...el, x: el.x + e.movementX / transform.scale, y: el.y + e.movementY / transform.scale };
        }
        return el;
      }));
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
  }, [draggingIds, resizingId, resizeHandle, linkingFromId, dragOffset, elements, screenToCanvas, tool, isPanning, transform.scale]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (linkingFromId) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const target = elements.find(el => 
        el.id !== linkingFromId && 
        el.type !== 'connection' &&
        x >= el.x && x <= el.x + (el.width || 200) &&
        y >= el.y && y <= el.y + (el.height || 100)
      );
      if (target) {
        const newConnection: CanvasElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'connection',
          fromId: linkingFromId,
          toId: target.id,
          x: 0, y: 0,
          color: '#4f46e5'
        };
        const next = [...elements, newConnection];
        setElements(next);
        saveElements(next);
      }
      setLinkingFromId(null);
      setLinkingToPos(null);
    } else if (draggingIds.length > 0 || resizingId) {
      saveElements(elements);
    }
    setDraggingIds([]);
    setResizingId(null);
    setResizeHandle(null);
    setIsPanning(false);
  }, [linkingFromId, draggingIds, resizingId, elements, screenToCanvas, saveElements]);

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

  // --- Export Logic ---
  const handleExportAction = async () => {
    if (!canvasLayerRef.current || elements.length === 0) return;
    setIsExporting(true);

    try {
      // 1. Determine bounding box of all elements
      const padding = 100;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      elements.forEach(el => {
        if (el.type === 'connection') return; // connections depend on other elements
        const w = el.width || 200;
        const h = el.height || 100;
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + w);
        maxY = Math.max(maxY, el.y + h);
      });

      if (minX === Infinity) { minX = 0; minY = 0; maxX = 800; maxY = 600; }

      const exportWidth = (maxX - minX) + (padding * 2);
      const exportHeight = (maxY - minY) + (padding * 2);

      // 2. Clone the content and adjust positions
      const originalNode = canvasLayerRef.current;
      const clone = originalNode.cloneNode(true) as HTMLDivElement;
      
      // Fix: Textareas values aren't cloned in innerHTML usually, we must copy them manually
      const originalTextareas = originalNode.querySelectorAll('textarea');
      const clonedTextareas = clone.querySelectorAll('textarea');
      originalTextareas.forEach((ta, i) => {
        clonedTextareas[i].value = ta.value;
        clonedTextareas[i].style.height = '100%';
        clonedTextareas[i].setAttribute('readonly', 'true');
      });

      // Adjust clone transform to fit the bounding box
      const viewport = clone.firstChild as HTMLElement;
      viewport.style.transform = `translate(${-minX + padding}px, ${-minY + padding}px) scale(1)`;
      viewport.style.width = `${exportWidth}px`;
      viewport.style.height = `${exportHeight}px`;
      clone.style.width = `${exportWidth}px`;
      clone.style.height = `${exportHeight}px`;
      clone.style.transform = 'none';

      // 3. Inline Styles
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(s => s.outerHTML)
        .join('\n');

      // 4. Create the foreignObject SVG
      const svgNamespace = "http://www.w3.org/2000/svg";
      const svgData = `
        <svg xmlns="${svgNamespace}" width="${exportWidth}" height="${exportHeight}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${styles}
              <div style="width: ${exportWidth}px; height: ${exportHeight}px; position: relative; background: ${exportConfig.transparent ? 'transparent' : '#f8fafc'}; overflow: hidden;">
                ${clone.innerHTML}
              </div>
            </div>
          </foreignObject>
        </svg>
      `;

      // 5. Render to Canvas
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = exportWidth * exportConfig.scale;
        canvas.height = exportHeight * exportConfig.scale;
        const ctx = canvas.getContext('2d')!;

        if (!exportConfig.transparent || exportConfig.format === 'jpg') {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.scale(exportConfig.scale, exportConfig.scale);
        ctx.drawImage(img, 0, 0);

        // 6. Download
        const mimeType = exportConfig.format === 'png' ? 'image/png' : 'image/jpeg';
        const downloadUrl = canvas.toDataURL(mimeType, 0.9);
        const link = document.createElement('a');
        link.download = `connect-os-whiteboard-${Date.now()}.${exportConfig.format}`;
        link.href = downloadUrl;
        link.click();

        URL.revokeObjectURL(url);
        setIsExporting(false);
        setIsExportOpen(false);
      };

      img.onerror = (e) => {
        console.error("Export failed during SVG rendering", e);
        setIsExporting(false);
      };

      img.src = url;

    } catch (err) {
      console.error("Export engine failure", err);
      setIsExporting(false);
    }
  };

  const renderConnections = useMemo(() => {
    return (
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        <g>
          {elements.map(el => {
            let from, to;
            let color = '#94A3B8';
            let opacity = '0.4';
            let strokeWidth = '2.5';

            if (el.type === 'connection' && el.fromId && el.toId) {
              from = elements.find(it => it.id === el.fromId);
              to = elements.find(it => it.id === el.toId);
              color = el.color || '#4f46e5';
              opacity = '0.7';
              strokeWidth = '3';
            } else if (el.parentId) {
              from = elements.find(p => p.id === el.parentId);
              to = el;
            } else {
              return null;
            }

            if (!from || !to) return null;

            const sX = from.x + (from.width || 200) / 2;
            const sY = from.y + (from.height || 100) / 2;
            const eX = to.x + (to.width || 200) / 2;
            const eY = to.y + (to.height || 100) / 2;
            const dx = eX - sX;
            const isSelected = selectedIds.includes(el.id);

            const pathData = `M ${sX} ${sY} C ${sX + dx/2} ${sY}, ${sX + dx/2} ${eY}, ${eX} ${eY}`;

            return (
              <g key={`${el.id}-connection`} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedIds([el.id]); }}>
                <path d={pathData} fill="none" stroke="transparent" strokeWidth="20" />
                <path 
                  d={pathData} 
                  fill="none" 
                  stroke={isSelected ? '#4f46e5' : color} 
                  strokeWidth={isSelected ? '4' : strokeWidth} 
                  strokeOpacity={isSelected ? '1' : opacity}
                  markerEnd="url(#arrow)" 
                  style={{ color: isSelected ? '#4f46e5' : color }}
                />
              </g>
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
              return <path d={`M ${sX} ${sY} C ${sX + dx/2} ${sY}, ${sX + dx/2} ${eY}, ${eX} ${eY}`} fill="none" stroke="#4f46e5" strokeWidth="3" strokeDasharray="5,5" markerEnd="url(#arrow)" style={{ color: '#4f46e5' }} />;
            })()}
          </g>
        )}
      </svg>
    );
  }, [elements, linkingFromId, linkingToPos, selectedIds]);

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] relative overflow-hidden select-none font-sans">
      <style>{`
        .spatial-grid { background-image: radial-gradient(#e2e8f0 1.5px, transparent 1.5px); background-size: 40px 40px; }
        .pro-node { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: grab; }
        .pro-node:active { cursor: grabbing; }
        .diamond-shape { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
        .triangle-shape { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
        .node-selected { ring: 4px; ring-color: #4f46e5; }
        .glass-hud { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); }
      `}</style>

      {/* Floating Tactical HUD */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4 pointer-events-none">
        <div className="pointer-events-auto glass-hud border border-slate-200 shadow-2xl rounded-[2.5rem] p-2 flex items-center gap-1">
          <div className="flex items-center gap-3 px-6 border-r border-slate-200 mr-2">
             <Network size={16} className="text-emerald-500" />
             <select className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-700 focus:ring-0 cursor-pointer min-w-[160px]" value={activeBoardId || ''} onChange={(e) => setActiveBoardId(e.target.value)}>
               {whiteboards.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
             </select>
          </div>

          {[
            { id: 'select', icon: <MousePointer2 size={18} /> },
            { id: 'pan', icon: <Hand size={18} /> },
            { id: 'connection', icon: <MoveUpRight size={18} /> },
            { id: 'note', icon: <StickyNote size={18} /> },
            { id: 'text', icon: <Type size={18} /> },
            { id: 'rect', icon: <Square size={18} /> },
            { id: 'circle', icon: <CircleIcon size={18} /> },
          ].map(t => (
            <button key={t.id} title={t.id.toUpperCase()} onClick={() => { setTool(t.id as any); setSelectedIds([]); }} className={`p-3.5 rounded-2xl transition-all btn-tactile ${tool === t.id ? 'bg-emerald-500 text-midnight shadow-xl' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}>
              {t.icon}
            </button>
          ))}

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <button onClick={() => setIsAiMindMapPromptOpen(true)} className="p-3.5 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all group flex items-center gap-3 px-6 shadow-xl">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Architect</span>
          </button>

          <button onClick={() => setIsExportOpen(true)} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition-all group flex items-center gap-3 px-6 shadow-sm ml-2">
            <Download size={18} className="text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Export</span>
          </button>
        </div>
      </div>

      {/* View Controls */}
      <div className="absolute bottom-10 right-10 z-[100] flex flex-col gap-4">
        <div className="glass-hud border border-slate-200 p-2 rounded-3xl shadow-2xl flex flex-col">
          <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(p.scale + 0.1, 5) }))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors"><ZoomIn size={20}/></button>
          <div className="text-[10px] font-black text-slate-400 text-center py-2">{Math.round(transform.scale * 100)}%</div>
          <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(p.scale - 0.1, 0.1) }))} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors"><ZoomOut size={20}/></button>
        </div>
        <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="glass-hud border border-slate-200 p-4 rounded-[1.5rem] shadow-2xl text-slate-400 hover:text-emerald-600 transition-colors"><Maximize size={20}/></button>
      </div>

      <div className="absolute top-8 left-8 z-[100] flex gap-3">
         <button onClick={() => { if(activeBoardId && confirm('Purge workspace?')) deleteWhiteboard(activeBoardId) }} className="glass-hud border border-slate-200 p-4 rounded-2xl shadow-xl text-slate-300 hover:text-rose-500 transition-all"><Trash size={20}/></button>
         <button onClick={() => addWhiteboard({ title: 'New Visualizer', elements: [] })} className="glass-hud border border-slate-200 p-4 rounded-2xl shadow-xl text-slate-300 hover:text-emerald-600 transition-all"><Plus size={20}/></button>
      </div>

      {/* Node Context Bar */}
      {selectedIds.length > 0 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-6 duration-300 pointer-events-none">
          <div className="pointer-events-auto bg-slate-900 text-white px-8 py-4 rounded-[3rem] shadow-2xl flex items-center gap-8 border border-white/10 ring-1 ring-slate-800">
             <div className="flex gap-2">
               {COLORS.map(c => (
                 <button key={c} onClick={() => { const n = elements.map(it => selectedIds.includes(it.id) ? {...it, color: c} : it); setElements(n); saveElements(n); }} className={`w-7 h-7 rounded-full border border-white/10 transition-all hover:scale-125 ${elements.find(e => selectedIds.includes(e.id))?.color === c ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-900 scale-110' : ''}`} style={{ backgroundColor: c }} />
               ))}
             </div>
             <div className="w-px h-6 bg-slate-800" />
             <div className="flex items-center gap-5">
                {selectedIds.length >= 2 && (
                  <button onClick={handleConnectSelected} className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest hover:text-emerald-300">
                    <MoveUpRight size={16} /> Link Selected
                  </button>
                )}
                <button onClick={() => deleteElements(selectedIds)} className="flex items-center gap-2 text-rose-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-300">
                  <Trash2 size={16} /> {selectedIds.length > 1 ? `Remove ${selectedIds.length}` : 'Remove'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Infinite Drawing Engine */}
      <div 
        ref={containerRef} 
        onWheel={onWheel} 
        onMouseDown={(e) => { 
          if (tool === 'pan' || (e.button === 0 && e.target === containerRef.current)) setIsPanning(true); 
          if (e.target === containerRef.current) setSelectedIds([]); 
          addElement(e); 
        }} 
        className={`flex-1 overflow-hidden relative spatial-grid bg-slate-50 transition-all cursor-${tool === 'pan' || isPanning ? 'grabbing' : tool === 'select' ? 'default' : 'crosshair'}`}
      >
        <div 
          ref={canvasLayerRef}
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', transition: isPanning ? 'none' : 'transform 0.1s ease-out' }} 
          className="absolute inset-0 pointer-events-none"
        >
          {renderConnections}
          {elements.map(el => {
            if (el.type === 'connection') return null;
            const isSelected = selectedIds.includes(el.id);
            return (
              <div key={el.id} onMouseDown={(e) => handleMouseDown(e, el.id)} className={`absolute group pro-node pointer-events-auto overflow-visible shadow-lg bg-white ${el.type === 'circle' ? 'rounded-full' : 'rounded-3xl'} ${isSelected ? 'ring-4 ring-emerald-500 shadow-2xl z-50' : 'border border-slate-200'} ${el.type === 'diamond' ? 'diamond-shape' : ''} ${el.type === 'triangle' ? 'triangle-shape' : ''}`} style={{ left: el.x, top: el.y, width: el.width || 200, height: el.height || 100, backgroundColor: el.color || '#FFFFFF' }}>
                {isSelected && selectedIds.length === 1 && (
                  <>
                    <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-left')} className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nwse-resize z-[60] shadow-md" />
                    <div onMouseDown={(e) => handleResizeStart(e, el.id, 'top-right')} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nesw-resize z-[60] shadow-md" />
                    <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-left')} className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nesw-resize z-[60] shadow-md" />
                    <div onMouseDown={(e) => handleResizeStart(e, el.id, 'bottom-right')} className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nwse-resize z-[60] shadow-md" />
                    <div onMouseDown={(e) => handleLinkStart(e, el.id)} title="CONNECT" className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 bg-white border-2 border-emerald-600 rounded-full cursor-crosshair z-[60] shadow-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"><MoveUpRight size={14} strokeWidth={3} /></div>
                  </>
                )}
                <div className={`w-full h-full flex flex-col p-6 relative ${el.type === 'circle' ? 'rounded-full text-center items-center justify-center' : ''} ${el.type === 'diamond' ? 'items-center justify-center p-8' : ''}`}>
                  <textarea 
                    className={`w-full h-full bg-transparent outline-none resize-none text-base font-black tracking-tight scrollbar-hide text-slate-900 placeholder:text-slate-300 ${ (el.type === 'circle' || el.type === 'diamond' || el.type === 'triangle' ) ? 'text-center' : '' }`} 
                    value={el.content} 
                    placeholder="Enter insight..." 
                    onChange={(e) => { const n = elements.map(it => it.id === el.id ? { ...it, content: e.target.value } : it); setElements(n); saveElements(n); }} 
                    onMouseDown={e => e.stopPropagation()} 
                  />
                </div>
              </div>
            );
          })}
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

      {/* --- Architect Interface --- */}
      {isAiMindMapPromptOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-white/20 w-full max-w-2xl transform transition-all">
             <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-100">
                   <Sparkles size={40} />
                </div>
                <div>
                   <h3 className="font-black text-4xl tracking-tighter text-slate-900">AI Architect</h3>
                   <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">Neural Visualization Engine</p>
                </div>
             </div>
             <textarea autoFocus className="w-full bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-10 text-xl font-black text-slate-900 focus:ring-8 focus:ring-emerald-50 focus:border-emerald-600 outline-none h-64 resize-none mb-12 shadow-inner placeholder:text-slate-300" placeholder="Describe the logical architecture or process flow..." value={aiPromptValue} onChange={(e) => setAiPromptValue(e.target.value)} />
             <div className="flex gap-8">
               <button onClick={() => setIsAiMindMapPromptOpen(false)} className="flex-1 py-6 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Abort</button>
               <button onClick={handleAiArchitect} disabled={!aiPromptValue.trim() || isGenerating} className="flex-[2] bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4">
                 {isGenerating ? <Loader2 className="animate-spin" size={24}/> : <ArrowRightCircle size={24}/>}
                 Synthesize Logic
               </button>
             </div>
          </div>
        </div>
      )}

      {/* --- Export Modal --- */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-white/20 w-full max-w-xl">
             <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-500 rounded-2xl text-midnight shadow-lg shadow-emerald-100">
                    <Download size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl tracking-tighter text-slate-900">Export Suite</h3>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">High-Fidelity Capturing</p>
                  </div>
                </div>
                <button onClick={() => setIsExportOpen(false)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
             </div>

             <div className="space-y-8">
                {/* Format Toggle */}
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image Format</label>
                   <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                      {(['png', 'jpg'] as const).map(fmt => (
                        <button key={fmt} onClick={() => setExportConfig(p => ({ ...p, format: fmt }))} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${exportConfig.format === fmt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                           {fmt}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Resolution Scale */}
                <div className="space-y-3">
                   <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Scale</label>
                      <span className="text-xs font-black text-emerald-600">{exportConfig.scale}x</span>
                   </div>
                   <input 
                      type="range" min="1" max="4" step="1" 
                      className="w-full accent-emerald-500 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" 
                      value={exportConfig.scale} 
                      onChange={e => setExportConfig(p => ({ ...p, scale: parseInt(e.target.value) }))} 
                   />
                   <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                      <span>Standard</span>
                      <span>HD</span>
                      <span>Print</span>
                      <span>Ultra</span>
                   </div>
                </div>

                {/* Transparency Toggle */}
                {exportConfig.format === 'png' && (
                  <button 
                    onClick={() => setExportConfig(p => ({ ...p, transparent: !p.transparent }))}
                    className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${exportConfig.transparent ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-300'}`}>
                          {exportConfig.transparent && <Check size={14} strokeWidth={4} />}
                       </div>
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Transparent Background</span>
                    </div>
                    <Info size={14} className="text-slate-300" />
                  </button>
                )}
             </div>

             <button 
                onClick={handleExportAction}
                disabled={isExporting}
                className="w-full mt-10 bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
             >
                {isExporting ? <Loader2 className="animate-spin" size={24}/> : <Download size={20}/>}
                {isExporting ? 'Capturing Layer...' : 'Generate Asset'}
             </button>
          </div>
        </div>
      )}

      {/* Synthesis State */}
      {isGenerating && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-white/60 backdrop-blur-3xl animate-in fade-in">
           <div className="flex flex-col items-center">
              <div className="relative mb-10">
                 <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-30 animate-pulse" />
                 <Loader2 size={80} className="text-emerald-600 animate-spin" />
              </div>
              <h4 className="font-black text-3xl text-slate-900 uppercase tracking-tighter">{genStatus || 'Processing...'}</h4>
           </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;
