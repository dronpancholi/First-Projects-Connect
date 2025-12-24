import React, { useState } from 'react';
import {
  LayoutDashboard, Briefcase, FileText, LogOut, Search,
  Palette, Menu, Zap, CreditCard, Users, Activity, Mic, Bell, Trello
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
}> = ({ icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`nav-item w-full ${isActive ? 'active' : ''}`}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
        {badge}
      </span>
    )}
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
    <div className="flex h-screen w-full animated-bg overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`glass-sidebar h-full flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
          }`}
      >
        <div className="p-6 flex-1 overflow-y-auto hide-scrollbar">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">First Projects</h1>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Connect</p>
            </div>
          </div>

          {/* Developer Credit */}
          <div className="mb-6 px-3 py-2 rounded-xl bg-white/50 border border-white/60 text-center">
            <p className="text-xs text-gray-500">By Dron Pancholi</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Core</p>
              <div className="space-y-1">
                <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" isActive={currentView.type === 'DASHBOARD'} onClick={() => setView({ type: 'DASHBOARD' })} />
                <NavItem icon={<Briefcase size={18} />} label="Workspaces" isActive={currentView.type === 'PROJECTS'} onClick={() => setView({ type: 'PROJECTS' })} badge={projects.length.toString()} />
                <NavItem icon={<Trello size={18} />} label="Operations" isActive={currentView.type === 'KANBAN'} onClick={() => setView({ type: 'KANBAN' })} badge={activeTaskCount.toString()} />
              </div>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Knowledge</p>
              <div className="space-y-1">
                <NavItem icon={<FileText size={18} />} label="Insights" isActive={currentView.type === 'IDEAS'} onClick={() => setView({ type: 'IDEAS' })} />
                <NavItem icon={<Palette size={18} />} label="Visual Lab" isActive={currentView.type === 'WHITEBOARD'} onClick={() => setView({ type: 'WHITEBOARD' })} />
              </div>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
              <div className="space-y-1">
                <NavItem icon={<CreditCard size={18} />} label="Financials" isActive={currentView.type === 'FINANCIALS'} onClick={() => setView({ type: 'FINANCIALS' })} />
                <NavItem icon={<Activity size={18} />} label="Flows" isActive={currentView.type === 'AUTOMATION'} onClick={() => setView({ type: 'AUTOMATION' })} />
                <NavItem icon={<Users size={18} />} label="Directory" isActive={currentView.type === 'CRM'} onClick={() => setView({ type: 'CRM' })} />
              </div>
            </div>
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/30">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between shrink-0 border-b border-white/30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-white/50 transition-all text-gray-600"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                {currentView.type.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSpotlightOpen(true)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/50 hover:bg-white/70 border border-white/60 transition-all text-gray-500"
            >
              <Search size={16} />
              <span className="text-sm">Search...</span>
              <div className="flex gap-1 ml-4">
                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-xs font-medium">⌘</span>
                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-xs font-medium">K</span>
              </div>
            </button>

            <button
              onClick={() => setIsVoiceActive(true)}
              className="p-2.5 rounded-xl bg-white/50 hover:bg-white/70 border border-white/60 transition-all text-gray-500"
            >
              <Mic size={18} />
            </button>

            <button className="relative p-2.5 rounded-xl bg-white/50 hover:bg-white/70 border border-white/60 transition-all text-gray-500">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isSpotlightOpen && <SpotlightSearch isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} setView={setView} />}
      {isVoiceActive && <VoiceAssistant onClose={() => setIsVoiceActive(false)} />}
    </div>
  );
};

export default Layout;
