
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { 
  X, Mic, MicOff, Sparkles, Loader2, Globe, Eye, 
  Terminal, History, Activity, Zap
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus, TaskStatus, Priority } from '../types.ts';

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
    description: 'Get a comprehensive status report of all projects and tasks',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'searchWorkspace',
    description: 'Search globally for a project or task keyword',
    parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING } }, required: ['query'] }
  }
];

const VoiceAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { projects, tasks, addProject } = useStore();
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
  const streamRef = useRef<MediaStream | null>(null);
  const frameInterval = useRef<number | null>(null);

  const startVision = (stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }

    frameInterval.current = window.setInterval(() => {
      if (!sessionRef.current || !canvasRef.current || !videoRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && videoRef.current.videoWidth > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
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
        }, 'image/jpeg', 0.5);
      }
    }, 2000);
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000 }, 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;

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
              sessionRef.current?.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(i16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              });
            };
            src.connect(proc);
            proc.connect(inCtx.current!.destination);
            startVision(stream);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription) {
              transcriptionRef.current.user += msg.serverContent.inputTranscription.text;
            }
            if (msg.serverContent?.outputTranscription) {
              transcriptionRef.current.agent += msg.serverContent.outputTranscription.text;
              setIsThinking(false);
            }

            if (msg.serverContent?.turnComplete) {
              setTranscriptions(prev => [
                ...prev, 
                {role: 'user' as const, text: transcriptionRef.current.user},
                {role: 'agent' as const, text: transcriptionRef.current.agent}
              ].slice(-12));
              transcriptionRef.current = { user: '', agent: '' };
            }

            if (msg.toolCall) {
              setIsThinking(true);
              for (const fc of msg.toolCall.functionCalls) {
                setActiveTool(fc.name);
                // Cast args to any to prevent 'unknown' property access errors
                const args = fc.args as any;
                let result = "Success";
                try {
                  if (fc.name === 'createProject') {
                    await addProject({ title: args.title, description: args.description, status: ProjectStatus.IDEA, tags: ['voice'] });
                    result = `Initialized project: ${args.title}`;
                  } else if (fc.name === 'getWorkspacePulse') {
                    result = `Pulse: ${projects.length} Projects, ${tasks.length} Tasks active. System status nominal.`;
                  }
                } catch (e) { result = "Error executing tool."; }
                sessionRef.current?.sendToolResponse({ 
                  functionResponses: { id: fc.id, name: fc.name, response: { result } } 
                });
                setActiveTool(null);
              }
            }

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
          tools: [{ functionDeclarations: agentTools }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are FP-Agent. You have multimodal vision. Monitor the user's workspace, help manage projects, and be proactive."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message || "Failed to start session.");
      setIsConnecting(false);
    }
  };

  const cleanup = () => {
    setIsActive(false);
    if (frameInterval.current) clearInterval(frameInterval.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    sessionRef.current?.close();
    outCtx.current?.close();
    inCtx.current?.close();
  };

  useEffect(() => () => cleanup(), []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-6">
      <video ref={videoRef} className="hidden" muted />
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />

      <div className="bg-white w-full max-w-4xl h-[600px] rounded-[2.5rem] shadow-2xl flex overflow-hidden border border-white/20">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10 border-r border-slate-100">
          <button onClick={onClose} className="absolute top-8 left-8 p-3 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
          
          <div className="relative">
            {isActive && <div className="absolute inset-[-30px] bg-blue-500/10 blur-[40px] rounded-full animate-pulse" />}
            <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-slate-900 scale-105 shadow-xl' : 'bg-slate-50 border border-slate-100'}`}>
              {isActive ? (
                <div className="flex gap-1.5 h-12 items-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 bg-blue-500 rounded-full animate-[bounce_1s_infinite]" style={{ height: '100%', animationDelay: `${i*0.1}s` }} />
                  ))}
                </div>
              ) : isConnecting ? <Loader2 className="animate-spin text-blue-600" size={40} /> : <MicOff className="text-slate-200" size={40} />}
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <Zap size={16} className={isActive ? "text-amber-500" : "text-slate-300"} />
              {isActive ? "FP-Agent Online" : isConnecting ? "Connecting..." : "Agent Standby"}
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-[240px]">{error || "Autonomous project oversight active."}</p>
          </div>

          {!isActive && !isConnecting && (
            <button onClick={startSession} className="w-full max-w-xs bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
              <Mic size={18} /> Engage FP-Agent
            </button>
          )}

          {isActive && (
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Eye size={12} /> Vision Active</div>
               <button onClick={cleanup} className="px-3 py-1 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:underline">Terminate</button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-slate-50/50 flex flex-col">
          <div className="h-14 px-6 flex items-center justify-between border-b border-slate-200 bg-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Terminal size={14}/> Intelligence HUD</span>
            {activeTool && <div className="text-blue-600 text-[10px] font-black uppercase animate-pulse">Running: {activeTool}</div>}
          </div>
          
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20"><History size={32} className="mb-2"/><span className="text-[10px] font-bold uppercase tracking-widest">No Log Data</span></div>
            ) : transcriptions.map((t, i) => (
              <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-1`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${t.role === 'user' ? 'bg-slate-200 text-slate-700' : 'bg-white border border-slate-100 shadow-sm text-slate-900 font-medium'}`}>
                  {t.text}
                </div>
              </div>
            ))}
            {isThinking && <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">Agent Reasoning...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
