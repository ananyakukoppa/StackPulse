import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('User registration will be fully activated in Increment 2 with bcrypt password hashing!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 w-full flex-1 flex flex-col justify-center">
      <div className="text-center mb-8">
        <Badge variant="teal" size="sm" className="mb-3" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Private Account
        </Badge>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your StackPulse Account</h1>
        <p className="text-sm text-slate-400 mt-1.5">
          Benchmark GitHub developers and build your personal curation library.
        </p>
      </div>

      <Card padding="lg" className="border-slate-800 bg-slate-900/90 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            leftIcon={<User className="w-4 h-4" />}
            required
          />

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
            helperText="Minimum 8 characters"
            required
          />

          <Button type="submit" size="md" className="w-full mt-2" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Create Account
          </Button>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Authentication backend implementation: </span>
            <span className="text-teal-400 font-semibold">Scheduled for Increment 2</span>
          </div>
        </form>
      </Card>

      <p className="text-center text-xs text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-400 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
