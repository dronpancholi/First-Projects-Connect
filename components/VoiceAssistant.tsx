
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, Mic, MicOff, Waves, Volume2, AlertCircle, PlayCircle } from 'lucide-react';

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

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    // Call getUserMedia immediately to maximize user gesture context
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setError(null);
      setPermissionDenied(false);
      setIsConnecting(true);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      audioContextRef.current = outCtx;
      inputContextRef.current = inCtx;

      // Force resume to ensure AudioContext is running in all browsers
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

            const interrupted = msg.serverContent?.interrupted;
            if (interrupted) {
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
          systemInstruction: "You are the Voice Assistant for First Projects Connect. Keep responses brief, conversational, and helpful."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('denied')) {
        setPermissionDenied(true);
        setError("Microphone access denied. Please check your browser permissions.");
      } else {
        setError(err.message || "Failed to start voice session.");
      }
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
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Live Assistant</span>
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
            {isConnecting ? "Connecting..." : isActive ? "I'm Listening..." : "Start Conversation"}
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
            <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
              Tap the button below to grant microphone access and start talking.
            </p>
          )}
        </div>

        {!isActive && !isConnecting && (
          <button 
            onClick={startSession}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <PlayCircle size={20} /> Start Live Voice
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
             <Volume2 size={12} /> Real-time PCM
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
