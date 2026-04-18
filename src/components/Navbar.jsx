import { useState, useRef, useEffect } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { useFarmerProfile } from '../context/FarmerProfileContext';
import { usePage } from '../context/PageContext';
import { useAuth } from '../context/AuthContext';

// Primary nav — always visible in the bar
const PRIMARY = [
  { id: 'home',      label: 'Home',      icon: '🏠' },
  { id: 'chatbot',   label: 'Chatbot',   icon: '💬' },
  { id: 'simulator', label: 'Simulator', icon: '📈' },
  { id: 'disease',   label: 'Diagnose',  icon: '🌿' },
  { id: 'weather',   label: 'Weather',   icon: '🌦️' },
];

// Secondary nav — hidden in "More" dropdown
const SECONDARY = [
  { id: 'soil',      label: 'Soil Analysis',     icon: '🧪' },
  { id: 'mandi',     label: 'Mandi Prices',      icon: '🏪' },
  { id: 'news',      label: 'Agri News',         icon: '📰' },
  { id: 'calendar',  label: 'Crop Calendar',     icon: '📅' },
  { id: 'waste',     label: 'Waste to Income',   icon: '♻️' },
  { id: 'insurance', label: 'PMFBY Insurance',   icon: '🛡️' },
  { id: 'glossary',  label: 'Agri Glossary',     icon: '📖' },
];

const LANGUAGES = [
  { value: 'en', label: 'EN' },
  { value: 'hi', label: 'HI' },
  { value: 'bn', label: 'BN' },
  { value: 'ta', label: 'TA' },
  { value: 'te', label: 'TE' },
  { value: 'mr', label: 'MR' },
];

export default function Navbar({ language, setLanguage }) {
  const [moreOpen, setMoreOpen]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const { clearKey }                  = useApiKey();
  const { darkMode, setDarkMode }     = useFarmerProfile();
  const { activePage, setActivePage } = usePage();
  const { user, logout }              = useAuth();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function nav(id) {
    setActivePage(id);
    setMoreOpen(false);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isSecondaryActive = SECONDARY.some(p => p.id === activePage);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-3">

          {/* ── Logo ── */}
          <button onClick={() => nav('home')}
            className="flex items-center gap-2 font-black text-xl text-farm-green dark:text-green-400 tracking-tight flex-shrink-0 cursor-pointer border-none bg-transparent mr-4">
            <span className="text-2xl">🌾</span>
            <span className="hidden sm:block">FarmAI</span>
          </button>

          {/* ── Primary Tabs (Desktop) ── */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {PRIMARY.map(p => (
              <button key={p.id} onClick={() => nav(p.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activePage === p.id
                    ? 'bg-farm-green text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                <span className="text-base">{p.icon}</span>
                {p.label}
              </button>
            ))}

            {/* ── More Dropdown ── */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isSecondaryActive
                    ? 'bg-farm-green text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                More
                <svg className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {moreOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl py-2 animate-float-in z-[100]">
                  {SECONDARY.map(p => (
                    <button key={p.id} onClick={() => nav(p.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer text-left ${
                        activePage === p.id
                          ? 'bg-farm-light dark:bg-green-900/20 text-farm-green dark:text-green-400 font-bold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}>
                      <span className="text-lg w-7 flex-shrink-0">{p.icon}</span>
                      {p.label}
                      {activePage === p.id && <span className="ml-auto w-2 h-2 bg-farm-green rounded-full" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Controls (Desktop) ── */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
            {/* Language */}
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>

            {/* Dark mode */}
            <button onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer border border-gray-200 dark:border-gray-600">
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* User Profile */}
            <button onClick={() => nav('profile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-gray-200 dark:border-gray-700 ${activePage === 'profile' ? 'bg-farm-green text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <span className="text-base">🧑‍🌾</span>
              <span className="hidden lg:block">{user?.displayName?.split(' ')[0] || 'Profile'}</span>
            </button>

            {/* API Key */}
            <button onClick={clearKey}
              className="text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition cursor-pointer">
              🔑 API Key
            </button>
            
            {/* Logout */}
            <button onClick={logout}
              className="text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 transition cursor-pointer flex items-center gap-1">
              🚪 Logout
            </button>
          </div>

          {/* ── Mobile Right ── */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <button onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 transition text-lg cursor-pointer">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition cursor-pointer">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 px-4 py-4 animate-slide-down">
          {/* All pages in a clean 3-col grid */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Navigate To</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[...PRIMARY, ...SECONDARY].map(p => (
              <button key={p.id} onClick={() => nav(p.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activePage === p.id
                    ? 'bg-farm-green text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-farm-light dark:hover:bg-gray-700'
                }`}>
                <span className="text-xl">{p.icon}</span>
                <span className="text-center leading-tight">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom controls */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="flex-1 bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer focus:outline-none">
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="mr">मराठी</option>
            </select>
            <button onClick={() => { clearKey(); setMobileOpen(false); }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl px-4 text-sm font-semibold cursor-pointer">
              🔑 Key
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
