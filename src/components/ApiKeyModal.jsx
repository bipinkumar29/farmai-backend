import { useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';

export default function ApiKeyModal() {
  const { showModal, saveKey, setShowModal } = useApiKey();
  const [input, setInput]  = useState('');
  const [show, setShow]    = useState(false);
  const [saved, setSaved]  = useState(false);
  const [error, setError]  = useState('');

  if (!showModal) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const key = input.trim();
    if (!key) {
      // Allow skipping — chatbot will run in offline mode
      setShowModal(false);
      return;
    }
    if (key.length < 20 || !key.startsWith('AIza')) {
      setError('This doesn\'t look like a valid Gemini API key. It should start with "AIza..."');
      return;
    }
    saveKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setInput('');
    setError('');
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[2000] flex items-center justify-center px-4 animate-float-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border-t-4 border-farm-green animate-float-in">

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-farm-green to-farm-green-light flex items-center justify-center text-2xl mx-auto mb-5 shadow-green">
          🔑
        </div>

        <h3 className="text-2xl font-black text-center text-gray-800 dark:text-white mb-2">Gemini API Key</h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-5">
          Add your free API key for full AI-powered responses, or skip to use offline mode.
        </p>

        {/* Offline mode notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">
          <span className="text-amber-500 text-xl mt-0.5 flex-shrink-0">📡</span>
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Works without an API key too!</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              FarmAI has a built-in offline knowledge base. Add your key for live, personalized AI answers.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Toggle key input */}
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="w-full text-left text-sm text-gray-500 dark:text-gray-400 font-medium mb-3 flex items-center gap-2 hover:text-farm-green transition cursor-pointer"
          >
            <span>{show ? '▼' : '▶'}</span>
            {show ? 'Hide API key input' : '✨ Add my Gemini API key'}
          </button>

          {show && (
            <div className="mb-4">
              <div className="relative">
                <input
                  type="password"
                  value={input}
                  onChange={e => { setInput(e.target.value); setError(''); }}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl text-sm focus:border-farm-green focus:ring-2 focus:ring-farm-green/15 outline-none transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">🔒</span>
              </div>
              {error && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">⚠️ {error}</p>
              )}
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                Get a free key at{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-farm-green underline"
                >
                  aistudio.google.com/apikey ↗
                </a>
                {' '}— it's free and takes 30 seconds.
              </p>
            </div>
          )}

          <button
            type="submit"
            className={`w-full font-bold py-3.5 rounded-xl transition-all cursor-pointer mb-3 ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-farm-green to-farm-green-light hover:from-farm-green-dark hover:to-farm-green text-white shadow-green hover:shadow-green-lg'
            }`}
          >
            {saved ? '✅ Key saved! You\'re all set.' : input.trim() ? '🚀 Save & Start FarmAI' : '📡 Continue in Offline Mode'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          🔐 Keys are stored only in your browser — never on any server.
        </p>
      </div>
    </div>
  );
}
