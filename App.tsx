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
import { Loader2, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { LiquidGlassStrong, GlassButton } from './components/ui/LiquidGlass.tsx';

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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
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
      <div className="min-h-screen app-bg flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl mb-4">
          <button
            onClick={() => setShowSettings(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium glass-button"
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
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={32} />
          </div>
          <p className="text-sm text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <AuthenticatedApp />;
  }

  // Premium Glass Login Screen
  return (
    <div className="min-h-screen w-full flex items-center justify-center apple-bg overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -top-32 -left-32 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[500px] h-[500px] -bottom-24 -right-24 bg-gradient-to-br from-pink-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md mx-6 relative z-10">
        <LiquidGlassStrong>
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-blue-500/30">
                <span className="text-white text-3xl font-bold">FP</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">First Projects</h1>
              <p className="text-sm text-blue-600 font-medium uppercase tracking-wider mt-1">Connect</p>
            </div>

            {isRegistering ? (
              <Register onLoginClick={() => setIsRegistering(false)} />
            ) : (
              <Login
                onRegisterClick={() => setIsRegistering(true)}
                onSettingsClick={() => setShowSettings(true)}
              />
            )}

            <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
              <p className="text-xs text-gray-400">By Dron Pancholi</p>
            </div>
          </div>
        </LiquidGlassStrong>
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
