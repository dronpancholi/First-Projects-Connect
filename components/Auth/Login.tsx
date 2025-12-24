import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Loader2, ArrowRight } from 'lucide-react';
import { GlassButton, GlassInput } from '../ui/LiquidGlass.tsx';

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
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 glass-card border-red-500/30 bg-red-500/10 rounded-xl text-sm text-red-300 font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Email</label>
          <GlassInput
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Password</label>
          <GlassInput
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <GlassButton
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-4 text-base"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>Continue <ArrowRight size={18} /></>
          )}
        </GlassButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-white/40">
          New here?{' '}
          <button onClick={onRegisterClick} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
