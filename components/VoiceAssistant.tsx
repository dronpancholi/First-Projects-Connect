
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { X, Mic, MicOff, Waves, Volume2, AlertCircle, PlayCircle, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProjectStatus } from '../types.ts';

const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface VoiceAssistantProps {
  onClose: () => void;
}

const createProjectDeclaration: FunctionDeclaration = {
  name: 'createProject',
  parameters: {
    type: Type.OBJECT,
    description: 'Creates a new project workspace in the user ecosystem.',
    properties: {
      title: { type: Type.STRING, description: 'The title of the project.' },
      description: { type: Type.STRING, description: 'A short summary of the project goals.' },
    },
    required: ['title', 'description'],
  },
};

const createIdeaDeclaration: FunctionDeclaration = {
  name: 'createIdea',
  parameters: {
    type: Type.OBJECT,
    description: 'Creates a new standalone idea or note.',
    properties: {
      title: { type: Type.STRING, description: 'The title of the idea.' },
      content: { type: Type.STRING, description: 'The detailed content of the thought or idea.' },
    },
    required: ['title', 'content'],
  },
};

const deleteProjectDeclaration: FunctionDeclaration = {
  name: 'deleteProject',
  parameters: {
    type: Type.OBJECT,
    description: 'Deletes a project from the workspace.',
    properties: {
      title: { type: Type.STRING, description: 'The exact title of the project to remove.' },
    },
    required: ['title'],
  },
};

const deleteIdeaDeclaration: FunctionDeclaration = {
  name: 'deleteIdea',
  parameters: {
    type: Type.OBJECT,
    description: 'Deletes an idea or note from the workspace.',
    properties: {
      title: { type: Type.STRING, description: 'The exact title of the idea to remove.' },
    },
    required: ['title'],
  },
};

const getWorkspaceSummaryDeclaration: FunctionDeclaration = {
  name: 'getWorkspaceSummary',
  parameters: {
    type: Type.OBJECT,
    description: 'Provides a text summary of all current projects, tasks, and ideas.',
    properties: {},
  },
};

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose }) => {
  const { 
    projects, tasks, notes, snippets, whiteboards,
    addProject, addNote, deleteProject, deleteNote 
  } = useStore();
  
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setError(null);
      setIsConnecting(true);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      audioContextRef.current = outCtx;
      inputContextRef.current = inCtx;

      await outCtx.resume();
      await inCtx.resume();
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { 
                    data: encode(new Uint8Array(int16.buffer)), 
                    mimeType: 'audio/pcm;rate=16000' 
                  } 
                });
              });
            };
            source.connect(processor);
            processor.connect(inCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                let result = "ok";
                try {
                  if (fc.name === 'createProject') {
                    await addProject({
                      title: fc.args.title as string,
                      description: fc.args.description as string,
                      status: ProjectStatus.IDEA,
                      tags: ['voice-agent']
                    });
                    result = `Success: Project "${fc.args.title}" created.`;
                  } else if (fc.name === 'createIdea') {
                    await addNote({
                      title: fc.args.title as string,
                      content: fc.args.content as string,
                    });
                    result = `Success: Idea "${fc.args.title}" saved.`;
                  } else if (fc.name === 'deleteProject') {
                    const target = projects.find(p => p.title.toLowerCase() === (fc.args.title as string).toLowerCase());
                    if (target) {
                      await deleteProject(target.id);
                      result = `Success: Project "${fc.args.title}" removed.`;
                    } else {
                      result = `Error: Could not find project with title "${fc.args.title}".`;
                    }
                  } else if (fc.name === 'deleteIdea') {
                    const target = notes.find(n => n.title.toLowerCase() === (fc.args.title as string).toLowerCase());
                    if (target) {
                      await deleteNote(target.id);
                      result = `Success: Note "${fc.args.title}" removed.`;
                    } else {
                      result = `Error: Could not find idea with title "${fc.args.title}".`;
                    }
                  } else if (fc.name === 'getWorkspaceSummary') {
                    const summary = `You have ${projects.length} projects, ${tasks.filter(t => t.status !== 'Done').length} pending tasks, ${notes.length} notes, ${snippets.length} code snippets, and ${whiteboards.length} whiteboards. Projects include: ${projects.map(p => p.title).join(', ')}.`;
                    result = summary;
                  }
                } catch (err) {
                  result = "Error: Could not complete the action.";
                }

                sessionPromise.then((session) => {
                  session.sendToolResponse({
                    functionResponses: [{
                      id: fc.id,
                      name: fc.name,
                      response: { result },
                    }]
                  });
                });
              }
            }

            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64 = msg.serverContent.modelTurn.parts[0].inlineData.data;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              
              source.onended = () => sourcesRef.current.delete(source);
              sourcesRef.current.add(source);
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
            }

            if (msg.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => {
            console.error("Live API Error", e);
            setError("Session error occurred.");
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ 
            functionDeclarations: [
              createProjectDeclaration, 
              createIdeaDeclaration, 
              deleteProjectDeclaration, 
              deleteIdeaDeclaration,
              getWorkspaceSummaryDeclaration
            ] 
          }],
          systemInstruction: "You are the Agentic Voice Assistant for 'First Projects Connect'. You MUST only speak English. You have the power to create and delete projects and ideas. You can also provide a summary of the workspace state. When deleting, be careful and confirm with the user if the title match isn't perfect. Keep your spoken responses concise and professional. Do not recite quotes."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start voice session.");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
      inputContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white/90 w-full max-w-sm rounded-[40px] shadow-2xl p-8 flex flex-col items-center gap-6 border border-white/20">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Agentic Assistant</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="relative">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-blue-600 scale-110 shadow-[0_0_50px_rgba(37,99,235,0.4)]' : 'bg-gray-100'}`}>
            {isActive ? (
              <Waves className="text-white animate-pulse" size={48} />
            ) : (
              <MicOff className="text-gray-400" size={48} />
            )}
          </div>
          {isActive && (
             <div className="absolute inset-[-20px] rounded-full border-2 border-blue-200 animate-ping opacity-20" />
          )}
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {isConnecting ? "Connecting..." : isActive ? "I'm Listening..." : "First Projects Connect"}
          </h2>
          {error && !isActive && (
            <div className="flex flex-col items-center gap-2 justify-center text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100 mt-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                <span className="font-bold">Access Error</span>
              </div>
              <p className="opacity-80">{error}</p>
            </div>
          )}
          {!isActive && !isConnecting && (
            <p className="text-sm text-gray-500 max-w-[200px] mx-auto leading-relaxed">
              Command your workspace with voice. Try "Delete the project called Portfolio" or "Give me a summary".
            </p>
          )}
        </div>

        {!isActive && !isConnecting && (
          <button 
            onClick={startSession}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <PlayCircle size={20} /> Activate Agent
          </button>
        )}

        {isConnecting && (
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div className="w-full h-px bg-gray-100 my-2" />

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase">
             <Sparkles size={12} /> Full CRUD Support
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
