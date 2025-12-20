
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { X, Mic, MicOff, Sparkles, Loader2, Eye, Terminal, History, Zap, ShieldCheck, Link2, Monitor } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus } from '../types.ts';

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
    name: 'syncWorkspaceContext',
    description: 'Retrieve all current project information to get context on what the user is working on',
    parameters: { type: Type.OBJECT, properties: {} }
  }
];

const VoiceAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { projects, tasks, addProject } = useStore();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isApiKeyLinked, setIsApiKeyLinked] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<{role: 'user' | 'agent', text: string}[]>([]);

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

  useEffect(() => {
    const checkKey = async () => {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const linked = await (window as any).aistudio.hasSelectedApiKey();
        setIsApiKeyLinked(linked);
      }
    };
    checkKey();
  }, []);

  const handleLinkKey = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      setIsApiKeyLinked(true);
    }
  };

  const cleanup = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    if (frameInterval.current) clearInterval(frameInterval.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    sessionRef.current?.close();
    outCtx.current?.close();
    inCtx.current?.close();
    sources.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sources.current.clear();
  }, []);

  const startVision = (stream: MediaStream, sessionPromise: Promise<any>) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }

    frameInterval.current = window.setInterval(() => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && videoRef.current.videoWidth > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: { data: base64, mimeType: 'image/jpeg' }
                });
              });
            };
            reader.readAsDataURL(blob);
          }
        }, 'image/jpeg', 0.5);
      }
    }, 3000); 
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000, echoCancellation: true, noiseSuppression: true }, 
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
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ 
                  media: { data: encode(new Uint8Array(i16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                });
              });
            };
            src.connect(proc);
            proc.connect(inCtx.current!.destination);
            startVision(stream, sessionPromise);
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
              ].slice(-10));
              transcriptionRef.current = { user: '', agent: '' };
            }

            if (msg.toolCall) {
              setIsThinking(true);
              for (const fc of msg.toolCall.functionCalls) {
                const args = fc.args as any;
                let result: any = "Success";
                if (fc.name === 'createProject') {
                  await addProject({ title: args.title, description: args.description, status: ProjectStatus.IDEA, tags: ['ai-agent'] });
                  result = { status: "Project initialized" };
                } else if (fc.name === 'syncWorkspaceContext') {
                  result = { activeProjects: projects.length };
                }
                sessionPromise.then((session) => {
                  session.sendToolResponse({ 
                    functionResponses: { id: fc.id, name: fc.name, response: { result } } 
                  });
                });
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
          onerror: (e: any) => { 
            setError("Assistant uplink failed."); 
            cleanup(); 
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: agentTools }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are the Connect-Assistant. You are a professional workspace architect. Help the user manage projects and organize ideas. You have access to their camera and can see their workspace."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message || "Uplink Error.");
      setIsConnecting(false);
      cleanup();
    }
  };

  useEffect(() => () => cleanup(), [cleanup]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-8 animate-in fade-in duration-300">
      <video ref={videoRef} className="hidden" muted />
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />

      <div className="bg-white w-full max-w-5xl h-[700px] rounded-[3rem] shadow-2xl flex overflow-hidden border border-white/20 ring-1 ring-slate-200">
        <div className="flex-1 flex flex-col items-center justify-center gap-10 p-12 border-r border-slate-100 bg-slate-50/30">
          <button onClick={onClose} className="absolute top-10 left-10 p-3 text-slate-300 hover:text-slate-900 transition-colors"><X size={28} /></button>
          
          <div className="relative">
            {isActive && <div className="absolute inset-[-40px] bg-indigo-500/10 blur-[60px] rounded-full animate-pulse" />}
            <div className={`w-48 h-48 rounded-[3rem] flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-indigo-600 scale-105 shadow-2xl' : 'bg-white border-2 border-slate-100'}`}>
              {isActive ? (
                <div className="flex gap-2 h-14 items-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 bg-white rounded-full animate-wave" style={{ animationDelay: `${i*0.1}s` }} />
                  ))}
                </div>
              ) : isConnecting ? <Loader2 className="animate-spin text-indigo-600" size={56} /> : <MicOff className="text-slate-200" size={56} />}
            </div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-3 tracking-tight">
              <Zap size={20} className={isActive ? "text-indigo-600" : "text-slate-300"} />
              {isActive ? "Connect-Engine Online" : isConnecting ? "Establishing Bridge..." : "Assistant Hub"}
            </h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">{error || "Neural Link Protocol v2.5"}</p>
          </div>

          <div className="w-full max-w-sm">
            {!isActive && !isConnecting && (
              <div className="space-y-4">
                {!isApiKeyLinked ? (
                  <button onClick={handleLinkKey} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3">
                    <Link2 size={20} /> Authorize Account
                  </button>
                ) : (
                  <button onClick={startSession} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3">
                    <Mic size={20} /> Engage Assistant
                  </button>
                )}
              </div>
            )}
            
            {isActive && (
              <div className="flex justify-center gap-4">
                 <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2"><Eye size={14} /> Vision Active</div>
                 <button onClick={cleanup} className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100">Terminate</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-[0.8] bg-white flex flex-col border-l border-slate-50">
          <div className="h-16 px-8 flex items-center justify-between border-b border-slate-100 bg-slate-25/50">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3"><Terminal size={16}/> Intelligence Log</span>
            {isApiKeyLinked && <div className="text-emerald-500 text-[10px] font-black uppercase flex items-center gap-2"><ShieldCheck size={14} /> Bridge Secure</div>}
          </div>
          
          <div className="flex-1 overflow-auto p-10 space-y-6 custom-scrollbar">
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <History size={48} className="text-slate-100 mb-4"/>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Awaiting Interaction</span>
              </div>
            ) : transcriptions.map((t, i) => (
              <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[90%] p-5 rounded-3xl text-sm leading-relaxed ${t.role === 'user' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-50 border border-indigo-100 text-indigo-900 font-semibold'}`}>
                  {t.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Processing Intent...</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes wave {
          0%, 100% { height: 12px; }
          50% { height: 50px; }
        }
        .animate-wave { animation: wave 1.2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
