
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Layout from './components/Layout.tsx';
import PersonalDashboard from './components/dashboard/PersonalDashboard.tsx';
import TeamDashboard from './components/dashboard/TeamDashboard.tsx';
import SharedRoadmap from './components/team/SharedRoadmap.tsx';
import LiveSessionPanel from './components/team/LiveSessionPanel.tsx';
import MemberPerformance from './components/team/MemberPerformance.tsx';
import TeamAdmin from './components/team/TeamAdmin.tsx';
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
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';

// Guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center app-bg">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Guard for public routes (redirect to dashboard if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <LoginWrapper />
            </AuthLayout>
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <AuthLayout>
              <RegisterWrapper />
            </AuthLayout>
          </PublicRoute>
        } />

        <Route path="/*" element={
          <ProtectedRoute>
            <StoreProvider>
              <MainApp />
            </StoreProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

// Wrappers to adapt props
const LoginWrapper = () => {
  const [isRegistering, setIsRegistering] = useState(false); // Local state if we want to toggle within same route? 
  // Actually better to use Link to navigate, but for now adapting existing component props
  // We can just render Login and ignore the props if we update Login to not need them or just pass dummies/navigation functions
  const navigate = (path: string) => window.location.hash = path; // Temporary hack or use useNavigate

  // Cleanest way: Just render Login/Register and use Link inside them. 
  // But Login accepts onRegisterClick.
  return <Login onRegisterClick={() => window.location.pathname = '/register'} onSettingsClick={() => { }} />;
};

const RegisterWrapper = () => {
  return <Register onLoginClick={() => window.location.pathname = '/login'} />;
};


// Auth Layout (Liquid Glass Background)
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center apple-bg overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[700px] h-[700px] -top-40 -left-40 rounded-full blur-3xl opacity-40 bg-purple-500 animate-pulse" />
        <div className="absolute w-[600px] h-[600px] -bottom-32 -right-32 rounded-full blur-3xl opacity-40 bg-pink-500 animate-pulse delay-700" />
      </div>
      <div className="w-full max-w-md mx-6 relative z-10">
        <div className="glass-modal p-10 animate-fade-in relative">
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl glass-card flex items-center justify-center shadow-2xl"
              style={{ boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)' }}>
              <span className="text-white text-4xl font-bold">FP</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">First Projects</h1>
            <p className="text-sm text-white/60 font-medium uppercase tracking-widest">Connect</p>
          </div>
          {children}
          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-white/40">Crafted by Dron Pancholi</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const MainApp = () => {
  const [currentView, setView] = useState<ViewState>({ type: 'DASHBOARD' });
  // TODO: Sync `currentView` with URL parameters using useNavigate/useParams
  // For now keeping manual state to assume "Single Page" feel but inside a protected route.
  // Later we can fully route each view.

  const renderView = () => {
    switch (currentView.type) {
      case 'DASHBOARD': return <PersonalDashboard setView={setView} />;
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
      case 'TEAM_DASHBOARD': return <TeamDashboard setView={setView} />;
      case 'SHARED_ROADMAP': return <SharedRoadmap />;
      case 'LIVE_SESSION': return <LiveSessionPanel />;
      case 'MEMBER_PERFORMANCE': return <MemberPerformance />;
      case 'TEAM_ADMIN': return <TeamAdmin />;
      default: return <PersonalDashboard setView={setView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setView}>
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
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
