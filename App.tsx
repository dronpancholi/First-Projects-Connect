
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
import LiquidGlass from './components/ui/LiquidGlass.tsx';

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
      <div className="h-screen w-full flex items-center justify-center mesh-gradient">
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
      <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mb-4">
          <button
            onClick={() => setShowSettings(false)}
            className="flex items-center gap-2 text-studio-muted hover:text-studio-text transition-colors font-medium px-2 py-1 glass rounded-lg"
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
      <div className="h-screen w-full flex items-center justify-center mesh-gradient">
        <Loader2 className="animate-spin text-studio-accent" size={32} />
      </div>
    );
  }

  if (user) {
    return <AuthenticatedApp />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center mesh-gradient relative overflow-hidden">
      <LiquidGlass
        displacementScale={50}
        blurAmount={0.3}
        saturation={110}
        elasticity={0.4}
        cornerRadius={48}
        padding="0px"
      >
        <div className="bg-white/30 backdrop-blur-md p-2 rounded-[3rem] border border-white/40 shadow-2xl">
          {isRegistering ? (
            <Register onLoginClick={() => setIsRegistering(false)} />
          ) : (
            <Login
              onRegisterClick={() => setIsRegistering(true)}
              onSettingsClick={() => setShowSettings(true)}
            />
          )}
        </div>
      </LiquidGlass>
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
