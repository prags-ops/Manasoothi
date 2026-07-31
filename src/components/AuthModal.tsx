import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      // Reset
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError('Google Sign-In failed or was closed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-[2.5rem] border border-stone-200 shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-soft-olive/10 text-soft-olive px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles size={14} />
            Firebase Authentication
          </div>
          <h3 className="text-3xl font-serif font-bold text-stone-900">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h3>
          <p className="text-stone-500 text-xs mt-1">
            {isSignUp
              ? 'Join Manasoothi to save your journals and mood trends in Firestore.'
              : 'Sign in to access your personal journal entries and saved progress.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-600 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pragati Katiyar"
                  className="w-full bg-warm-beige/40 border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-soft-olive text-stone-900"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-warm-beige/40 border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-soft-olive text-stone-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-warm-beige/40 border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-soft-olive text-stone-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white py-3.5 rounded-2xl font-bold text-xs shadow-sm transition-all"
          >
            {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
            {isSubmitting ? 'Processing...' : isSignUp ? 'Sign Up with Email' : 'Log In'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px bg-stone-200 flex-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">or</span>
          <div className="h-px bg-stone-200 flex-1" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 py-3 rounded-2xl font-semibold text-xs transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.28v3.15C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4.04 3.15c.94-2.83 3.57-4.98 6.68-4.98z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-soft-olive font-semibold hover:underline"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
