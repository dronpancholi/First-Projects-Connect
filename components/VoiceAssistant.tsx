
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, MicOff, Sparkles, Loader2, Zap, AlertCircle, Info, Link2, Mic } from 'lucide-react';

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
              ].slice(-3));
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
            setError("Link unstable.");
            cleanup(); 
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are Connect, a professional AI assistant. Be concise, direct, and human."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError("Authorization required.");
      setIsConnecting(false);
      cleanup();
    }
  };

  useEffect(() => () => cleanup(), [cleanup]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-ios-gray/40 backdrop-blur-[40px] animate-in fade-in duration-500">
      
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-ios-blue/40 rounded-full assistant-orb" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-ios-indigo/30 rounded-full assistant-orb" style={{ animationDelay: '-2s' }} />

      <button onClick={onClose} className="absolute top-12 right-12 p-3 text-ios-label/20 hover:text-ios-label transition-colors btn-tactile">
        <X size={32} />
      </button>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        
        {/* Visualizer Orb */}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 ${isActive ? 'scale-110' : 'scale-100'}`}>
          <div className={`w-full h-full rounded-full bg-gradient-to-br from-ios-blue to-ios-indigo shadow-[0_0_50px_rgba(0,122,255,0.4)] flex items-center justify-center transition-all ${isActive ? 'animate-pulse' : ''}`}>
             {isConnecting ? <Loader2 className="animate-spin text-white" size={40} /> : <Zap className="text-white fill-white" size={40} />}
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-ios-label">
            {isActive ? "I'm Listening" : isConnecting ? "Linking AI..." : "Connect Assistant"}
          </h2>
          <p className="text-[17px] font-medium text-ios-label/40 max-w-sm mx-auto">
            Native audio reasoning enabled. Speak freely to manage your ecosystem.
          </p>
        </div>

        {error && (
          <div className="mt-8 flex items-center gap-3 text-rose-600 bg-rose-50 px-6 py-3 rounded-full border border-rose-100">
            <AlertCircle size={18} />
            <p className="text-[13px] font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        <div className="mt-16 w-full max-w-xs">
          {!isActive && !isConnecting && (
            <button 
              onClick={startSession} 
              className="w-full bg-ios-blue text-white py-4 rounded-full font-bold text-[17px] shadow-2xl shadow-ios-blue/30 transition-all btn-tactile flex items-center justify-center gap-3"
            >
              <Mic size={20} /> Activate Now
            </button>
          )}
          {isActive && (
            <button onClick={cleanup} className="w-full bg-ios-label text-white py-4 rounded-full font-bold text-[17px] transition-all btn-tactile">
              Dismiss
            </button>
          )}
        </div>

        {/* Live Transcription Overlay */}
        <div className="mt-16 w-full space-y-4">
          {transcriptions.map((t, i) => (
            <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[80%] px-6 py-3 rounded-[1.5rem] text-[15px] font-medium leading-relaxed ${t.role === 'user' ? 'bg-white text-ios-label shadow-sm' : 'text-ios-blue'}`}>
                {t.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-12 flex items-center gap-2 text-ios-label/20 text-[11px] font-bold uppercase tracking-[0.2em]">
        <Link2 size={12} /> Encrypted Uplink Active
      </div>
    </div>
  );
};

export default VoiceAssistant;
