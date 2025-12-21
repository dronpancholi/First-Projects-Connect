
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Folder, Lightbulb, Settings, Search, LogOut, PenTool, Sparkles, RefreshCw, Menu, Zap, Link2, ShieldCheck, ChevronRight, Code, MoreHorizontal } from 'lucide-react';
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
  badge?: string;
}> = ({ icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all group ${
      isActive 
        ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/20' 
        : 'text-ios-label/60 hover:bg-ios-label/5'
    }`}
  >
    <span className={`${isActive ? 'text-white' : 'text-ios-blue'}`}>
      {icon}
    </span>
    <span className="flex-1 text-left tracking-tight">{label}</span>
    {badge && (
      <span className={`text-[12px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-ios-blue/10 text-ios-blue'}`}>
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
  const [isAiLinked, setIsAiLinked] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const linked = await (window as any).aistudio.hasSelectedApiKey();
        setIsAiLinked(linked);
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualLink = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setIsAiLinked(true);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F2F2F7] text-ios-label font-sans selection:bg-ios-blue/20 overflow-hidden">
      
      {/* Sidebar - iPadOS Style */}
      <aside className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'} flex-shrink-0 bg-transparent flex flex-col z-20`}>
        <div className="p-8 pb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ios-blue to-ios-indigo flex items-center justify-center shadow-xl shadow-ios-blue/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none">Connect</h1>
            <p className="text-[11px] font-bold text-ios-blue uppercase tracking-widest mt-1">iOS Ecosystem</p>
          </div>
        </div>

        <div className="px-4 py-4 flex-1 space-y-1 overflow-y-auto no-scrollbar">
          <p className="px-4 text-[12px] font-bold text-ios-label/30 uppercase tracking-[0.1em] mb-4 mt-2">Library</p>
          <NavItem 
            icon={<LayoutGrid size={20} />} 
            label="Overview" 
            isActive={currentView.type === 'DASHBOARD'} 
            onClick={() => setView({ type: 'DASHBOARD' })} 
          />
          <NavItem 
            icon={<Folder size={20} />} 
            label="Projects" 
            isActive={currentView.type === 'PROJECTS' || currentView.type === 'PROJECT_DETAIL'} 
            onClick={() => setView({ type: 'PROJECTS' })} 
            badge={projects.length.toString()}
          />
          
          <p className="px-4 text-[12px] font-bold text-ios-label/30 uppercase tracking-[0.1em] mb-4 mt-8">Intelligence</p>
          <NavItem 
            icon={<Lightbulb size={20} />} 
            label="Notes" 
            isActive={currentView.type === 'IDEAS'} 
            /* Fixed typo: setType to setView */
            onClick={() => setView({ type: 'IDEAS' })} 
          />
          <NavItem 
            icon={<PenTool size={20} />} 
            label="Canvas" 
            isActive={currentView.type === 'WHITEBOARD'} 
            onClick={() => setView({ type: 'WHITEBOARD' })} 
          />
          
          <NavItem 
            icon={<Settings size={20} />} 
            label="Preferences" 
            isActive={currentView.type === 'SETTINGS'} 
            onClick={() => setView({ type: 'SETTINGS' })} 
          />
        </div>

        <div className="p-6 space-y-4">
          {/* AI Uplink Status Widget */}
          <div className="p-4 rounded-[1.5rem] ios-glass border-none shadow-sm space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ios-label/40 uppercase tracking-widest">AI Status</span>
                <div className={`w-2 h-2 rounded-full ${isAiLinked ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`} />
             </div>
             {isAiLinked ? (
               <div className="flex items-center gap-2 text-[12px] font-bold text-ios-label/70">
                  <ShieldCheck size={16} className="text-ios-blue" /> Uplink Active
               </div>
             ) : (
               <button 
                 onClick={handleManualLink}
                 className="w-full flex items-center justify-center gap-2 py-2 bg-ios-blue/10 text-ios-blue rounded-xl text-[12px] font-bold tracking-tight hover:bg-ios-blue/20 transition-all btn-tactile"
               >
                 <Link2 size={14} /> Link Google
               </button>
             )}
          </div>

          <button 
            onClick={() => setIsVoiceActive(true)}
            className="w-full flex items-center justify-center gap-3 py-4 text-[15px] font-bold text-white bg-ios-label rounded-[1.5rem] transition-all shadow-xl active:scale-95 group"
          >
            <Zap size={18} className="text-ios-blue fill-ios-blue group-hover:scale-125 transition-transform" />
            Engage AI
          </button>

          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue font-bold text-sm border border-ios-blue/20">
              {user?.name?.slice(0, 1).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ios-label truncate tracking-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] font-medium text-ios-label/40 truncate tracking-tight">Active Session</p>
            </div>
            <button onClick={logout} className="p-2 text-ios-label/20 hover:text-rose-500 transition-colors btn-tactile">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Surface */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white m-2 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-white">
        <header className="h-16 flex items-center px-10 shrink-0 z-10 justify-between">
           <div className="flex items-center gap-6">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-ios-label/40 hover:text-ios-label transition-colors btn-tactile">
               <Menu size={22} />
             </button>
             <div className="flex items-center gap-3">
               <span className="text-[13px] font-bold text-ios-label/30 uppercase tracking-[0.2em]">{currentView.type.replace('_', ' ')}</span>
             </div>
           </div>

           <div className="flex items-center gap-4">
             {isSyncing && (
               <div className="flex items-center gap-2 px-3 py-1.5 bg-ios-gray rounded-full">
                 <RefreshCw size={12} className="text-ios-blue animate-spin" />
                 <span className="text-[11px] font-bold text-ios-label/50">Syncing</span>
               </div>
             )}
             <button 
                onClick={() => setIsSpotlightOpen(true)}
                className="p-3 text-ios-label/40 hover:text-ios-blue transition-all btn-tactile"
              >
               <Search size={22} />
             </button>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto relative custom-scrollbar">
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
