import React, { useState, useEffect } from 'react';
import { LayoutGrid, Folder, Lightbulb, Settings, Search, LogOut } from 'lucide-react';
import { ViewState } from '../types';
import SpotlightSearch from './SpotlightSearch';
import { useAuth } from '../context/AuthContext';

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
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-white text-apple-text shadow-sm ring-1 ring-black/5' 
        : 'text-gray-500 hover:text-apple-text hover:bg-gray-100/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

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
        <div className="px-3 mb-8 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <span className="font-semibold text-apple-text tracking-tight">Nexus</span>
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
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
           <button 
            onClick={() => setIsSpotlightOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-apple-text transition-colors group mb-2"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Quick Search</span>
            <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded border border-gray-300 group-hover:border-gray-400">⌘K</span>
          </button>
          
          <NavItem 
            icon={<Settings size={18} />} 
            label="Settings" 
            isActive={currentView.type === 'SETTINGS'} 
            onClick={() => setView({ type: 'SETTINGS' })} 
          />
          
          <div className="mt-4 px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-apple-blue font-bold text-xs uppercase">
              {user?.name.slice(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
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
    </div>
  );
};

export default Layout;
