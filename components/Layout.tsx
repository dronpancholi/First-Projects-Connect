
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
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-medium transition-all btn-tactile ${
      isActive 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
        : isLocked 
          ? 'text-slate-300 cursor-not-allowed' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    <span className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: isActive ? 2 : 1.5 })}
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
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Studio Sidebar */}
      <aside className={`transition-all duration-500 bg-white border-r border-slate-100 flex flex-col z-30 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 pb-4 flex-1 overflow-y-auto no-scrollbar">
          {/* Studio Brand */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-lg text-slate-900 tracking-tight leading-none">Connect</h1>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Design Studio</p>
            </div>
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
            className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-[1.5rem] transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 font-medium">Session Active</p>
            </div>
            <LogOut size={14} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        <header className="h-20 flex items-center px-10 shrink-0 justify-between">
           <div className="flex items-center gap-6">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors btn-tactile">
               <Menu size={20} />
             </button>
             <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{currentView.type.replace('_', ' ')}</span>
             </div>
           </div>

           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full studio-shadow border border-slate-100">
               <button onClick={() => setIsSpotlightOpen(true)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Search size={18} /></button>
               <div className="w-px h-4 bg-slate-100" />
               <button onClick={() => setIsVoiceActive(true)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Sparkles size={18} /></button>
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
