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
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-medium transition-all btn-tactile ${isActive
      ? 'bg-studio-accent text-white shadow-lg shadow-blue-500/30'
      : isLocked
        ? 'text-slate-300 cursor-not-allowed'
        : 'text-slate-500 hover:text-studio-text hover:bg-black/5'
      }`}
  >
    <span className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: isActive ? 2 : 1.5 })}
    </span>
    <span className="flex-1 text-left tracking-tight">{label}</span>
    {isLocked ? (
      <Lock size={12} className="text-slate-300" />
    ) : badge ? (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
    <div className="flex h-screen w-full mesh-gradient font-sans overflow-hidden text-studio-text">

      {/* Studio Sidebar */}
      <aside className={`transition-all duration-500 glass-sidebar z-30 flex flex-col ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 pb-4 flex-1 overflow-y-auto hide-scrollbar">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-studio-accent rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,122,255,0.4)] backdrop-blur-md">
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-lg text-studio-text tracking-tight leading-none">First Projects</h1>
              <p className="text-[10px] font-bold text-studio-accent uppercase tracking-widest mt-1">Connect</p>
            </div>
          </div>

          <div className="mb-8 px-4 py-2 rounded-xl bg-white/40 backdrop-blur-sm border border-white/40">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide text-center">Developed by Dron Pancholi</p>
          </div>

          <nav className="space-y-10">
            <section>
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Core</p>
              <div className="space-y-1">
                <NavItem icon={<LayoutDashboard />} label="Dashboard" isActive={currentView.type === 'DASHBOARD'} onClick={() => setView({ type: 'DASHBOARD' })} />
                <NavItem icon={<Briefcase />} label="Workspaces" isActive={currentView.type === 'PROJECTS'} onClick={() => setView({ type: 'PROJECTS' })} badge={projects.length.toString()} />
                <NavItem icon={<Trello />} label="Operations" isActive={currentView.type === 'KANBAN'} onClick={() => setView({ type: 'KANBAN' })} badge={activeTaskCount.toString()} />
              </div>
            </section>

            <section>
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Knowledge</p>
              <div className="space-y-1">
                <NavItem icon={<FileText />} label="Insights" isActive={currentView.type === 'IDEAS'} onClick={() => setView({ type: 'IDEAS' })} />
                <NavItem icon={<Palette />} label="Visual Lab" isActive={currentView.type === 'WHITEBOARD'} onClick={() => setView({ type: 'WHITEBOARD' })} />
              </div>
            </section>

            <section>
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">System</p>
              <div className="space-y-1">
                <NavItem icon={<CreditCard />} label="Financials" isActive={currentView.type === 'FINANCIALS'} onClick={() => setView({ type: 'FINANCIALS' })} />
                <NavItem icon={<Activity />} label="Flows" isActive={currentView.type === 'AUTOMATION'} onClick={() => setView({ type: 'AUTOMATION' })} />
                <NavItem icon={<Users />} label="Directory" isActive={currentView.type === 'CRM'} onClick={() => setView({ type: 'CRM' })} />
              </div>
            </section>
          </nav>
        </div>

        <div className="p-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 bg-white/50 hover:bg-white/80 backdrop-blur-md rounded-[1.5rem] transition-all group border border-white/50"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-bold text-studio-text truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 font-medium">Session Active</p>
            </div>
            <LogOut size={14} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 flex items-center px-10 shrink-0 justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:text-studio-text transition-colors btn-tactile">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-studio-accent" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{currentView.type.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <button onClick={() => setIsSpotlightOpen(true)} className="p-2 text-slate-500 hover:text-studio-text transition-colors"><Search size={18} /></button>
              <div className="w-px h-4 bg-slate-200" />
              <button onClick={() => setIsVoiceActive(true)} className="p-2 text-slate-500 hover:text-studio-accent transition-colors"><Sparkles size={18} /></button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10 lg:p-14 scroll-smooth">
          <div className="max-w-7xl mx-auto">
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
