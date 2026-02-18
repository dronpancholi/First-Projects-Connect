
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Command, Send, X, MonitorPlay, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import * as GeminiService from '../services/geminiService.ts';
import { GlassPanel, GlassButton, GlassInput } from './ui/LiquidGlass.tsx';
import { TaskStatus, Priority, ViewState, ProjectStatus } from '../types.ts';

interface VoiceAssistantProps {
  setView: (view: ViewState) => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const { addTask, addNote, addProject, projects, tasks, notes } = useStore();
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onend = () => setIsListening(false);

      recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        handleUserMessage(text);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Error", event.error);
        setIsListening(false);
        setErrorMessage("Microphone offline.");
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMessage("Voice API not supported.");
    }
  }, [projects, tasks, notes]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setErrorMessage('');
      recognitionRef.current?.start();
    }
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const newHistory = [...messages, { role: 'user' as const, content: text }];
    setMessages(newHistory);
    setInputText('');
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const context = {
        projects: projects.slice(0, 10),
        tasks: tasks.slice(0, 20),
        notes: notes.slice(0, 5)
      };

      const result = await GeminiService.runAgentLoop(newHistory, context);

      setMessages([...newHistory, { role: 'model' as const, content: result.response }]);

      if (result.actions && result.actions.length > 0) {
        for (const action of result.actions) {
          await executeAction(action);
        }
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model' as const, content: "FP-Engine: System Failure. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAction = async (action: GeminiService.AgentAction) => {
    const { type, payload } = action;
    try {
      switch (type) {
        case 'NAVIGATE':
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
            projectId: payload.projectId === 'GLOBAL' || !payload.projectId ? (projects[0]?.id || '') : payload.projectId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          break;
        case 'CREATE_PROJECT':
          await addProject({
            title: payload.title,
            description: payload.description,
            tags: ['fp-engine'],
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
    } catch (e) {
      console.error("Action Failed", e);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center glass-card border border-purple-500/30 hover:bg-purple-500/20 shadow-2xl shadow-purple-900/50 transition-all transform hover:scale-110 active:scale-95 group animate-fade-in"
      >
        <MonitorPlay size={28} className="text-purple-300 group-hover:text-purple-100" />
        {messages.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-black" />}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-0 md:p-6">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      <GlassPanel className="w-full h-[90vh] md:h-[600px] md:max-w-xl flex flex-col relative z-10 border-purple-500/30 shadow-2xl shadow-purple-900/50 rounded-t-3xl md:rounded-3xl overflow-hidden bg-black/40">

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span className="font-mono text-sm tracking-widest text-purple-200 uppercase">FP-Engine v2.0</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center animate-pulse">
                <MonitorPlay size={40} className="opacity-50" />
              </div>
              <p className="text-lg font-light text-center">"Online & Ready.<br />What are we building?"</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed animate-slide-up
                  ${msg.role === 'user'
                    ? 'bg-purple-600/20 border border-purple-500/30 text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'}
                `}>
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {isProcessing && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-purple-400" />
                <span className="text-xs text-white/50 tracking-wider uppercase">Processing Data stream...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full text-xs text-red-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {errorMessage}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`p-3 md:p-4 rounded-xl transition-all flex-shrink-0 ${isListening
                ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse scale-105'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <GlassInput
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUserMessage(inputText)}
              placeholder="Ask FP-Engine..."
              className="flex-1"
            />

            <GlassButton
              variant="primary"
              onClick={() => handleUserMessage(inputText)}
              disabled={!inputText.trim() || isProcessing}
              className="p-3 md:p-4"
            >
              <Send size={20} />
            </GlassButton>
          </div>
        </div>

      </GlassPanel>
    </div>
  );
};

export default VoiceAssistant;
