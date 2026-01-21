
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Command } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import * as GeminiService from '../services/geminiService.ts';
import { GlassPanel } from './ui/LiquidGlass.tsx';
import { TaskStatus, Priority, ViewState, ProjectStatus } from '../types.ts';

interface VoiceAssistantProps {
  setView: (view: ViewState) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ setView }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [transcript, setTranscript] = useState('');

  const { addTask, addNote, addProject, projects } = useStore();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleCommand(text);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Error", event.error);
        setIsListening(false);
        setFeedback("Microphone error. Check permissions.");
      };

      recognitionRef.current = recognition;
    } else {
      setFeedback("Voice not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setFeedback("Listening...");
      setTranscript("");
      recognitionRef.current?.start();
    }
  };

  const handleCommand = async (text: string) => {
    setIsListening(false);
    setIsProcessing(true);
    setFeedback("Thinking...");

    try {
      const action = await GeminiService.interpretCommand(text);
      setFeedback(action.feedback);

      await executeAction(action);

      // Auto-hide after success
      setTimeout(() => {
        setFeedback("");
        setTranscript("");
        setIsProcessing(false);
      }, 3000);

    } catch (error) {
      setFeedback("Failed to process command.");
      setIsProcessing(false);
    }
  };

  const executeAction = async (action: GeminiService.CommandAction) => {
    const { type, payload } = action;

    switch (type) {
      case 'NAVIGATE':
        // Map paths to ViewState
        const path = payload.path?.toLowerCase();
        if (path?.includes('project')) setView({ type: 'PROJECTS' });
        else if (path?.includes('kanban') || path?.includes('task')) setView({ type: 'KANBAN' });
        else if (path?.includes('setting')) setView({ type: 'SETTINGS' });
        else if (path?.includes('idea')) setView({ type: 'IDEAS' });
        else if (path?.includes('finan')) setView({ type: 'FINANCIALS' });
        else if (path?.includes('whiteboard')) setView({ type: 'WHITEBOARD' });
        else setView({ type: 'DASHBOARD' });
        break;
      case 'CREATE_TASK':
        await addTask({
          title: payload.title,
          status: TaskStatus.TODO,
          priority: payload.priority === 'High' ? Priority.HIGH : Priority.MEDIUM,
          projectId: projects[0]?.id || '', // Fallback to first project
          createdAt: new Date(),
          updatedAt: new Date()
        });
        break;
      case 'CREATE_PROJECT':
        await addProject({
          title: payload.title,
          description: payload.description,
          tags: ['voice-created'],
          status: ProjectStatus.ACTIVE,
          updatedAt: new Date()
        });
        break;
      case 'CREATE_NOTE':
        await addNote({
          title: payload.title,
          content: payload.content,
          projectId: 'GLOBAL',
          createdAt: new Date()
        });
        break;
    }
  };

  // If not supported or hidden, render nothing (except if unsupported warning needed)
  if (!recognitionRef.current) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Feedback Popover */}
      {(feedback || transcript) && (
        <div className="glass-card-subtle p-4 rounded-xl mb-2 animate-fade-in max-w-xs backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            {isProcessing ? <Loader2 size={14} className="animate-spin text-purple-400" /> : <Command size={14} className="text-blue-400" />}
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">FP-Engine</span>
          </div>
          {transcript && <p className="text-sm text-white italic mb-2">"{transcript}"</p>}
          <p className="text-sm font-medium text-purple-200">{feedback}</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${isListening
          ? 'bg-red-500/80 animate-pulse ring-4 ring-red-500/30'
          : isProcessing
            ? 'bg-purple-500/80 ring-4 ring-purple-500/30'
            : 'glass-card border border-white/20 hover:bg-white/10'
          }`}
      >
        {isListening ? (
          <MicOff className="text-white" size={24} />
        ) : (
          <Mic className={isProcessing ? "text-white/50" : "text-white"} size={24} />
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
