
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Folder, Lightbulb, Settings, Search, LogOut, PenTool, Mic, Sparkles, CloudOff, RefreshCw, CheckCircle, ChevronRight, Menu } from 'lucide-react';
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
  badge?: React.ReactNode;
}> = ({ icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
      isActive 
        ? 'bg-zinc-800 text-white border border-zinc-700/50 shadow-sm' 
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
    }`}
  >
    <span className={`${isActive ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
      {icon}
    </span>
    <span className="flex-1 text-left">{label}</span>
    {badge}
    {isActive && <ChevronRight size={14} className="text-zinc-600" />}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { needsInitialization, isLoading, isSyncing, lastSyncTime } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans selection:bg-brand-primary/30">
      
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} flex-shrink-0 border-r border-zinc-900 bg-zinc-950 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <Sparkles className="text-white" size={16} />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">FP Connect</span>
        </div>

        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 mt-2">Core System</div>
          <NavItem 
            icon={<LayoutGrid size={18} />} 
            label="Dashboard" 
            isActive={currentView.type === 'DASHBOARD'} 
            onClick={() => setView({ type: 'DASHBOARD' })} 
          />
          <NavItem 
            icon={<Folder size={18} />} 
            label="Workspaces" 
            isActive={currentView.type === 'PROJECTS' || currentView.type === 'PROJECT_DETAIL'} 
            onClick={() => setView({ type: 'PROJECTS' })} 
          />
          <NavItem 
            icon={<Lightbulb size={18} />} 
            label="Brain Trust" 
            isActive={currentView.type === 'IDEAS'} 
            onClick={() => setView({ type: 'IDEAS' })} 
          />
          
          <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 mt-8">Studio</div>
          <NavItem 
            icon={<PenTool size={18} />} 
            label="Whiteboard" 
            isActive={currentView.type === 'WHITEBOARD'} 
            onClick={() => setView({ type: 'WHITEBOARD' })} 
          />
        </div>

        <div className="p-3 border-t border-zinc-900 space-y-2">
          <button 
            onClick={() => setIsVoiceActive(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-zinc-100 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50 rounded-xl transition-all mb-2 shadow-sm"
          >
            <Mic size={18} className="text-brand-primary animate-pulse" />
            <span className="flex-1 text-left">FP Assistant</span>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          </button>

          <button 
            onClick={() => setIsSpotlightOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors group"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Quick Search</span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-md font-mono">⌘K</span>
          </button>

          <div className="pt-4 px-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-1.5 text-zinc-600 hover:text-rose-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
          
          <div className="px-3 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isSyncing || isLoading ? (
                <RefreshCw size={10} className="text-brand-primary animate-spin" />
              ) : (
                <CheckCircle size={10} className="text-emerald-500" />
              )}
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                {isSyncing ? 'Syncing' : 'Secure'}
              </span>
            </div>
            <button onClick={() => setView({ type: 'SETTINGS' })} className="text-zinc-600 hover:text-zinc-300">
              <Settings size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950">
        <header className="h-14 border-b border-zinc-900 flex items-center px-6 glass shrink-0 z-10">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 text-zinc-500 hover:text-zinc-200 transition-colors">
             <Menu size={20} />
           </button>
           <div className="flex-1 flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
             <span className="text-brand-primary">{currentView.type.replace('_', ' ')}</span>
             {currentView.type === 'PROJECT_DETAIL' && (
               <>
                 <span className="text-zinc-700">/</span>
                 <span className="text-zinc-300">Integration Hub</span>
               </>
             )}
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[8px] font-bold">A{i}</div>
                 ))}
                 <div className="w-6 h-6 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-500">+8</div>
              </div>
              <button className="text-zinc-500 hover:text-zinc-200"><RefreshCw size={16} /></button>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-zinc-950/50 relative">
          {/* Subtle Background Detail */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          
          {children}
        </div>
      </main>

      {/* Overlays */}
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
