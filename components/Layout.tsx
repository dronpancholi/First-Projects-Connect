
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Folder, Lightbulb, Settings, Search, LogOut, Code2, PenTool, Mic, Sparkles } from 'lucide-react';
import { ViewState } from '../types';
import SpotlightSearch from './SpotlightSearch';
import VoiceAssistant from './VoiceAssistant';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

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
  badge?: React.ReactNode;
}> = ({ icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
      isActive 
        ? 'bg-white text-apple-text shadow-sm ring-1 ring-black/5' 
        : 'text-gray-500 hover:text-apple-text hover:bg-gray-100/50'
    }`}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {badge}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { needsInitialization } = useStore();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

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
    <div className="flex h-screen w-full bg-apple-gray">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-apple-border/50 bg-gray-50/80 backdrop-blur-xl flex flex-col pt-6 pb-4 px-3">
        <div className="px-3 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="text-white" size={12} />
            </div>
            <span className="font-bold text-apple-text tracking-tight text-sm">First Projects Connect</span>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="px-3 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Overview</div>
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
            label="Ideas & Notes" 
            isActive={currentView.type === 'IDEAS'} 
            onClick={() => setView({ type: 'IDEAS' })} 
          />
          
          <div className="px-3 text-xs font-semibold text-gray-400 mb-2 mt-6 uppercase tracking-wider">Studio</div>
          <NavItem 
            icon={<Code2 size={18} />} 
            label="Code Studio" 
            isActive={currentView.type === 'CODE_STUDIO'} 
            onClick={() => setView({ type: 'CODE_STUDIO' })} 
          />
          <NavItem 
            icon={<PenTool size={18} />} 
            label="Whiteboard" 
            isActive={currentView.type === 'WHITEBOARD'} 
            onClick={() => setView({ type: 'WHITEBOARD' })} 
          />
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <button 
            onClick={() => setIsVoiceActive(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 rounded-lg transition-all mb-2"
          >
            <Mic size={18} />
            <span>Voice Assistant</span>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-auto" />
          </button>

           <button 
            onClick={() => setIsSpotlightOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-apple-text transition-colors group mb-2"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Spotlight</span>
            <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded border border-gray-300 group-hover:border-gray-400">⌘K</span>
          </button>
          
          <NavItem 
            icon={<Settings size={18} />} 
            label="System Settings" 
            isActive={currentView.type === 'SETTINGS'} 
            onClick={() => setView({ type: 'SETTINGS' })} 
            badge={needsInitialization && (
              <span className="flex items-center text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold animate-pulse">
                FIX
              </span>
            )}
          />
          
          <div className="mt-4 px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-apple-blue font-bold text-xs uppercase border border-blue-200">
              {user?.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {children}
      </main>

      {/* Spotlight Modal */}
      {isSpotlightOpen && (
        <SpotlightSearch 
          isOpen={isSpotlightOpen} 
          onClose={() => setIsSpotlightOpen(false)} 
          setView={setView}
        />
      )}

      {/* Voice Assistant Overlay */}
      {isVoiceActive && (
        <VoiceAssistant onClose={() => setIsVoiceActive(false)} />
      )}
    </div>
  );
};

export default Layout;
