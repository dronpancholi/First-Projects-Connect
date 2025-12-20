
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { X, Mic, MicOff, Sparkles, Loader2, Eye, Terminal, Zap, ShieldCheck, Link2, AlertCircle } from 'lucide-react';
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

const VoiceAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { projects, addProject } = useStore();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
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

  const cleanup = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    if (frameInterval.current) clearInterval(frameInterval.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (outCtx.current) {
      outCtx.current.close();
      outCtx.current = null;
    }
    if (inCtx.current) {
      inCtx.current.close();
      inCtx.current = null;
    }
    sources.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sources.current.clear();
  }, []);

  const handleLinkKey = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      startSession(); 
    } else {
      setError("Please set your API_KEY in the environment dashboard.");
    }
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000, echoCancellation: true }, 
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
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription) {
              transcriptionRef.current.user += msg.serverContent.inputTranscription.text;
            }
            if (msg.serverContent?.outputTranscription) {
              transcriptionRef.current.agent += msg.serverContent.outputTranscription.text;
            }
            if (msg.serverContent?.turnComplete) {
              // Explicitly cast roles to 'user' | 'agent' to satisfy TypeScript state update requirements
              setTranscriptions(prev => [
                ...prev, 
                {role: 'user' as const, text: transcriptionRef.current.user},
                {role: 'agent' as const, text: transcriptionRef.current.agent}
              ].slice(-5));
              transcriptionRef.current = { user: '', agent: '' };
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
          },
          onclose: () => cleanup(),
          onerror: (e: any) => { 
            if (e.message?.includes('API key')) {
              setError("API Key Missing. Link your free Google account.");
            } else {
              setError("Connection error. Try again.");
            }
            cleanup(); 
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a helpful student assistant. Keep answers brief and encouraging."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message?.includes('API key') ? "Link your Google account to start." : "Failed to connect.");
      setIsConnecting(false);
      cleanup();
    }
  };

  useEffect(() => () => cleanup(), [cleanup]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl h-[500px] rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 border border-slate-100 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={28} /></button>
        
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-indigo-600 scale-110 shadow-xl' : 'bg-slate-50 border-2 border-slate-100'}`}>
          {isActive ? <Sparkles className="text-white animate-pulse" size={48} /> : isConnecting ? <Loader2 className="animate-spin text-indigo-600" size={48} /> : <MicOff className="text-slate-200" size={48} />}
        </div>

        <div className="text-center mt-8 space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isActive ? "Listening..." : isConnecting ? "Connecting..." : "Voice Assistant"}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Free Tier Optimized</p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100">
            <AlertCircle size={14} />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        <div className="mt-10 w-full max-w-xs">
          {!isActive && !isConnecting && (
            <button 
              onClick={error?.includes('Link') ? handleLinkKey : startSession} 
              className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
            >
              <Zap size={20} /> Start Assistant
            </button>
          )}
          {isActive && (
            <button onClick={cleanup} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Stop</button>
          )}
        </div>

        <div className="mt-8 space-y-2 w-full overflow-hidden">
          {transcriptions.map((t, i) => (
            <div key={i} className={`text-[10px] font-bold uppercase tracking-wider ${t.role === 'user' ? 'text-slate-400' : 'text-indigo-600'}`}>
              {t.role}: {t.text.slice(0, 50)}...
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
