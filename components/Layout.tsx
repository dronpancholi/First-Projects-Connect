
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Folder, Lightbulb, Settings, Search, LogOut, PenTool, Mic, Sparkles, RefreshCw, CheckCircle, ChevronRight, Menu } from 'lucide-react';
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
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all group ${
      isActive 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </span>
    <span className="flex-1 text-left">{label}</span>
    {isActive && <div className="w-1 h-1 rounded-full bg-indigo-600" />}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { isLoading, isSyncing } = useStore();
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
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} flex-shrink-0 border-r border-slate-200 bg-white flex flex-col z-20 shadow-[1px_0_0_rgba(0,0,0,0.02)]`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Sparkles className="text-white" size={16} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">Connect</span>
        </div>

        <div className="px-4 py-4 flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 mt-2">Workspace</div>
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
          
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 mt-8">Creative Studio</div>
          <NavItem 
            icon={<PenTool size={18} />} 
            label="Whiteboard" 
            isActive={currentView.type === 'WHITEBOARD'} 
            onClick={() => setView({ type: 'WHITEBOARD' })} 
          />
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <button 
            onClick={() => setIsVoiceActive(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all shadow-sm group border border-indigo-100"
          >
            <Mic size={18} className="group-hover:scale-110 transition-transform" />
            <span className="flex-1 text-left">Assistant HUD</span>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </button>

          <button 
            onClick={() => setIsSpotlightOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors group"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search Workspace</span>
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-lg font-mono">⌘K</span>
          </button>

          <div className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
          
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
              {isSyncing || isLoading ? (
                <RefreshCw size={10} className="text-indigo-600 animate-spin" />
              ) : (
                <CheckCircle size={10} className="text-emerald-500" />
              )}
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {isSyncing ? 'Syncing' : 'Secure'}
              </span>
            </div>
            <button onClick={() => setView({ type: 'SETTINGS' })} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
              <Settings size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="h-14 border-b border-slate-200 flex items-center px-6 executive-glass shrink-0 z-10">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 text-slate-400 hover:text-slate-900 transition-colors">
             <Menu size={20} />
           </button>
           <div className="flex-1 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             <span className="text-indigo-600">{currentView.type.replace('_', ' ')}</span>
             {currentView.type === 'PROJECT_DETAIL' && (
               <>
                 <span className="text-slate-200">/</span>
                 <span className="text-slate-900">Details</span>
               </>
             )}
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex -space-x-2.5">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">A{i}</div>
                 ))}
                 <div className="w-7 h-7 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">+5</div>
              </div>
              <button className="text-slate-300 hover:text-indigo-600 transition-colors"><RefreshCw size={16} /></button>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-slate-25/50 relative">
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
