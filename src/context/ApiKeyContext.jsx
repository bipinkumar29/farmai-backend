import { createContext, useContext, useState, useEffect } from 'react';

const ApiKeyContext = createContext(null);

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKey]       = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('farmAI_geminiKey');
    if (saved && saved.trim().length > 20) {
      setApiKey(saved.trim());
      setShowModal(false);
    } else {
      // No valid key stored — show modal so user can add one
      setApiKey('');
      setShowModal(true);
    }
  }, []);

  const saveKey = (key) => {
    const trimmed = key.trim();
    localStorage.setItem('farmAI_geminiKey', trimmed);
    setApiKey(trimmed);
    setShowModal(false);
  };

  const clearKey = () => {
    localStorage.removeItem('farmAI_geminiKey');
    setApiKey('');
    setShowModal(true);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, showModal, setShowModal, saveKey, clearKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
