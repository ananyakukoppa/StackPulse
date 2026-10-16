import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email.trim(), password, name.trim() || undefined);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 w-full flex-1 flex flex-col justify-center">
      <div className="text-center mb-8">
        <Badge variant="teal" size="sm" className="mb-3" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Private Account
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create your Account</h1>
        <p className="text-sm text-slate-400 mt-2">
          Start benchmarking GitHub developers and curating favorite repositories.
        </p>
      </div>

      <Card padding="lg" className="border-slate-800 bg-slate-900/90 shadow-xl shadow-black/40">
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            leftIcon={<User className="w-4 h-4" />}
            required
            autoComplete="name"
          />

          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            helperText="Minimum 6 characters"
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            size="md"
            className="w-full mt-2"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account
          </Button>

          <div className="pt-2 text-center text-xs text-slate-500">
            By registering, you agree to our privacy policy and terms.
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
