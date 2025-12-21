
import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Folder, Lightbulb, Settings, Search, LogOut, 
  PenTool, Sparkles, RefreshCw, Menu, Zap, Link2, ShieldCheck, 
  Command, Box, Layers, User, Lock, Info 
} from 'lucide-react';
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

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  badge?: string;
  isLocked?: boolean;
}> = ({ icon, label, isActive, onClick, badge, isLocked }) => (
  <button
    onClick={isLocked ? undefined : onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative ${
      isActive 
        ? 'bg-white/10 text-white' 
        : isLocked 
          ? 'text-white/20 cursor-not-allowed' 
          : 'text-white/50 hover:text-white hover:bg-white/5'
    }`}
  >
    <span className={`${isActive ? 'text-indigo-400' : ''}`}>
      {icon}
    </span>
    <span className="flex-1 text-left tracking-tight">{label}</span>
    {isLocked && (
      <Lock size={12} className="text-white/20" />
    )}
    {badge && !isLocked && (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold">
        {badge}
      </span>
    )}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { isSyncing, projects } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleAiTrigger = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
    // Note: Internal logic setIsVoiceActive(true) preserved but locked via UI
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* High-Performance Sidebar */}
      <aside className={`transition-all duration-300 system-sidebar flex flex-col z-30 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Box size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-[14px] text-white tracking-tight uppercase">First Projects</h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Connect System</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Core Registry</p>
            <SidebarItem 
              icon={<LayoutGrid size={16} />} 
              label="Mission Control" 
              isActive={currentView.type === 'DASHBOARD'} 
              onClick={() => setView({ type: 'DASHBOARD' })} 
            />
            <SidebarItem 
              icon={<Folder size={16} />} 
              label="Project Nodes" 
              isActive={currentView.type === 'PROJECTS' || currentView.type === 'PROJECT_DETAIL'} 
              onClick={() => setView({ type: 'PROJECTS' })} 
              badge={projects.length.toString()}
            />
          </div>

          <div className="space-y-1 mt-8">
            <p className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Infrastructure</p>
            <SidebarItem 
              icon={<Lightbulb size={16} />} 
              label="Intelligence" 
              isActive={currentView.type === 'IDEAS'} 
              onClick={() => setView({ type: 'IDEAS' })} 
            />
            <SidebarItem 
              icon={<PenTool size={16} />} 
              label="Architect Canvas" 
              isActive={currentView.type === 'WHITEBOARD'} 
              onClick={() => setView({ type: 'WHITEBOARD' })} 
            />
          </div>
        </div>

        <div className="mt-auto p-4 space-y-4">
          <div className="relative group">
            <button 
              onClick={handleAiTrigger}
              className="w-full flex items-center justify-center gap-3 py-3 text-[12px] font-bold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <Zap size={14} className="text-indigo-400" />
              Engage Assistant
              <Lock size={12} className="ml-auto opacity-30" />
            </button>
            
            {showComingSoon && (
              <div className="absolute inset-0 bg-indigo-600 rounded-lg flex items-center justify-center animate-in fade-in zoom-in duration-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Module Locked: Coming Soon</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-white font-bold text-xs">
              <User size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'System Authorized'}</p>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter truncate mt-0.5">Dron Pancholi Dev</p>
            </div>
            <button onClick={logout} className="text-white/20 hover:text-rose-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Surface */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-14 flex items-center px-6 shrink-0 bg-white border-b border-slate-200 justify-between">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors">
               <Menu size={18} />
             </button>
             <div className="flex items-center gap-2">
               <Layers size={14} className="text-slate-300" />
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{currentView.type.replace('_', ' ')} Registry</span>
             </div>
           </div>

           <div className="flex items-center gap-4">
             {isSyncing && (
               <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                 <RefreshCw size={10} className="text-indigo-600 animate-spin" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Syncing</span>
               </div>
             )}
             <button 
                onClick={() => setIsSpotlightOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-md hover:border-slate-300 transition-all group"
              >
               <Search size={14} />
               <span className="text-[11px] font-bold">Search Nodes...</span>
               <div className="ml-4 flex items-center gap-1 opacity-50">
                  <span className="text-[9px] font-black border border-slate-200 px-1 rounded">⌘</span>
                  <span className="text-[9px] font-black border border-slate-200 px-1 rounded">K</span>
               </div>
             </button>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto relative bg-[#F8FAFC] p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>

      {isSpotlightOpen && (
        <SpotlightSearch 
          isOpen={isSpotlightOpen} 
          onClose={() => setIsSpotlightOpen(false)} 
          setView={setView}
        />
      )}
      {/* Voice Assistant is preserved but only triggered by the UI if enabled (locked for now) */}
      {isVoiceActive && (
        <VoiceAssistant onClose={() => setIsVoiceActive(false)} />
      )}
    </div>
  );
};

export default Layout;
