import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './services/supabaseClient';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import IdeasView from './components/IdeasView';
import CodeStudio from './components/CodeStudio';
import Whiteboard from './components/Whiteboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Settings from './components/Settings';
import { ViewState } from './types';
import { Loader2, ArrowLeft } from 'lucide-react';

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
      case 'IDEAS':
        return <IdeasView />;
      case 'CODE_STUDIO':
        return <CodeStudio />;
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
      <div className="h-screen w-full flex items-center justify-center bg-apple-gray">
        <Loader2 className="animate-spin text-gray-400" size={32} />
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

  // If showing settings (triggered from Login)
  if (showSettings) {
    return (
      <div className="min-h-screen bg-apple-gray flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mb-4">
          <button 
            onClick={() => setShowSettings(false)}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium px-2 py-1"
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
      <div className="h-screen w-full flex items-center justify-center bg-apple-gray">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (user) {
    return <AuthenticatedApp />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F7] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"></div>
      
      {isRegistering ? (
        <Register onLoginClick={() => setIsRegistering(false)} />
      ) : (
        <Login 
          onRegisterClick={() => setIsRegistering(true)} 
          onSettingsClick={() => setShowSettings(true)}
        />
      )}
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