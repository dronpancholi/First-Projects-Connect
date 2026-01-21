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
import { ConnectionStatus } from './ConnectionStatus.tsx';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { projects, tasks } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
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
        <GlassSidebar className="w-72 h-full">
          {/* Logo */}
          <div className="p-6 border-b border-glass-border-subtle">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center shadow-xl"
                style={{ boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)' }}>
                <span className="text-glass-primary text-lg font-bold">FP</span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-glass-primary">First Projects</h1>
                <p className="text-xs text-glass-secondary font-medium uppercase tracking-wider">Connect</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto hide-scrollbar">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView.type === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setView({ type: item.view as any })}
                    className={`glass-nav-item w-full ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="glass-badge">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User */}
          <div className="p-4 border-t border-glass-border-subtle flex flex-col gap-3">
            <button
              onClick={logout}
              className="glass-nav-item w-full group"
            >
              <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-glass-primary text-sm font-medium">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-glass-primary truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-glass-secondary">Logout</p>
              </div>
              <LogOut size={16} className="text-glass-secondary group-hover:text-red-400 transition-colors" />
            </button>
            <ConnectionStatus />
          </div>
        </GlassSidebar>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <GlassHeader>
          <div className="h-16 px-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="glass-button p-3 border-transparent"
              >
                <Menu size={20} className="text-glass-primary" />
              </button>
              <span className="text-base font-medium text-glass-primary">
                {currentView.type.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSpotlightOpen(true)}
                className="flex items-center gap-3 px-5 py-2.5 glass-button"
              >
                <Search size={16} />
                <span>Search</span>
                <kbd className="text-xs glass-badge px-2 py-0.5">⌘K</kbd>
              </button>

              <button className="relative glass-button p-3 border-transparent">
                <Bell size={20} className="text-glass-primary" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-glass-border" />
              </button>
            </div>
          </div>
        </GlassHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isSpotlightOpen && <SpotlightSearch isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} setView={setView} />}
      <VoiceAssistant setView={setView} />
    </div>
  );
};

export default Layout;
