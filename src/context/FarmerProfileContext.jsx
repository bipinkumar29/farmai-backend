import { createContext, useContext, useState, useEffect } from 'react';

const FarmerProfileContext = createContext(null);

const DEFAULT_PROFILE = { name: '', state: '', primaryCrop: 'Wheat', landSize: '', unit: 'acres' };

export function FarmerProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('farmAI_profile')) || DEFAULT_PROFILE; }
    catch { return DEFAULT_PROFILE; }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('farmAI_darkMode') === 'true'; }
    catch { return false; }
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('farmAI_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('farmAI_darkMode', darkMode);
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  function addToast(message, type = 'info') {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  function removeToast(id) {
    setToasts(t => t.filter(x => x.id !== id));
  }

  return (
    <FarmerProfileContext.Provider value={{ profile, setProfile, darkMode, setDarkMode, toasts, addToast, removeToast }}>
      {children}
    </FarmerProfileContext.Provider>
  );
}

export function useFarmerProfile() {
  return useContext(FarmerProfileContext);
}
