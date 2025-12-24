import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Loader2, ArrowRight, Settings } from 'lucide-react';
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
      <button
        onClick={onSettingsClick}
        className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100/50"
        title="Settings"
      >
        <Settings size={18} />
      </button>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
          <GlassInput
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
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
          className="w-full flex items-center justify-center gap-2 py-3"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>Continue <ArrowRight size={16} /></>
          )}
        </GlassButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          New here?{' '}
          <button onClick={onRegisterClick} className="text-blue-600 hover:underline font-medium">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
