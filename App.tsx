import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import ProjectList from './components/ProjectList.tsx';
import ProjectDetail from './components/ProjectDetail.tsx';
import IdeasView from './components/IdeasView.tsx';
import Whiteboard from './components/Whiteboard.tsx';
import KanbanView from './components/KanbanView.tsx';
import FinancialOps from './components/FinancialOps.tsx';
import CRMView from './components/CRMView.tsx';
import AutomationEngine from './components/AutomationEngine.tsx';
import ResourcesView from './components/ResourcesView.tsx';
import Login from './components/Auth/Login.tsx';
import Register from './components/Auth/Register.tsx';
import Settings from './components/Settings.tsx'; // Assuming Settings component exists
import { ViewState } from './types.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { GlassButton } from './components/ui/LiquidGlass.tsx';

const AuthenticatedApp: React.FC = () => {
  const [currentView, setView] = useState<ViewState>({ type: 'DASHBOARD' });
  const { isLoading } = useAuth();

  const renderView = () => {
    switch (currentView.type) {
      case 'DASHBOARD': return <Dashboard setView={setView} />;
      case 'PROJECTS': return <ProjectList setView={setView} />;
      case 'PROJECT_DETAIL': return <ProjectDetail projectId={currentView.projectId} onBack={() => setView({ type: 'PROJECTS' })} />;
      case 'KANBAN': return <KanbanView setView={setView} />;
      case 'FINANCIALS': return <FinancialOps setView={setView} />;
      case 'CRM': return <CRMView setView={setView} />;
      case 'AUTOMATION': return <AutomationEngine setView={setView} />;
      case 'RESOURCES': return <ResourcesView setView={setView} />;
      case 'IDEAS': return <IdeasView />;
      case 'WHITEBOARD': return <Whiteboard />;
      case 'SETTINGS': return <Settings />;
      default: return <Dashboard setView={setView} />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center app-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={28} />
          </div>
          <p className="text-sm text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <StoreProvider>
      <Layout currentView={currentView} setView={setView}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView.type}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </StoreProvider>
  );
};

const AuthFlow: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return (
      <div className="min-h-screen app-bg flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl mb-4">
          <button
            onClick={() => setShowSettings(false)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium glass-button"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <Settings />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center apple-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={36} />
          </div>
          <p className="text-sm text-white/70">Initializing...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <AuthenticatedApp />;
  }

  // Premium Liquid Glass Login Screen
  return (
    <div className="min-h-screen w-full flex items-center justify-center apple-bg overflow-hidden">
      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[700px] h-[700px] -top-40 -left-40 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] -bottom-32 -right-32 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse'
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] top-1/3 left-1/4 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            animation: 'float 15s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] bottom-1/4 right-1/4 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
            animation: 'float 18s ease-in-out infinite reverse'
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(15px, 15px) scale(1.02); }
        }
      `}</style>

      <div className="w-full max-w-md mx-6 relative z-10">
        <div className="glass-modal p-10 animate-fade-in relative">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl glass-card flex items-center justify-center shadow-2xl"
              style={{ boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)' }}>
              <span className="text-white text-4xl font-bold">FP</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">First Projects</h1>
            <p className="text-sm text-white/60 font-medium uppercase tracking-widest">Connect</p>
          </div>

          {isRegistering ? (
            <Register onLoginClick={() => setIsRegistering(false)} />
          ) : (
            <Login
              onRegisterClick={() => setIsRegistering(true)}
              onSettingsClick={() => setShowSettings(true)}
            />
          )}

          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-white/40">Crafted by Dron Pancholi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthFlow />
    </AuthProvider>
  );
};

export default App;
