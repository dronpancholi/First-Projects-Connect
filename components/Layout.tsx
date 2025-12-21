
import React, { useState } from 'react';
import { 
  LayoutDashboard, Briefcase, FileText, Settings, Search, LogOut, 
  Palette, Sparkles, RefreshCw, Menu, Zap, Link2, ShieldCheck, 
  User, Lock, ChevronRight, Bell, Globe
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

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  badge?: string;
  isLocked?: boolean;
}> = ({ icon, label, isActive, onClick, badge, isLocked }) => (
  <button
    onClick={isLocked ? undefined : onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all group relative ${
      isActive 
        ? 'bg-gray-100 text-black' 
        : isLocked 
          ? 'text-gray-300 cursor-not-allowed' 
          : 'text-gray-500 hover:text-black hover:bg-gray-50'
    }`}
  >
    <span className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-black'}`}>
      {icon}
    </span>
    <span className="flex-1 text-left">{label}</span>
    {isLocked ? (
      <Lock size={12} className="text-gray-300" />
    ) : badge ? (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
        {badge}
      </span>
    ) : (
      <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-0' : ''}`} />
    )}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { isSyncing, projects } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar - Professional Workspace Style */}
      <aside className={`transition-all duration-300 sidebar-border bg-workspace-sidebar flex flex-col z-30 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 pb-2">
          {/* Professional Monogram Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 system-gradient rounded-lg flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
              FP
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-[14px] text-gray-900 tracking-tight leading-none">First Projects</h1>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Connect</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Main</p>
            <NavItem 
              icon={<LayoutDashboard size={16} />} 
              label="Overview" 
              isActive={currentView.type === 'DASHBOARD'} 
              onClick={() => setView({ type: 'DASHBOARD' })} 
            />
            <NavItem 
              icon={<Briefcase size={16} />} 
              label="Workspaces" 
              isActive={currentView.type === 'PROJECTS' || currentView.type === 'PROJECT_DETAIL'} 
              onClick={() => setView({ type: 'PROJECTS' })} 
              badge={projects.length.toString()}
            />
          </div>

          <div className="space-y-1 mt-8">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Resources</p>
            <NavItem 
              icon={<FileText size={16} />} 
              label="Documentation" 
              isActive={currentView.type === 'IDEAS'} 
              onClick={() => setView({ type: 'IDEAS' })} 
            />
            <NavItem 
              icon={<Palette size={16} />} 
              label="Visual Board" 
              isActive={currentView.type === 'WHITEBOARD'} 
              onClick={() => setView({ type: 'WHITEBOARD' })} 
            />
          </div>
        </div>

        <div className="mt-auto p-4 space-y-4">
          <div className="coming-soon-lock p-1">
            <button 
              disabled
              className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-bold text-gray-500 bg-white border border-gray-200 rounded-lg cursor-not-allowed opacity-50"
            >
              <Zap size={14} className="text-gray-400" />
              AI Assistant
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs border border-gray-200">
              <User size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Authorized User'}</p>
              <p className="text-[9px] font-medium text-indigo-600 truncate uppercase tracking-tighter">Developed by Dron Pancholi</p>
            </div>
            <button onClick={logout} className="text-gray-300 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="h-14 flex items-center px-8 shrink-0 border-b border-gray-100 justify-between">
           <div className="flex items-center gap-6">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 text-gray-400 hover:text-black transition-colors">
               <Menu size={20} />
             </button>
             <div className="h-4 w-px bg-gray-200"></div>
             <nav className="flex items-center gap-2">
               <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{currentView.type.replace('_', ' ')}</span>
             </nav>
           </div>

           <div className="flex items-center gap-6">
             {isSyncing && (
               <div className="flex items-center gap-2">
                 <RefreshCw size={12} className="text-indigo-600 animate-spin" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Synchronizing</span>
               </div>
             )}
             <div className="flex items-center gap-4">
               <button onClick={() => setIsSpotlightOpen(true)} className="p-1 text-gray-400 hover:text-black transition-colors">
                 <Search size={20} />
               </button>
               <button className="p-1 text-gray-400 hover:text-black transition-colors">
                 <Bell size={20} />
               </button>
               <button onClick={() => setView({ type: 'SETTINGS' })} className="p-1 text-gray-400 hover:text-black transition-colors">
                 <Settings size={20} />
               </button>
             </div>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-white p-8 lg:p-12">
          <div className="max-w-[1400px] mx-auto">
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
      
      {/* Logic preserved but only active if state is set (locked by UI above) */}
      {isVoiceActive && (
        <VoiceAssistant onClose={() => setIsVoiceActive(false)} />
      )}
    </div>
  );
};

export default Layout;
