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
import { Loader2, ArrowLeft, Zap } from 'lucide-react';

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
      <div className="h-full w-full flex items-center justify-center animated-bg">
        <Loader2 className="animate-spin text-blue-500" size={40} />
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
      <div className="min-h-screen animated-bg flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl mb-4">
          <button
            onClick={() => setShowSettings(false)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium px-4 py-2 rounded-xl hover:bg-white/50"
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
      <div className="h-screen w-full flex items-center justify-center animated-bg">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (user) {
    return <AuthenticatedApp />;
  }

  // Login Screen
  return (
    <div className="min-h-screen w-full flex items-center justify-center animated-bg relative overflow-hidden p-6">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 float-animation" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 float-animation" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 float-animation" style={{ animationDelay: '1.5s' }} />

      {/* Login Card */}
      <div className="glass-card-heavy p-10 w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Zap size={28} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">First Projects</h1>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mt-1">Connect</p>
        </div>

        {isRegistering ? (
          <Register onLoginClick={() => setIsRegistering(false)} />
        ) : (
          <Login
            onRegisterClick={() => setIsRegistering(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Developed by Dron Pancholi</p>
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
