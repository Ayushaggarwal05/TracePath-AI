import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { useToast } from '../hooks/useToast';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  X,
} from 'lucide-react';

interface AuthPageProps {
  onSuccess?: (targetRoute: 'dashboard' | 'connect') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { login, signup } = useAuth();
  const { success, error } = useToast();

  // Dynamic Password Validation Checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_+=]/.test(password);

  const passedChecksCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const getStrengthMeta = () => {
    if (passedChecksCount <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400', width: 'w-1/4' };
    if (passedChecksCount === 3) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400', width: 'w-2/4' };
    if (passedChecksCount === 4) return { label: 'Good', color: 'bg-indigo-400', text: 'text-indigo-400', width: 'w-3/4' };
    return { label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-400', width: 'w-full' };
  };

  const strength = getStrengthMeta();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup' && !isPasswordValid) {
      setAuthError('Please fulfill all password security requirements before creating an account.');
      return;
    }

    if (mode === 'login' && !password) {
      setAuthError('Please enter your password.');
      return;
    }

    try {
      setSubmitting(true);
      if (mode === 'signup') {
        await signup(email, password);
        success('Account Created!', 'Welcome to TracePath AI!');
        if (onSuccess) {
          onSuccess('connect');
        }
      } else {
        const user = await login(email, password);
        success('Welcome Back!', `Logged in as ${user.email}`);
        if (onSuccess) {
          if (user.github_connected) {
            onSuccess('dashboard');
          } else {
            onSuccess('connect');
          }
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please try again.';
      setAuthError(msg);
      error('Auth Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#060913] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/15 via-indigo-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Clean Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            {mode === 'login' ? 'Sign in to your account' : 'Create your TracePath account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-sm mx-auto">
            {mode === 'login'
              ? 'Autonomous AI Documentation Sync for GitHub Repositories'
              : 'Keep your architecture & READMEs in continuous sync with live code'}
          </p>
        </div>

        {/* Main Dark Card */}
        <div className="bg-[#0B111F] py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#060913] rounded-2xl border border-slate-800/90">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthError(null);
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all font-sans cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#131D2E] text-white border border-slate-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthError(null);
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all font-sans cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#131D2E] text-white border border-slate-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-sans">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#060913] border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-[#0B111F] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                    Password
                  </label>
                  {/* Interactive Info Icon Button with Popover */}
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                      onMouseEnter={() => setShowPasswordInfo(true)}
                      onMouseLeave={() => setShowPasswordInfo(false)}
                      className="p-0.5 rounded-full text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                      title="Password Requirements Policy"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {/* Popover Dropdown */}
                    {showPasswordInfo && (
                      <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-64 p-3.5 bg-[#131D2E] border border-indigo-500/30 rounded-2xl shadow-2xl z-50 text-[11px] space-y-2 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-1.5 font-bold text-white font-sans text-xs">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          <span>Password Security Policy</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-300 font-sans">
                          <li className="flex items-center gap-2">
                            {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1 mr-1" />}
                            <span className={hasMinLength ? 'text-emerald-400 font-semibold' : ''}>Min. 8 characters</span>
                          </li>
                          <li className="flex items-center gap-2">
                            {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1 mr-1" />}
                            <span className={hasUppercase ? 'text-emerald-400 font-semibold' : ''}>1 Uppercase letter (A-Z)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1 mr-1" />}
                            <span className={hasNumber ? 'text-emerald-400 font-semibold' : ''}>1 Number (0-9)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1 mr-1" />}
                            <span className={hasSpecial ? 'text-emerald-400 font-semibold' : ''}>1 Special symbol (!@#$%...)</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {mode === 'signup' && password.length > 0 && (
                  <span className={`text-[11px] font-mono font-bold ${strength.text}`}>
                    {strength.label}
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#060913] border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-[#0B111F] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Progress Bar for Signup */}
              {mode === 'signup' && password.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                  </div>

                  {/* Real-time Requirement Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                    <div className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${hasMinLength ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-[#060913] text-slate-500'}`}>
                      {hasMinLength ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-600 shrink-0" />}
                      <span>8+ Chars</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${hasUppercase ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-[#060913] text-slate-500'}`}>
                      {hasUppercase ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-600 shrink-0" />}
                      <span>1 Upper</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${hasNumber ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-[#060913] text-slate-500'}`}>
                      {hasNumber ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-600 shrink-0" />}
                      <span>1 Number</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${hasSpecial ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-[#060913] text-slate-500'}`}>
                      {hasSpecial ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-600 shrink-0" />}
                      <span>1 Symbol</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3 font-bold shadow-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 border-0"
              isLoading={submitting}
              disabled={mode === 'signup' && !isPasswordValid && password.length > 0}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'login' ? 'Sign In to TracePath' : 'Create Account & Continue'}
            </Button>
          </form>

          {/* Feature Highlights */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Passwords securely hashed with bcrypt & AES-256 encrypted tokens</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>3-Agent Gemini Flash AI engine automatically analyzes git diffs</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 font-sans">
          Protected by TracePath AI Secure Session Management.
        </p>
      </div>
    </div>
  );
};
