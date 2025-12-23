
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
        ? 'bg-yellow-400 text-black shadow-sm' 
        : isLocked 
          ? 'text-gray-300 cursor-not-allowed' 
          : 'text-gray-500 hover:text-black hover:bg-gray-50'
    }`}
  >
    <span className={`${isActive ? 'text-black' : 'text-gray-400 group-hover:text-yellow-600'}`}>
      {icon}
    </span>
    <span className="flex-1 text-left tracking-tight">{label}</span>
    {isLocked ? (
      <Lock size={10} className="text-gray-300" />
    ) : badge ? (
      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-black text-white' : 'bg-yellow-50 text-yellow-600'}`}>
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
      
      {/* Industrial Sidebar */}
      <aside className={`transition-all duration-300 sidebar-border bg-workspace-sidebar flex flex-col z-30 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 pb-2 overflow-y-auto custom-scrollbar flex-1">
          {/* Industrial Brand Monogram */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 system-gradient rounded-xl flex items-center justify-center text-black font-display font-black text-xl shadow-lg border-2 border-white">
              FP
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-black text-[15px] text-gray-900 tracking-tighter leading-none">First Projects</h1>
              <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest mt-1">Industrial OS</p>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <p className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3">Core Registry</p>
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
              <p className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3">Operations</p>
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
                label="Resource Matrix" 
                isActive={currentView.type === 'RESOURCES'} 
                onClick={() => setView({ type: 'RESOURCES' })} 
              />
            </section>

            <section>
              <p className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3">Knowledge</p>
              <NavItem 
                icon={<FileText size={14} />} 
                label="Documentation" 
                isActive={currentView.type === 'IDEAS'} 
                onClick={() => setView({ type: 'IDEAS' })} 
              />
              <NavItem 
                icon={<Palette size={14} />} 
                label="Visual Lab" 
                isActive={currentView.type === 'WHITEBOARD'} 
                onClick={() => setView({ type: 'WHITEBOARD' })} 
              />
            </section>
          </div>
        </div>

        <div className="p-4 space-y-4 border-t border-gray-100 bg-gray-50/30">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-black text-xs border border-white">
              <User size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-gray-900 truncate leading-none mb-1">{user?.name || 'Authorized'}</p>
              <p className="text-[8px] font-black text-yellow-500 uppercase tracking-tighter">System Root</p>
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
             <nav className="flex items-center gap-2">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{currentView.type.replace('_', ' ')}</span>
             </nav>
           </div>

           <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 text-gray-400">
               <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 border border-yellow-100 rounded">
                  <HeartPulse size={12} className="text-yellow-600 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-yellow-700">System Nominal</span>
               </div>
               <button onClick={() => setIsSpotlightOpen(true)} className="p-1 hover:text-black transition-colors">
                 <Search size={18} />
               </button>
               <button onClick={() => setIsVoiceActive(true)} className="p-1 hover:text-yellow-500 transition-colors">
                 <Zap size={18} />
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
