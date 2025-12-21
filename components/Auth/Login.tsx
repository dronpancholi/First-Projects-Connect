
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Loader2, ArrowRight, Settings, Sparkles } from 'lucide-react';

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
    <div className="w-full max-w-sm p-10 bg-white rounded-2xl shadow-2xl border border-gray-100 relative">
      <button 
        onClick={onSettingsClick}
        className="absolute top-8 right-8 p-2 text-gray-300 hover:text-black transition-colors"
        title="Settings"
      >
        <Settings size={20} />
      </button>

      <div className="text-center mb-10">
        <div className="w-16 h-16 system-gradient rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-indigo-100 text-white font-display font-bold text-3xl">
           FP
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">Ecosystem Login</h2>
        <p className="text-sm text-gray-400 mt-2 font-medium">Access your professional workspace.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center justify-center font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Professional Identity</label>
          <input 
            type="email" 
            required
            className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-indigo-600 focus:bg-white outline-none transition-all text-sm font-medium"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Access Credentials</label>
          <input 
            type="password" 
            required
            className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-indigo-600 focus:bg-white outline-none transition-all text-sm font-medium"
            placeholder="Security password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl mt-4 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-xl"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Continue to Workspace <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-400">
          New to First Projects?{' '}
          <button onClick={onRegisterClick} className="text-indigo-600 hover:underline font-bold">Initialize Identity</button>
        </p>
        <div className="mt-12 pt-6 border-t border-gray-50">
          <p className="text-[10px] font-bold uppercase text-gray-300 tracking-widest">First Projects Connect • Dron Pancholi</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
