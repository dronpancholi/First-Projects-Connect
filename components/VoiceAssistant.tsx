
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, MicOff, Sparkles, Loader2, Zap, AlertCircle, Info, Link2 } from 'lucide-react';

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
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
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

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check for AI Studio Bridge first if outside environment
      if (!process.env.API_KEY && (window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
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
            console.error(e);
            setError(e.message?.includes('API key') ? "Invalid API Key. Check Vercel Env Vars." : "Connection failed.");
            cleanup(); 
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are the Connect AI Assistant. Be concise, professional, and helpful."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError("Mic access denied or API configuration error.");
      setIsConnecting(false);
      cleanup();
    }
  };

  useEffect(() => () => cleanup(), [cleanup]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 border border-white/20 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-10 right-10 p-3 text-slate-300 hover:text-slate-900 transition-colors"><X size={28} /></button>
        
        <div className={`w-36 h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-indigo-600 scale-105 shadow-2xl ring-8 ring-indigo-50' : 'bg-slate-50 border-2 border-slate-100'}`}>
          {isActive ? (
             <div className="flex gap-1.5 h-10 items-center">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="w-1.5 bg-white rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 30}px`, animationDelay: `${i*0.1}s` }} />
               ))}
             </div>
          ) : isConnecting ? <Loader2 className="animate-spin text-indigo-600" size={56} /> : <MicOff className="text-slate-200" size={56} />}
        </div>

        <div className="text-center mt-10 space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isActive ? "Connected" : isConnecting ? "Initializing..." : "AI Assistant"}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Free Gemini 2.5 Native
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-8 flex items-center gap-3 text-rose-500 bg-rose-50 px-5 py-3 rounded-2xl border border-rose-100 max-w-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-xs font-bold leading-tight uppercase tracking-wider">{error}</p>
          </div>
        )}

        <div className="mt-12 w-full max-w-xs space-y-4">
          {!isActive && !isConnecting && (
            <>
              <button 
                onClick={startSession} 
                className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
              >
                <Zap size={20} /> Engage Assistant
              </button>
              <div className="flex items-center justify-center gap-2 px-6">
                <Info size={12} className="text-slate-400" />
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Optimized for Vercel. Ensure your API_KEY is set in project settings.
                </p>
              </div>
            </>
          )}
          {isActive && (
            <button onClick={cleanup} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">End Session</button>
          )}
        </div>

        <div className="mt-10 w-full max-h-32 overflow-y-auto space-y-3 px-6 scrollbar-hide">
          {transcriptions.slice(-2).map((t, i) => (
            <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[90%] px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wide ${t.role === 'user' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                {t.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
