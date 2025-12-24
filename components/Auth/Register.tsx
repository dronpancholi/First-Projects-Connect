import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Loader2, ArrowRight } from 'lucide-react';
import { GlassButton, GlassInput } from '../ui/LiquidGlass.tsx';

interface RegisterProps {
  onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLoginClick }) => {
  const { register, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
          <GlassInput
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
          <GlassInput
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
          <GlassInput
            type="password"
            placeholder="Create a strong password"
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
            <>Create Account <ArrowRight size={16} /></>
          )}
        </GlassButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={onLoginClick} className="text-blue-600 hover:underline font-medium">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
