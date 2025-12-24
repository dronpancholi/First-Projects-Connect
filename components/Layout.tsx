import React, { useState } from 'react';
import {
  LayoutDashboard, Briefcase, FileText, LogOut, Search,
  Palette, Menu, CreditCard, Users, Activity, Bell, Trello
} from 'lucide-react';
import { ViewState } from '../types.ts';
import SpotlightSearch from './SpotlightSearch.tsx';
import VoiceAssistant from './VoiceAssistant.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { GlassSidebar, GlassHeader, GlassButton } from './ui/LiquidGlass.tsx';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { projects, tasks } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeTaskCount = tasks.filter(t => t.status !== 'Done').length;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'DASHBOARD' },
    { icon: Briefcase, label: 'Workspaces', view: 'PROJECTS', badge: projects.length },
    { icon: Trello, label: 'Operations', view: 'KANBAN', badge: activeTaskCount },
    { icon: FileText, label: 'Insights', view: 'IDEAS' },
    { icon: Palette, label: 'Visual Lab', view: 'WHITEBOARD' },
    { icon: CreditCard, label: 'Financials', view: 'FINANCIALS' },
    { icon: Activity, label: 'Flows', view: 'AUTOMATION' },
    { icon: Users, label: 'Directory', view: 'CRM' },
  ];

  return (
    <div className="flex h-screen w-full app-bg">
      {/* Sidebar */}
      {isSidebarOpen && (
        <GlassSidebar className="w-64 h-full">
          {/* Logo */}
          <div className="p-5 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">FP</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">First Projects</h1>
                <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">Connect</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto hide-scrollbar">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView.type === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setView({ type: item.view as any })}
                    className={`glass-nav-item w-full ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="glass-badge text-[10px]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User */}
          <div className="p-3 border-t border-white/20">
            <button
              onClick={logout}
              className="glass-nav-item w-full group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium shadow-md">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              </div>
              <LogOut size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </GlassSidebar>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <GlassHeader>
          <div className="h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg glass-button border-transparent text-gray-600"
              >
                <Menu size={18} />
              </button>
              <span className="text-sm font-medium text-gray-600">
                {currentView.type.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSpotlightOpen(true)}
                className="flex items-center gap-2 px-4 py-2 glass-button text-gray-600 text-sm"
              >
                <Search size={14} />
                <span>Search</span>
                <kbd className="text-[10px] bg-white/60 px-1.5 py-0.5 rounded border border-gray-200/50">⌘K</kbd>
              </button>

              <button className="relative p-2 rounded-lg glass-button border-transparent text-gray-600">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
              </button>
            </div>
          </div>
        </GlassHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
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
