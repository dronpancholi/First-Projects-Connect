
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Loader2, ArrowRight, Settings, Database, Sparkles } from 'lucide-react';

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
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-gray-100 relative">
      <button 
        onClick={onSettingsClick}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black transition-colors"
        title="Settings"
      >
        <Settings size={20} />
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-blue/20">
           <Sparkles className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">First Projects Connect</h2>
        <p className="text-sm text-gray-500 mt-2">Sign in to your professional workspace.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center justify-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Identity</label>
          <input 
            type="email" 
            required
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all text-sm font-medium"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Access Key</label>
          <input 
            type="password" 
            required
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all text-sm font-medium"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-brand-label text-white font-bold py-4 rounded-2xl mt-4 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-black/5"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Enter Workspace <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          New to the ecosystem?{' '}
          <button onClick={onRegisterClick} className="text-brand-blue hover:underline font-bold">Initialize Identity</button>
        </p>
        <div className="mt-10 pt-6 border-t border-gray-50">
          <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Developed by Dron Pancholi</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
