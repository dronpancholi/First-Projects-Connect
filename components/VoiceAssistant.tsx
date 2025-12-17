
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { X, Mic, MicOff, Waves, Volume2, AlertCircle, PlayCircle, Sparkles, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, Priority } from '../types.ts';
import * as GeminiService from '../services/geminiService.ts';

const encode = (bytes: Uint8Array) => {
  let b = '';
  for (let i = 0; i < bytes.byteLength; i++) b += String.fromCharCode(bytes[i]);
  return btoa(b);
};

const decode = (base64: string) => {
  const b = atob(base64);
  const bytes = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) bytes[i] = b.charCodeAt(i);
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, rate: number, channels: number): Promise<AudioBuffer> {
  const i16 = new Int16Array(data.buffer);
  const frames = i16.length / channels;
  const buffer = ctx.createBuffer(channels, frames, rate);
  for (let c = 0; c < channels; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < frames; i++) d[i] = i16[i * channels + c] / 32768.0;
  }
  return buffer;
}

const tools: FunctionDeclaration[] = [
  {
    name: 'createProject',
    parameters: {
      type: Type.OBJECT,
      properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
      required: ['title', 'description']
    }
  },
  {
    name: 'deleteProject',
    parameters: {
      type: Type.OBJECT,
      properties: { title: { type: Type.STRING } },
      required: ['title']
    }
  },
  {
    name: 'getWorkspaceOverview',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'createTask',
    parameters: {
      type: Type.OBJECT,
      properties: { 
        projectTitle: { type: Type.STRING }, 
        taskTitle: { type: Type.STRING }, 
        priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] } 
      },
      required: ['projectTitle', 'taskTitle']
    }
  },
  {
    name: 'createMindMap',
    parameters: {
      type: Type.OBJECT,
      properties: { 
        title: { type: Type.STRING }, 
        description: { type: Type.STRING } 
      },
      required: ['title', 'description']
    }
  },
  {
    name: 'updateTaskStatus',
    parameters: {
      type: Type.OBJECT,
      properties: { 
        taskTitle: { type: Type.STRING }, 
        status: { type: Type.STRING, enum: ['Pending', 'In Progress', 'Done'] } 
      },
      required: ['taskTitle', 'status']
    }
  },
  {
    name: 'deleteTask',
    parameters: {
      type: Type.OBJECT,
      properties: { taskTitle: { type: Type.STRING } },
      required: ['taskTitle']
    }
  },
  {
    name: 'createNote',
    parameters: {
      type: Type.OBJECT,
      properties: { 
        title: { type: Type.STRING }, 
        content: { type: Type.STRING },
        projectTitle: { type: Type.STRING }
      },
      required: ['title', 'content']
    }
  },
  {
    name: 'deleteNote',
    parameters: {
      type: Type.OBJECT,
      properties: { title: { type: Type.STRING } },
      required: ['title']
    }
  },
  {
    name: 'getProjectDetails',
    parameters: {
      type: Type.OBJECT,
      properties: { title: { type: Type.STRING } },
      required: ['title']
    }
  }
];

const VoiceAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    projects, tasks, notes, whiteboards,
    addProject, deleteProject, 
    addTask, updateTask, deleteTask: storeDeleteTask,
    addNote, updateNote, deleteNote: storeDeleteNote,
    addWhiteboard
  } = useStore();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const outCtx = useRef<AudioContext | null>(null);
  const inCtx = useRef<AudioContext | null>(null);
  const nextTime = useRef(0);
  const session = useRef<any>(null);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsConnecting(true);
      setError(null);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      outCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const src = inCtx.current!.createMediaStreamSource(stream);
            const proc = inCtx.current!.createScriptProcessor(4096, 1, 1);
            proc.onaudioprocess = (e) => {
              const d = e.inputBuffer.getChannelData(0);
              const i16 = new Int16Array(d.length);
              for (let i = 0; i < d.length; i++) i16[i] = d[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(i16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            src.connect(proc);
            proc.connect(inCtx.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                let res: any = "ok";
                const findProject = (title: string) => projects.find(p => p.title.toLowerCase().includes(title.toLowerCase()));
                const findTask = (title: string) => tasks.find(t => t.title.toLowerCase().includes(title.toLowerCase()));
                const findNote = (title: string) => notes.find(n => n.title.toLowerCase().includes(title.toLowerCase()));

                if (fc.name === 'createProject') {
                  await addProject({ title: fc.args.title as string, description: fc.args.description as string, status: ProjectStatus.IDEA, tags: ['voice'] });
                  res = `Created project ${fc.args.title}`;
                } 
                else if (fc.name === 'createMindMap') {
                  const elements = await GeminiService.generateWhiteboardLayout(fc.args.description as string);
                  await addWhiteboard({ title: fc.args.title as string, elements });
                  res = `Generated mind map "${fc.args.title}" with ${elements.length} components.`;
                }
                else if (fc.name === 'deleteProject') {
                  const p = findProject(fc.args.title as string);
                  if (p) { await deleteProject(p.id); res = `Deleted project ${p.title}`; }
                  else res = "Project not found.";
                } 
                else if (fc.name === 'getWorkspaceOverview') {
                  res = `Workspace has ${projects.length} projects, ${tasks.filter(t => t.status !== TaskStatus.DONE).length} pending tasks, and ${notes.length} notes.`;
                }
                else if (fc.name === 'createTask') {
                  const p = findProject(fc.args.projectTitle as string);
                  if (p) {
                    await addTask({ 
                      projectId: p.id, 
                      title: fc.args.taskTitle as string, 
                      status: TaskStatus.PENDING, 
                      priority: (fc.args.priority as Priority) || Priority.MEDIUM 
                    });
                    res = `Added task "${fc.args.taskTitle}" to project "${p.title}"`;
                  } else res = "Project not found.";
                }
                else if (fc.name === 'updateTaskStatus') {
                  const t = findTask(fc.args.taskTitle as string);
                  if (t) {
                    await updateTask(t.id, { status: fc.args.status as TaskStatus });
                    res = `Updated task "${t.title}" status to ${fc.args.status}`;
                  } else res = "Task not found.";
                }
                else if (fc.name === 'deleteTask') {
                  const t = findTask(fc.args.taskTitle as string);
                  if (t) {
                    await storeDeleteTask(t.id);
                    res = `Deleted task "${t.title}"`;
                  } else res = "Task not found.";
                }
                else if (fc.name === 'createNote') {
                  const p = fc.args.projectTitle ? findProject(fc.args.projectTitle as string) : null;
                  await addNote({ 
                    title: fc.args.title as string, 
                    content: fc.args.content as string, 
                    projectId: p?.id 
                  });
                  res = `Created note "${fc.args.title}"${p ? ` linked to project "${p.title}"` : ''}`;
                }
                else if (fc.name === 'deleteNote') {
                  const n = findNote(fc.args.title as string);
                  if (n) {
                    await storeDeleteNote(n.id);
                    res = `Deleted note "${n.title}"`;
                  } else res = "Note not found.";
                }
                else if (fc.name === 'getProjectDetails') {
                  const p = findProject(fc.args.title as string);
                  if (p) {
                    const pTasks = tasks.filter(t => t.projectId === p.id);
                    const pNotes = notes.filter(n => n.projectId === p.id);
                    res = {
                      title: p.title,
                      description: p.description,
                      status: p.status,
                      progress: `${p.progress}%`,
                      taskCount: pTasks.length,
                      completedTasks: pTasks.filter(t => t.status === TaskStatus.DONE).length,
                      noteCount: pNotes.length
                    };
                  } else res = "Project not found.";
                }
                
                sessionPromise.then(s => s.sendToolResponse({ 
                  functionResponses: { id: fc.id, name: fc.name, response: { result: res } } 
                }));
              }
            }

            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const b = msg.serverContent.modelTurn.parts[0].inlineData.data;
              nextTime.current = Math.max(nextTime.current, outCtx.current!.currentTime);
              const buffer = await decodeAudioData(decode(b), outCtx.current!, 24000, 1);
              const node = outCtx.current!.createBufferSource();
              node.buffer = buffer;
              node.connect(outCtx.current!.destination);
              node.onended = () => sources.current.delete(node);
              sources.current.add(node);
              node.start(nextTime.current);
              nextTime.current += buffer.duration;
            }

            if (msg.serverContent?.interrupted) {
              sources.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sources.current.clear();
              nextTime.current = 0;
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => { setError("Connection lost."); setIsActive(false); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: tools }],
          systemInstruction: "You are a professional workspace assistant. You can manage projects, tasks, and notes. You can also generate visual mind maps and architectural diagrams for whiteboards. Be helpful, concise, and professional. Always confirm actions. You can fetch detailed project status reports if asked."
        }
      });
      session.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message || "Mic access denied.");
      setIsConnecting(false);
    }
  };

  useEffect(() => () => { session.current?.close(); outCtx.current?.close(); inCtx.current?.close(); }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in">
      <div className="bg-white/95 w-full max-w-sm rounded-[40px] shadow-2xl p-8 flex flex-col items-center gap-6 border border-white/20">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Visual Workspace AI</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 scale-110 shadow-xl ring-4 ring-blue-100' : 'bg-gray-100 shadow-inner'}`}>
          {isActive ? (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-8 bg-white rounded-full animate-[bounce_1s_infinite_0ms]" />
              <div className="w-1.5 h-12 bg-white rounded-full animate-[bounce_1s_infinite_200ms]" />
              <div className="w-1.5 h-6 bg-white rounded-full animate-[bounce_1s_infinite_400ms]" />
              <div className="w-1.5 h-10 bg-white rounded-full animate-[bounce_1s_infinite_600ms]" />
              <div className="w-1.5 h-7 bg-white rounded-full animate-[bounce_1s_infinite_800ms]" />
            </div>
          ) : isConnecting ? <Loader2 className="animate-spin text-blue-600" size={48} /> : <MicOff className="text-gray-400" size={48} />}
        </div>

        <div className="text-center space-y-2 px-4">
          <h2 className="text-xl font-bold">{isConnecting ? "Waking up..." : isActive ? "Listening..." : "Visual Voice Control"}</h2>
          {error ? <p className="text-red-500 text-xs font-medium">{error}</p> : <p className="text-sm text-gray-500 leading-relaxed">
            {isActive ? "Try: 'Create a mind map for my startup idea'" : "Speak naturally to build your workspace and visuals."}
          </p>}
        </div>

        {!isActive && !isConnecting && (
          <button onClick={startSession} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3">
            <Mic size={20} />
            Start Session
          </button>
        )}
        
        {isActive && (
          <button onClick={() => { session.current?.close(); setIsActive(false); }} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors py-2">
            End Session
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
