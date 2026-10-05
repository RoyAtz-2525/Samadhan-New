import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, MapPin, Building, Users, User, Phone, CheckCircle2, Wrench } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'CITIZEN' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerCitizen, registerWorker } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (formData.role === 'CITIZEN') {
        await registerCitizen(formData);
      } else {
        await registerWorker(formData);
      }
      navigate('/login', { state: { from } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your information and try again.');
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
              Join Your<br />
              <span className="text-[#0F9D8A]">Community</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
              Create an account to report issues, track resolutions, or contribute as a civic worker.
            </p>
          </div>
          
          <div className="mt-auto space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
                <CheckCircle2 className="text-[#0F9D8A] w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Verified Actions</h3>
                <p className="text-slate-400 text-sm">Secure and transparent process</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
                <Users className="text-[#3B82F6] w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Civic Network</h3>
                <p className="text-slate-400 text-sm">Connect with local administration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="md:hidden w-full max-w-md mb-6 flex justify-center">
          <Link to="/">
            <img src="/logo.png" alt="SAMADHAN Logo" className="h-10" />
          </Link>
        </div>

        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-[#E2E8F0] p-8 sm:p-10 my-auto">
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Create Your Account</h2>
            <p className="text-[#64748B] text-sm">Join SAMADHAN and help make your community better.</p>
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
            
            {/* Role Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-semibold text-[#0F172A]">I want to register as a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'CITIZEN'})}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                    formData.role === 'CITIZEN' 
                      ? 'border-[#0B1F3A] bg-slate-50' 
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-full mb-2 ${formData.role === 'CITIZEN' ? 'bg-[#0B1F3A] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                    <User size={20} />
                  </div>
                  <span className={`font-semibold ${formData.role === 'CITIZEN' ? 'text-[#0B1F3A]' : 'text-[#64748B]'}`}>Citizen</span>
                  <span className="text-xs text-center text-slate-500 mt-1">Report civic issues</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'WORKER'})}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                    formData.role === 'WORKER' 
                      ? 'border-[#0F9D8A] bg-teal-50/30' 
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-full mb-2 ${formData.role === 'WORKER' ? 'bg-[#0F9D8A] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                    <Wrench size={20} />
                  </div>
                  <span className={`font-semibold ${formData.role === 'WORKER' ? 'text-[#0F9D8A]' : 'text-[#64748B]'}`}>Worker</span>
                  <span className="text-xs text-center text-slate-500 mt-1">Resolve assignments</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[#0F172A]">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#64748B] group-focus-within:text-[#3B82F6] transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="block w-full pl-11 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all duration-200 outline-none text-[#0F172A]"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[#0F172A]">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-[#64748B] group-focus-within:text-[#3B82F6] transition-colors" />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    className="block w-full pl-11 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all duration-200 outline-none text-[#0F172A]"
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

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
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#0F172A]">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#64748B] group-focus-within:text-[#3B82F6] transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 6 characters"
                  className="block w-full pl-11 pr-11 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all duration-200 outline-none text-[#0F172A]"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
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
              className="w-full bg-[#0B1F3A] hover:bg-[#12345B] text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center shadow-lg shadow-slate-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
              {/* Subtle hover effect */}
              <div className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out"></div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#64748B]">
              Already have an account?{' '}
              <Link to="/login" state={{ from }} className="font-semibold text-[#0F9D8A] hover:text-[#0B7A6A] hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
          
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-xs text-[#64748B] text-center shrink-0">
          &copy; {new Date().getFullYear()} SAMADHAN Platform. All rights reserved.
        </p>
      </div>
      
    </div>
  );
};

export default Register;
