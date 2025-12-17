
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Loader2, ArrowRight, Settings, Database } from 'lucide-react';

interface LoginProps {
  onRegisterClick: () => void;
  onSettingsClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick, onSettingsClick }) => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 relative">
      <button 
        onClick={onSettingsClick}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
        title="Settings"
      >
        <Settings size={20} />
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-black rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg">
           <span className="text-white font-bold text-xl">F</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">First Projects Connect</h2>
        <p className="text-sm text-gray-500 mt-2">Sign in to your personal ecosystem.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center justify-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
          <input 
            type="email" 
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
          <input 
            type="password" 
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="button"
          onClick={onSettingsClick}
          className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Database size={16} /> Connection Settings
        </button>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Enter Ecosystem <ArrowRight size={16} /></>}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button onClick={onRegisterClick} className="text-blue-600 hover:underline font-medium">Create ID</button>
      </div>
    </div>
  );
};

export default Login;
