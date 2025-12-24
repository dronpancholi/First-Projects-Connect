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
import Settings from './components/Settings.tsx';
import { ViewState } from './types.ts';
import { Loader2, ArrowLeft } from 'lucide-react';
import LiquidSurface from './components/ui/LiquidSurface.tsx';

const AuthenticatedApp: React.FC = () => {
  const [currentView, setView] = useState<ViewState>({ type: 'DASHBOARD' });
  const { isLoading } = useAuth();

  const renderView = () => {
    switch (currentView.type) {
      case 'DASHBOARD':
        return <Dashboard setView={setView} />;
      case 'PROJECTS':
        return <ProjectList setView={setView} />;
      case 'PROJECT_DETAIL':
        return <ProjectDetail projectId={currentView.projectId} onBack={() => setView({ type: 'PROJECTS' })} />;
      case 'KANBAN':
        return <KanbanView setView={setView} />;
      case 'FINANCIALS':
        return <FinancialOps setView={setView} />;
      case 'CRM':
        return <CRMView setView={setView} />;
      case 'AUTOMATION':
        return <AutomationEngine setView={setView} />;
      case 'RESOURCES':
        return <ResourcesView setView={setView} />;
      case 'IDEAS':
        return <IdeasView />;
      case 'WHITEBOARD':
        return <Whiteboard />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Dashboard setView={setView} />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center holo-mesh">
        <Loader2 className="animate-spin text-studio-accent" size={32} />
      </div>
    );
  }

  return (
    <StoreProvider>
      <Layout currentView={currentView} setView={setView}>
        {renderView()}
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
      <div className="h-full w-full holo-mesh flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mb-4 relative z-10">
          <button
            onClick={() => setShowSettings(false)}
            className="flex items-center gap-2 text-studio-muted hover:text-studio-text transition-colors font-medium px-4 py-2 glass-light rounded-xl hover:bg-white/50"
          >
            <ArrowLeft size={18} /> Back to Login
          </button>
        </div>
        <Settings />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center holo-mesh">
        <Loader2 className="animate-spin text-studio-accent" size={32} />
      </div>
    );
  }

  if (user) {
    return <AuthenticatedApp />;
  }

  return (
    <div className="h-full w-full flex items-center justify-center holo-mesh relative overflow-hidden p-6">

      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />

      {/* Main Glass Monolith */}
      <LiquidSurface
        className="w-full max-w-md relative z-10"
        intensity="high"
        radius="xl"
        distortion={true}
      >
        <div className="p-1"> {/* Padding for inner spacing */}
          {isRegistering ? (
            // Pass transparent prop or wrap in div if Register expects it
            <div className="bg-transparent">
              <Register onLoginClick={() => setIsRegistering(false)} />
            </div>
          ) : (
            <div className="bg-transparent">
              <Login
                onRegisterClick={() => setIsRegistering(true)}
                onSettingsClick={() => setShowSettings(true)}
              />
            </div>
          )}
        </div>
      </LiquidSurface>

      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] uppercase tracking-[0.2em] text-studio-muted font-bold opacity-60">First Projects Connect System</p>
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
