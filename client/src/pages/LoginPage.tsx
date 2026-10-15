import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Authentication flow will be fully activated in Increment 2 with JWT sessions!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 w-full flex-1 flex flex-col justify-center">
      <div className="text-center mb-8">
        <Badge variant="teal" size="sm" className="mb-3" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Secure Session
        </Badge>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to StackPulse</h1>
        <p className="text-sm text-slate-400 mt-1.5">
          Access your pinned repositories, custom notes, and saved comparisons.
        </p>
      </div>

      <Card padding="lg" className="border-slate-800 bg-slate-900/90 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" size="md" className="w-full mt-2" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Sign In
          </Button>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Authentication backend implementation: </span>
            <span className="text-teal-400 font-semibold">Scheduled for Increment 2</span>
          </div>
        </form>
      </Card>

      <p className="text-center text-xs text-slate-400 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-teal-400 hover:underline font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
