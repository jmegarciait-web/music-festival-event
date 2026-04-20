import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomerAuthModal = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSuccess: () => void 
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      const res = await fetch(`http://localhost:3001/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        onSuccess();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-panel p-8 max-w-md w-full neon-glow-border relative z-10"
          >
            <h2 className="text-3xl font-display font-black mb-2 text-center uppercase tracking-tighter">
              {isLogin ? 'Welcome Back' : 'Join the Experience'}
            </h2>
            <p className="text-gray-400 text-center mb-6 text-sm uppercase tracking-widest font-bold">
              {isLogin ? 'Log in to securely checkout' : 'Create an account to hold your digital passes'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink text-neon-pink text-sm uppercase tracking-widest text-center font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,249,255,0.3)] transition-all font-display"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,249,255,0.3)] transition-all font-display"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="neon-button mt-4 w-full disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Login to Checkout' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400 uppercase tracking-widest font-bold">
              {isLogin ? "Don't have an account?" : "Already have passes?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-neon-cyan hover:text-white transition-colors"
              >
                {isLogin ? 'Register' : 'Log In'}
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
