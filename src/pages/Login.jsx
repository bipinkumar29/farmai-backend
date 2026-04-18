import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';

export default function Login() {
  const { loginWithGoogle, signupWithEmail, loginWithEmail, user } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  
  // Registration Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'signup') {
      if (!name || !phone || !email || !password || !confirmPassword) return setError("Please fill out all registration fields.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
      if (phone.length < 10) return setError("Please enter a valid phone number.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
    } else {
      if (!email || !password) return setError("Please enter your email and password.");
    }
    
    setLoading(true); 
    
    try {
      if (authMode === 'signup') {
        const userCredential = await signupWithEmail(email, password);
        // Attach the beautifully requested Name to their Firebase Auth Profile
        await updateProfile(userCredential.user, { displayName: name });
        // NOTE: Phone number would securely inject into a Firestore Database here in production.
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password or email.');
      else if (err.code === 'auth/user-not-found') setError('No account found with this email.');
      else if (err.code === 'auth/invalid-credential') setError('Invalid credentials provided.');
      else setError(err.message || 'Failed to authenticate.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      setLoading(true); 
      await loginWithGoogle(); 
      navigate('/dashboard');
    } catch (err) { 
      setError("Google Auth failed. Verify your connection."); 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-green-500 selection:text-white">
      
      {/* ── Breathtaking Immersive Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000&auto=format&fit=crop" 
          alt="Farmland Background" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-green-900/20"></div>
      </div>

      {/* ── Hyper-Modern Glass Panel ── */}
      <div className="relative z-10 w-full max-w-5xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row animate-fade-in">
        
        {/* Left Side: Brand Story ── */}
        <div className="w-full md:w-5/12 bg-white/5 p-10 lg:p-14 border-r border-white/10 flex flex-col justify-between hidden md:flex">
          <div>
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-full transition-colors uppercase tracking-widest backdrop-blur-md border border-white/10">
              ← Return Home
            </button>
          </div>
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-xl shadow-green-500/30">🌾</div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-6">
              Agricultural <br/> Intelligence.
            </h1>
            <p className="text-white/70 font-medium leading-relaxed mb-8">
              Authenticate via standard cryptographic protocols or interface directly through Google Single Sign-On to deploy the agronomic engine.
            </p>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-white/90 font-bold text-sm">
               <span className="text-green-400 text-xl">🛡️</span> AES-256 Bit Encryption Active
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Logic ── */}
        <div className="w-full md:w-7/12 bg-white p-8 sm:p-12 lg:p-16 relative">
          
          <button onClick={() => navigate('/')} className="md:hidden absolute top-6 right-6 text-gray-400 hover:text-gray-900">✕</button>

          <div className="flex items-center justify-between mb-10">
             <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
               {authMode === 'login' ? 'System Login' : 'Register Profile'}
             </h2>
             <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gateway v2.0</p>
                <div className="flex items-center gap-1 justify-end mt-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> <span className="text-xs font-bold text-green-500">Secure</span></div>
             </div>
          </div>

          {/* Elegant Sliding Toggle */}
          <div className="bg-gray-100 p-1.5 rounded-2xl flex relative mb-8">
             <div className="absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out" style={{ transform: authMode === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}></div>
             <button onClick={() => {setAuthMode('login'); setError('');}} className={`flex-1 py-3.5 text-sm font-bold z-10 transition-colors ${authMode === 'login' ? 'text-green-600' : 'text-gray-500 hover:text-gray-800'}`}>Sign In</button>
             <button onClick={() => {setAuthMode('signup'); setError('');}} className={`flex-1 py-3.5 text-sm font-bold z-10 transition-colors ${authMode === 'signup' ? 'text-green-600' : 'text-gray-500 hover:text-gray-800'}`}>Create Account</button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-bold px-5 py-4 rounded-2xl mb-8 flex items-start gap-3 border border-red-100 animate-fade-in shadow-sm">
              <span className="text-lg">⚠️</span> <span className="pt-0.5">{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* Extended Registration Fields */}
            {authMode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Legal Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ramesh Kumar"
                    className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border-2 border-gray-100 focus:border-green-500 rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 98765 43210"
                    className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border-2 border-gray-100 focus:border-green-500 rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="farmer@secure.net"
                className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border-2 border-gray-100 focus:border-green-500 rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder-gray-400" />
            </div>

            {authMode === 'signup' ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                 <div>
                   <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                   <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 chars"
                     className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border-2 border-gray-100 focus:border-green-500 rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder-gray-400" />
                 </div>
                 <div>
                   <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Confirm Protocol</label>
                   <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Confirm Password"
                     className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border-2 border-gray-100 focus:border-green-500 rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder-gray-400" />
                 </div>
               </div>
            ) : (
               <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                    className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border-2 border-gray-100 focus:border-green-500 rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder-gray-400" />
               </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-5 bg-gray-900 hover:bg-gray-800 text-white font-black rounded-2xl shadow-xl shadow-gray-900/20 transform hover:-translate-y-1 transition-all outline-none text-lg mt-4 flex items-center justify-center gap-3">
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Verifying...</>
              ) : (
                 authMode === 'login' ? 'Initiate Dashboard Login' : 'Deploy Secure Farm Profile'
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center mt-8 mb-8">
            <div className="absolute w-full border-t border-gray-100"></div>
            <div className="px-5 text-xs font-bold text-gray-400 bg-white relative z-10 uppercase tracking-widest">Or Google Firebase SSO</div>
          </div>

          <button type="button" onClick={handleGoogle} disabled={loading}
            className="w-full py-4 flex items-center justify-center gap-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-colors font-bold text-gray-700 outline-none hover:shadow-md">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in via Google Network
          </button>

        </div>
      </div>
    </div>
  );
}
