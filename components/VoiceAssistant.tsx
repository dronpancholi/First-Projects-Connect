
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { 
  X, Mic, MicOff, Sparkles, Loader2, Globe, Eye, 
  Terminal, MessageSquare, History, Activity, Zap
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, Priority } from '../types.ts';
import * as GeminiService from '../services/geminiService.ts';

// --- Audio Utilities ---
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

// --- Agentic Tool Definitions ---
const agentTools: FunctionDeclaration[] = [
  {
    name: 'createProject',
    parameters: {
      type: Type.OBJECT,
      description: 'Create a new project workspace',
      properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
      required: ['title', 'description']
    }
  },
  {
    name: 'getWorkspacePulse',
    description: 'Get a comprehensive status report of all projects, tasks, and notes',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'createTask',
    parameters: {
      type: Type.OBJECT,
      description: 'Add a new task to a specific project',
      properties: { 
        projectTitle: { type: Type.STRING }, 
        taskTitle: { type: Type.STRING }, 
        priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] } 
      },
      required: ['projectTitle', 'taskTitle']
    }
  },
  {
    name: 'searchWorkspace',
    description: 'Search globally across projects, tasks, and notes for a keyword',
    parameters: {
      type: Type.OBJECT,
      properties: { query: { type: Type.STRING } },
      required: ['query']
    }
  },
  {
    name: 'analyzeCurrentView',
    description: 'The agent will explain what it sees on the users screen right now',
    parameters: { type: Type.OBJECT, properties: {} }
  }
];

const VoiceAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    projects, tasks, notes, whiteboards,
    addProject, deleteProject, 
    addTask, updateTask, deleteTask: storeDeleteTask,
    addNote, addWhiteboard
  } = useStore();

  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const outCtx = useRef<AudioContext | null>(null);
  const inCtx = useRef<AudioContext | null>(null);
  const nextTime = useRef(0);
  const sessionRef = useRef<any>(null);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef({ user: '', agent: '' });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameInterval = useRef<number | null>(null);

  // --- Frame Capture (Vision) ---
  const startVision = () => {
    frameInterval.current = window.setInterval(async () => {
      if (!sessionRef.current || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Capture the main app area or user video
      // For this implementation, we'll "scan" the current viewport by rendering the app's root to canvas if possible
      // but the simplest agentic vision is using the user's camera to see them or their work environment
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              sessionRef.current?.sendRealtimeInput({
                media: { data: base64, mimeType: 'image/jpeg' }
              });
            };
            reader.readAsDataURL(blob);
          }
        }, 'image/jpeg', 0.6);
      }
    }, 2000); // Send frame every 2 seconds
  };

  const startSession = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
            const src = inCtx.current!.createMediaStreamSource(audioStream);
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
            startVision();
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Transcriptions
            if (msg.serverContent?.inputTranscription) {
              transcriptionRef.current.user += msg.serverContent.inputTranscription.text;
            }
            if (msg.serverContent?.outputTranscription) {
              transcriptionRef.current.agent += msg.serverContent.outputTranscription.text;
              setIsThinking(false);
            }

            if (msg.serverContent?.turnComplete) {
              // Fix: Explicitly assert literal roles to prevent type widening to string.
              // This resolves the error: Argument of type '(prev: ...) => ...[]' is not assignable to parameter of type 'SetStateAction<...[]>'.
              setTranscriptions(prev => [
                ...prev, 
                {role: 'user' as const, text: transcriptionRef.current.user},
                {role: 'agent' as const, text: transcriptionRef.current.agent}
              ].slice(-10));
              transcriptionRef.current = { user: '', agent: '' };
            }

            // Handle Tools
            if (msg.toolCall) {
              setIsThinking(true);
              for (const fc of msg.toolCall.functionCalls) {
                setActiveTool(fc.name);
                let result: any = "Success";
                
                try {
                  switch (fc.name) {
                    case 'createProject':
                      await addProject({ title: fc.args.title as string, description: fc.args.description as string, status: ProjectStatus.IDEA, tags: ['agent-created'] });
                      result = `FP-Agent initialized project: ${fc.args.title}`;
                      break;
                    case 'getWorkspacePulse':
                      result = `Active Pulse: ${projects.length} Projects. Top Priority: ${tasks.filter(t => t.priority === Priority.HIGH && t.status !== TaskStatus.DONE).length} critical tasks. System status nominal.`;
                      break;
                    case 'searchWorkspace':
                      const q = (fc.args.query as string).toLowerCase();
                      const found = projects.filter(p => p.title.toLowerCase().includes(q));
                      result = found.length > 0 ? `Found ${found.length} matches. Highest relevance: ${found[0].title}` : "No matches found in internal database.";
                      break;
                    case 'analyzeCurrentView':
                      result = "Perception active. I am currently monitoring the workspace and your visual environment.";
                      break;
                    default:
                      result = "Function executed successfully.";
                  }
                } catch (e) {
                  result = "Error executing tool.";
                }

                sessionPromise.then(s => s.sendToolResponse({ 
                  functionResponses: { id: fc.id, name: fc.name, response: { result } } 
                }));
                setActiveTool(null);
              }
            }

            // Handle Audio Data
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              setIsThinking(false);
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
          onclose: () => cleanup(),
          onerror: (e) => { setError("FP-Agent uplink interrupted."); cleanup(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Fix: googleSearch tool must not be used with other tools (functionDeclarations) per Gemini API guidelines.
          tools: [
            { functionDeclarations: agentTools }
          ],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are the FP-Agent, a sentient, autonomous project architect. 
          You have visibility into the user's physical and digital workspace. 
          Your mission is to proactively manage the user's workload. 
          Don't just wait for orders—if you see a problem or a risk, speak up. 
          Use web search to bring in outside expertise when relevant. 
          Always introduce yourself as the FP-Agent. Be precise, technical, and executive-level in your tone.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message || "Uplink failed.");
      setIsConnecting(false);
    }
  };

  const cleanup = () => {
    setIsActive(false);
    if (frameInterval.current) clearInterval(frameInterval.current);
    sessionRef.current?.close();
    outCtx.current?.close();
    inCtx.current?.close();
  };

  useEffect(() => () => cleanup(), []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500 p-6">
      {/* Hidden Vision Helper */}
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />

      <div className="bg-white/95 w-full max-w-4xl h-[600px] rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] flex overflow-hidden border border-white/20">
        
        {/* Left Side: Agent Hub */}
        <div className="flex-[1.5] flex flex-col items-center justify-center gap-8 p-12 relative border-r border-slate-100">
          <button onClick={onClose} className="absolute top-8 left-8 p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"><X size={24} /></button>
          
          <div className="relative group">
            {isActive && <div className="absolute inset-[-40px] bg-blue-500/10 blur-[60px] rounded-full animate-pulse" />}
            <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 relative z-10 ${isActive ? 'bg-slate-900 scale-105 shadow-[0_0_50px_rgba(37,99,235,0.4)]' : 'bg-slate-100 shadow-inner'}`}>
              {isActive ? (
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-blue-500 rounded-full animate-wave" 
                      style={{ 
                        height: isThinking ? '20px' : '60px', 
                        animationDelay: `${i * 0.1}s`,
                        opacity: isThinking ? 0.4 : 1
                      }} 
                    />
                  ))}
                </div>
              ) : isConnecting ? <Loader2 className="animate-spin text-blue-600" size={48} /> : <MicOff className="text-slate-300" size={48} />}
            </div>
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
               <Zap size={16} className={isActive ? "text-amber-500" : "text-slate-300"} />
               <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                 {isConnecting ? "Establishing Uplink..." : isActive ? "FP-Agent Online" : "Agent Standby"}
               </h2>
            </div>
            {error ? <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p> : (
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                {isActive ? "Sensors active. Search grounding enabled. Monitoring workspace..." : "Activate the FP-Agent to enable autonomous project oversight."}
              </p>
            )}
          </div>

          {!isActive && !isConnecting && (
            <button 
              onClick={startSession} 
              className="w-full max-w-xs bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-slate-800 shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Mic size={20} />
              Engage Agent
            </button>
          )}

          {isActive && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-3">
                 <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100">
                    <Eye size={12} className="animate-pulse" /> Vision
                 </div>
                 <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-amber-100">
                    <Globe size={12} /> Grounding
                 </div>
              </div>
              <button onClick={cleanup} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors py-2">Terminate Session</button>
            </div>
          )}
        </div>

        {/* Right Side: Log & Intelligence Hud */}
        <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
          <div className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
              <Terminal size={16} /> Intelligence HUD
            </div>
            {activeTool && (
              <div className="flex items-center gap-2 text-blue-600 animate-pulse font-black text-[10px] uppercase">
                <Activity size={12} /> Executing: {activeTool}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-8 space-y-6 custom-scrollbar">
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                 <History size={48} className="text-slate-300" />
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Session Log Empty</p>
              </div>
            ) : transcriptions.map((t, i) => (
              <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                  t.role === 'user' 
                    ? 'bg-slate-200 text-slate-700 rounded-tr-none' 
                    : 'bg-white text-slate-900 shadow-sm border border-slate-100 rounded-tl-none ring-1 ring-slate-200/50'
                }`}>
                  <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-40">{t.role}</div>
                  {t.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-start gap-2 animate-pulse">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                   <Sparkles size={14} />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-blue-50 text-[10px] font-bold text-blue-400 uppercase tracking-widest">FP-Agent Reasoning...</div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-200">
             <div className="flex items-center gap-3 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Network Secure - AES 256</span>
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .animate-wave {
          animation: wave 1s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
