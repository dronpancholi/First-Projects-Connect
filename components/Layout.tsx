import React, { useState } from 'react';
import {
  LayoutDashboard, Briefcase, FileText, Settings, Search, LogOut,
  Palette, Menu, Zap, CreditCard, Users, Activity, Mic, Bell, Lock, Trello, Globe, HeartPulse, Clock, Sparkles
} from 'lucide-react';
import LiquidSurface from './ui/LiquidSurface.tsx';
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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-medium transition-all duration-300 group
      ${isActive
        ? 'bg-gradient-to-r from-studio-accent to-blue-500 text-white shadow-neon'
        : isLocked
          ? 'text-slate-300 cursor-not-allowed'
          : 'text-slate-500 hover:text-studio-text hover:bg-glass-200'
      }`}
  >
    <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/50'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: isActive ? 2 : 1.5 })}
    </div>
    <span className="flex-1 text-left tracking-tight">{label}</span>
    {isLocked ? (
      <Lock size={12} className="text-slate-300" />
    ) : badge ? (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${isActive ? 'bg-white/30 text-white' : 'bg-white text-slate-500'}`}>
        {badge}
      </span>
    ) : null}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { projects, tasks } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeTaskCount = tasks.filter(t => t.status !== 'Done').length;

  return (
    <div className="flex h-full w-full holo-mesh font-sans overflow-hidden text-studio-text">

      {/* Glass Sidebar */}
      <aside className={`transition-all duration-500 ease-spring z-30 flex flex-col h-full pl-4 py-4 ${isSidebarOpen ? 'w-80' : 'w-0 pl-0 py-0 opacity-0 overflow-hidden'}`}>
        <LiquidSurface
          className="h-full w-full flex flex-col"
          intensity="medium"
          radius="xl"
          distortion={true} // Enabled for premium feel
        >
          <div className="p-6 pb-2 flex-1 overflow-y-auto hide-scrollbar flex flex-col">
            {/* Brand */}
            <div className="flex items-center gap-4 mb-10 px-2 mt-2">
              <div className="w-10 h-10 bg-studio-accent rounded-xl flex items-center justify-center text-white shadow-neon backdrop-blur-md">
                <Zap size={20} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-lg text-studio-text tracking-tight leading-none">First Projects</h1>
                <p className="text-[10px] font-bold text-studio-accent uppercase tracking-widest mt-1">Connect OS</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-8 flex-1">
              <section>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Core</p>
                <div className="space-y-1">
                  <NavItem icon={<LayoutDashboard />} label="Dashboard" isActive={currentView.type === 'DASHBOARD'} onClick={() => setView({ type: 'DASHBOARD' })} />
                  <NavItem icon={<Briefcase />} label="Workspaces" isActive={currentView.type === 'PROJECTS'} onClick={() => setView({ type: 'PROJECTS' })} badge={projects.length.toString()} />
                  <NavItem icon={<Trello />} label="Operations" isActive={currentView.type === 'KANBAN'} onClick={() => setView({ type: 'KANBAN' })} badge={activeTaskCount.toString()} />
                </div>
              </section>

              <section>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Knowledge</p>
                <div className="space-y-1">
                  <NavItem icon={<FileText />} label="Insights" isActive={currentView.type === 'IDEAS'} onClick={() => setView({ type: 'IDEAS' })} />
                  <NavItem icon={<Palette />} label="Visual Lab" isActive={currentView.type === 'WHITEBOARD'} onClick={() => setView({ type: 'WHITEBOARD' })} />
                </div>
              </section>

              <section>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">System</p>
                <div className="space-y-1">
                  <NavItem icon={<CreditCard />} label="Financials" isActive={currentView.type === 'FINANCIALS'} onClick={() => setView({ type: 'FINANCIALS' })} />
                  <NavItem icon={<Activity />} label="Flows" isActive={currentView.type === 'AUTOMATION'} onClick={() => setView({ type: 'AUTOMATION' })} />
                  <NavItem icon={<Users />} label="Directory" isActive={currentView.type === 'CRM'} onClick={() => setView({ type: 'CRM' })} />
                </div>
              </section>
            </nav>

            {/* User Profile */}
            <div className="pt-6 mt-2 border-t border-white/20">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-2xl transition-all group border border-white/40 shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-white">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-bold text-studio-text truncate">{user?.name || 'User'}</p>
                  <p className="text-[9px] text-slate-500 font-medium">Online</p>
                </div>
                <LogOut size={16} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
              </button>
            </div>
          </div>
        </LiquidSurface>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Floating Header */}
        <header className="h-24 flex items-center px-10 shrink-0 justify-between z-20">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 text-studio-text hover:bg-white/50 rounded-xl transition-all glass-light">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3 glass-light px-4 py-2 rounded-full">
              <div className="h-2 w-2 rounded-full bg-studio-accent animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentView.type.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSpotlightOpen(true)}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-base hover:bg-white/60 transition-all text-slate-500 hover:text-studio-text group shadow-glass-sm"
            >
              <Search size={16} />
              <span className="text-xs font-medium">Search knowledge...</span>
              <div className="flex gap-1 ml-6">
                <span className="w-5 h-5 flex items-center justify-center rounded-md bg-white/50 text-[10px] font-bold text-slate-400 border border-white/50">⌘</span>
                <span className="w-5 h-5 flex items-center justify-center rounded-md bg-white/50 text-[10px] font-bold text-slate-400 border border-white/50">K</span>
              </div>
            </button>

            <button onClick={() => setIsVoiceActive(true)} className="p-3 rounded-full glass-base hover:bg-studio-accent hover:text-white transition-all text-slate-500">
              <Mic size={20} />
            </button>

            <button className="relative p-3 rounded-full glass-base hover:bg-white/60 transition-all text-slate-500">
              <Bell size={20} />
              <span className="absolute top-3 right-3.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-10 pb-10 scroll-smooth">
          <div className="max-w-[1400px] mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isSpotlightOpen && (<SpotlightSearch isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} setView={setView} />)}
      {isVoiceActive && (<VoiceAssistant onClose={() => setIsVoiceActive(false)} />)}
    </div>
  );
};

export default Layout;
