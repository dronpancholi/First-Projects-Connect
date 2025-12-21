
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, MicOff, Sparkles, Loader2, Zap, AlertCircle, Link2, Mic, Cpu } from 'lucide-react';

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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });
      streamRef.current = stream;
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
              setTranscriptions(prev => [...prev, 
                {role: 'user' as const, text: transcriptionRef.current.user},
                {role: 'agent' as const, text: transcriptionRef.current.agent}
              ].slice(-4));
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
            setError("Bridge connection failed.");
            cleanup(); 
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are First Projects Connect System Assistant. Developed by Dron Pancholi. Be professional and efficient."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError("Uplink Authorization Required.");
      setIsConnecting(false);
      cleanup();
    }
  };

  useEffect(() => () => cleanup(), [cleanup]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] border border-slate-200 overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
        
        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <Cpu size={18} className="text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">System Interface Assistant</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-10 flex flex-col items-center text-center">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500 border ${isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 border-indigo-600' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
             {isConnecting ? <Loader2 className="animate-spin" size={32} /> : isActive ? <Sparkles size={32} className="animate-pulse" /> : <Zap size={32} />}
          </div>

          <div className="mt-8 space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {isActive ? "Telemetry Active" : isConnecting ? "Establishing Bridge..." : "Uplink Idle"}
            </h3>
            <p className="text-[13px] font-medium text-slate-400 max-w-xs mx-auto">
              Natural Language Processing Module v1.0. Ready for architectural command sequence.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100 text-[11px] font-bold uppercase tracking-widest">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="mt-10 w-full flex gap-3">
            {!isActive && !isConnecting && (
              <button 
                onClick={startSession} 
                className="flex-1 bg-slate-900 text-white py-3.5 rounded-lg font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-[0.98]"
              >
                Initialize Session
              </button>
            )}
            {isActive && (
              <button onClick={cleanup} className="flex-1 bg-slate-100 text-slate-900 py-3.5 rounded-lg font-black text-[11px] uppercase tracking-[0.2em] border border-slate-200 hover:bg-slate-200 transition-all">
                Terminate Link
              </button>
            )}
          </div>
        </div>

        {/* System Logs / Transcription */}
        {transcriptions.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-100 p-6 space-y-4 max-h-48 overflow-y-auto">
            {transcriptions.map((t, i) => (
              <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${t.role === 'user' ? 'text-slate-300' : 'text-indigo-400'}`}>
                  {t.role === 'user' ? 'Input Node' : 'System Agent'}
                </div>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-lg text-[13px] font-medium leading-relaxed ${t.role === 'user' ? 'bg-white text-slate-600 border border-slate-200' : 'bg-indigo-600 text-white shadow-md'}`}>
                  {t.text}
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="p-4 bg-slate-950 text-white/20 text-[8px] font-black uppercase tracking-[0.4em] text-center border-t border-white/5">
           FP-Connect Utility Layer • Developed by Dron Pancholi
        </footer>
      </div>
    </div>
  );
};

export default VoiceAssistant;
