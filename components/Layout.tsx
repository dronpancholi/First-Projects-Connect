
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Folder, Lightbulb, Settings, Search, LogOut, PenTool, Mic, Sparkles, RefreshCw, CheckCircle, Menu, Zap } from 'lucide-react';
import { ViewState } from '../types.ts';
import SpotlightSearch from './SpotlightSearch.tsx';
import VoiceAssistant from './VoiceAssistant.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useStore } from '../context/StoreContext.tsx';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
      isActive 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </span>
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { isSyncing } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} flex-shrink-0 border-r border-slate-200 bg-white flex flex-col z-20`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={16} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">Connect AI</span>
        </div>

        <div className="px-4 py-4 flex-1 space-y-2 overflow-y-auto">
          <NavItem 
            icon={<LayoutGrid size={18} />} 
            label="Dashboard" 
            isActive={currentView.type === 'DASHBOARD'} 
            onClick={() => setView({ type: 'DASHBOARD' })} 
          />
          <NavItem 
            icon={<Folder size={18} />} 
            label="Projects" 
            isActive={currentView.type === 'PROJECTS' || currentView.type === 'PROJECT_DETAIL'} 
            onClick={() => setView({ type: 'PROJECTS' })} 
          />
          <NavItem 
            icon={<Lightbulb size={18} />} 
            label="Ideation" 
            isActive={currentView.type === 'IDEAS'} 
            onClick={() => setView({ type: 'IDEAS' })} 
          />
          <NavItem 
            icon={<PenTool size={18} />} 
            label="Visualizer" 
            isActive={currentView.type === 'WHITEBOARD'} 
            onClick={() => setView({ type: 'WHITEBOARD' })} 
          />
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/30">
          <button 
            onClick={() => setIsVoiceActive(true)}
            className="w-full flex items-center gap-3 px-4 py-4 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest"
          >
            <Zap size={16} />
            Activate Assistant
          </button>

          <div className="pt-4 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-[10px]">
              {user?.name?.slice(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-900 truncate uppercase tracking-wider">{user?.name || 'User'}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="h-14 border-b border-slate-200 flex items-center px-6 bg-white/80 backdrop-blur-md shrink-0 z-10">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 text-slate-400 hover:text-slate-900 transition-colors">
             <Menu size={20} />
           </button>
           <div className="flex-1 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             <span className="text-indigo-600">{currentView.type.replace('_', ' ')}</span>
           </div>
           {isSyncing && <RefreshCw size={14} className="text-indigo-500 animate-spin" />}
        </header>
        
        <div className="flex-1 overflow-auto relative">
          {children}
        </div>
      </main>

      {isSpotlightOpen && (
        <SpotlightSearch 
          isOpen={isSpotlightOpen} 
          onClose={() => setIsSpotlightOpen(false)} 
          setView={setView}
        />
      )}
      {isVoiceActive && (
        <VoiceAssistant onClose={() => setIsVoiceActive(false)} />
      )}
    </div>
  );
};

export default Layout;
