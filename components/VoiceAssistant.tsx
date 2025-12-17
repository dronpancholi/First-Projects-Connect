
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { X, Mic, MicOff, Waves, Volume2, AlertCircle, PlayCircle, Sparkles, Loader2 } from 'lucide-react';
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
  }
];

const VoiceAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { projects, tasks, notes, addProject, deleteProject } = useStore();
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
          onmessage: async (msg) => {
            if (msg.toolCall) {
              // Fixed: Process tool calls individually to comply with SDK plural-named singular object format
              for (const fc of msg.toolCall.functionCalls) {
                let res = "ok";
                if (fc.name === 'createProject') {
                  await addProject({ title: fc.args.title as string, description: fc.args.description as string, status: ProjectStatus.IDEA, tags: ['voice'] });
                  res = `Created project ${fc.args.title}`;
                } else if (fc.name === 'deleteProject') {
                  const p = projects.find(it => it.title.toLowerCase().includes((fc.args.title as string).toLowerCase()));
                  if (p) { await deleteProject(p.id); res = `Deleted ${p.title}`; }
                  else res = "Project not found.";
                } else if (fc.name === 'getWorkspaceOverview') {
                  res = `Workspace has ${projects.length} projects and ${tasks.filter(t => t.status !== 'Done').length} pending tasks.`;
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
          systemInstruction: "You are a professional assistant for First Projects Connect. You MUST only speak English. Be concise. You can manage projects by title."
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
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Workspace AI</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 scale-110 shadow-xl' : 'bg-gray-100'}`}>
          {isActive ? <Waves className="text-white animate-pulse" size={48} /> : isConnecting ? <Loader2 className="animate-spin text-blue-600" size={48} /> : <MicOff className="text-gray-400" size={48} />}
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">{isConnecting ? "Waking up..." : isActive ? "Listening..." : "Voice Control"}</h2>
          {error ? <p className="text-red-500 text-xs">{error}</p> : <p className="text-sm text-gray-500">Ask to create projects or summarize your work.</p>}
        </div>

        {!isActive && !isConnecting && (
          <button onClick={startSession} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg">Start Conversation</button>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
