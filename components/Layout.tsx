
import React, { useState } from 'react';
import { 
  LayoutDashboard, Briefcase, FileText, Settings, Search, LogOut, 
  Palette, Sparkles, RefreshCw, Menu, Zap, Link2, ShieldCheck, 
  User, Lock, ChevronRight, Bell, Globe, Trello, CreditCard, 
  Users, Activity, Box, Terminal, Clock, HeartPulse
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
    className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all group relative ${
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
      <Lock size={10} className="text-gray-300" />
    ) : badge ? (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold">
        {badge}
      </span>
    ) : null}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { isSyncing, projects, tasks } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeTaskCount = tasks.filter(t => t.status !== 'Done').length;

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden">
      
      {/* Professional Sidebar */}
      <aside className={`transition-all duration-300 sidebar-border bg-workspace-sidebar flex flex-col z-30 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 pb-2 overflow-y-auto custom-scrollbar flex-1">
          {/* Professional Monogram Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 system-gradient rounded-lg flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
              FP
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-[14px] text-gray-900 tracking-tight leading-none">First Projects</h1>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Connect OS</p>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <p className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Core Registry</p>
              <NavItem 
                icon={<LayoutDashboard size={14} />} 
                label="Executive Summary" 
                isActive={currentView.type === 'DASHBOARD'} 
                onClick={() => setView({ type: 'DASHBOARD' })} 
              />
              <NavItem 
                icon={<Briefcase size={14} />} 
                label="Workspaces" 
                isActive={currentView.type === 'PROJECTS'} 
                onClick={() => setView({ type: 'PROJECTS' })} 
                badge={projects.length.toString()}
              />
              <NavItem 
                icon={<Trello size={14} />} 
                label="Kanban Boards" 
                isActive={currentView.type === 'KANBAN'} 
                onClick={() => setView({ type: 'KANBAN' })} 
                badge={activeTaskCount.toString()}
              />
            </section>

            <section>
              <p className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Operations</p>
              <NavItem 
                icon={<CreditCard size={14} />} 
                label="Financial Ledger" 
                isActive={currentView.type === 'FINANCIALS'} 
                onClick={() => setView({ type: 'FINANCIALS' })} 
              />
              <NavItem 
                icon={<Users size={14} />} 
                label="Stakeholder CRM" 
                isActive={currentView.type === 'CRM'} 
                onClick={() => setView({ type: 'CRM' })} 
              />
              <NavItem 
                icon={<Activity size={14} />} 
                label="Automations" 
                isActive={currentView.type === 'AUTOMATION'} 
                onClick={() => setView({ type: 'AUTOMATION' })} 
              />
              <NavItem 
                icon={<Box size={14} />} 
                label="Resources Matrix" 
                isActive={currentView.type === 'RESOURCES'} 
                onClick={() => setView({ type: 'RESOURCES' })} 
              />
            </section>

            <section>
              <p className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Knowledge</p>
              <NavItem 
                icon={<FileText size={14} />} 
                label="Documentation" 
                isActive={currentView.type === 'IDEAS'} 
                onClick={() => setView({ type: 'IDEAS' })} 
              />
              <NavItem 
                icon={<Palette size={14} />} 
                label="Visual Whiteboard" 
                isActive={currentView.type === 'WHITEBOARD'} 
                onClick={() => setView({ type: 'WHITEBOARD' })} 
              />
            </section>
          </div>
        </div>

        <div className="p-4 space-y-4 border-t border-gray-100">
          <div className="coming-soon-lock p-1">
            <button 
              disabled
              className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-gray-500 bg-white border border-gray-200 rounded-lg cursor-not-allowed opacity-50"
            >
              <Terminal size={12} className="text-gray-400" />
              Agentic Shell
            </button>
          </div>

          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-xs border border-gray-100 shadow-sm">
              <User size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-900 truncate leading-none mb-1">{user?.name || 'System Authorized'}</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Dron Pancholi Dev</p>
            </div>
            <button onClick={logout} className="text-gray-300 hover:text-red-500 transition-colors p-1">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="h-12 flex items-center px-8 shrink-0 border-b border-gray-100 justify-between">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 text-gray-400 hover:text-black transition-colors">
               <Menu size={18} />
             </button>
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentView.type.replace('_', ' ')}</span>
             </div>
           </div>

           <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 text-gray-400">
               <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-100">
                  <HeartPulse size={12} className="text-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">System Nominal</span>
               </div>
               <button onClick={() => setIsSpotlightOpen(true)} className="p-1 hover:text-black">
                 <Search size={18} />
               </button>
               <button className="p-1 hover:text-black relative">
                 <Bell size={18} />
                 <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
               </button>
             </div>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-[#FFFFFF] p-8 lg:p-12 scroll-smooth">
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
      
      {isVoiceActive && (
        <VoiceAssistant onClose={() => setIsVoiceActive(false)} />
      )}
    </div>
  );
};

export default Layout;
