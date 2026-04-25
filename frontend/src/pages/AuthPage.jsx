import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const resp = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }
      
      // Save JWT token
      localStorage.setItem('token', data.access_token);
      
      // Redirect to main app
      navigate('/app');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0f18] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0D9488]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#4575B4]/20 blur-[120px] pointer-events-none" />
      
      <div 
        className="relative z-10 w-full max-w-md p-8 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl shadow-lg"
               style={{ background: 'linear-gradient(135deg, #0D9488, #4575B4)' }}>
            🌡️
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ThermalJustice</h1>
          <p className="text-[#94A3B8] text-sm mt-2 text-center">
            {isLogin ? 'Welcome back, strategist.' : 'Create your account to optimize.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#94A3B8] font-semibold mb-2 pl-1">
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#0D9488] focus:bg-black/40 transition-all placeholder:text-white/20"
              placeholder="strategist@thermaljustice.org"
            />
          </div>
          
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#94A3B8] font-semibold mb-2 pl-1">
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#0D9488] focus:bg-black/40 transition-all placeholder:text-white/20"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 rounded-xl font-bold text-[13px] tracking-wider text-white uppercase transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #0D9488 0%, #1A3C5E 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-3">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-[13px] text-[#2DD4BF] hover:text-white transition-colors cursor-pointer"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="text-[11px] text-[#94A3B8] hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
          >
            Return to Landing
          </button>
        </div>
      </div>
    </div>
  );
}
