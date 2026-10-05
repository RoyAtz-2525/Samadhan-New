import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, MapPin, Building, Users } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await login(email, password);
      
      if (from && user.role.name === 'CITIZEN') {
        navigate(from);
        return;
      }
      
      switch(user.role.name) {
        case 'CITIZEN': navigate('/'); break;
        case 'ADMIN': navigate('/admin'); break;
        case 'MANAGER': navigate('/manager'); break;
        case 'WORKER': navigate('/worker'); break;
        case 'SUPER_ADMIN': navigate('/super-admin'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F7FA] font-sans">
      
      {/* Left Brand Panel - Hidden on Mobile */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-[#0B1F3A] flex-col relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-[#0F9D8A] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-[#3B82F6] rounded-full opacity-10 blur-3xl"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 flex flex-col h-full p-12">
          <div>
            <Link to="/">
              <img src="/logo.png" alt="SAMADHAN Logo" className="h-10 brightness-0 invert mb-12" />
            </Link>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
              Make Your City<br />
              <span className="text-[#0F9D8A]">Better Together</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
              Report civic issues, track progress, and help create stronger communities.
            </p>
          </div>
          
          <div className="mt-auto space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
                <MapPin className="text-[#3B82F6] w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Report</h3>
                <p className="text-slate-400 text-sm">Pinpoint issues easily</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
                <Building className="text-[#0F9D8A] w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Track</h3>
                <p className="text-slate-400 text-sm">Real-time resolution updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
                <Users className="text-[#3B82F6] w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Resolve</h3>
                <p className="text-slate-400 text-sm">Community-driven action</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        
        {/* Mobile Header */}
        <div className="md:hidden w-full max-w-md mb-8 flex justify-center">
          <Link to="/">
            <img src="/logo.png" alt="SAMADHAN Logo" className="h-10" />
          </Link>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-[#E2E8F0] p-8 sm:p-10">
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Welcome Back</h2>
            <p className="text-[#64748B] text-sm">Sign in to continue to SAMADHAN.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-[#DC2626] px-4 py-3 rounded-xl text-sm flex items-start animate-in fade-in slide-in-from-top-2 duration-200">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#0F172A]">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#64748B] group-focus-within:text-[#3B82F6] transition-colors" />
                </div>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="block w-full pl-11 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all duration-200 outline-none text-[#0F172A]"
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-[#0F172A]">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#64748B] group-focus-within:text-[#3B82F6] transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all duration-200 outline-none text-[#0F172A]"
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0B1F3A] hover:bg-[#12345B] text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center shadow-lg shadow-slate-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
              {/* Subtle hover effect */}
              <div className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out"></div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#64748B]">
              Don't have an account?{' '}
              <Link to="/register" state={{ from }} className="font-semibold text-[#0F9D8A] hover:text-[#0B7A6A] hover:underline transition-colors">
                Create an account
              </Link>
            </p>
          </div>
          
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-xs text-[#64748B] text-center">
          &copy; {new Date().getFullYear()} SAMADHAN Platform. All rights reserved.
        </p>
      </div>
      
    </div>
  );
};

export default Login;
