import { useState, useRef, useEffect, useCallback } from 'react';
import { useFarmerProfile } from '../context/FarmerProfileContext';

/* ─── Constants ────────────────────────────────────────────────────────────── */
const LANG_NAMES = {
  en: 'English', hi: 'Hindi', bn: 'Bengali',
  ta: 'Tamil',   te: 'Telugu', mr: 'Marathi',
};

const SENTIMENTS = {
  positive: { icon: '😊', label: 'Positive', ring: 'ring-green-400' },
  neutral:  { icon: '😐', label: 'Neutral',  ring: 'ring-yellow-400' },
  negative: { icon: '😞', label: 'Negative', ring: 'ring-red-400' },
};

const QUICK_QS = [
  'Wheat price in Punjab?',
  'Yellow spots on paddy leaves',
  'PMKISAN scheme eligibility',
  'Best fertilizer for cotton',
];

const TAGS = ['#WheatHarvest', '#Monsoon2025', '#PMKisan', '#OrganicFarm', '#MandiPrices'];

/* ─── Offline fallback knowledge base ─────────────────────────────────────── */
const OFFLINE_KB = [
  { require: ['price', 'rate', 'mandi'], keys: ['wheat', 'punjab'], answer: '🌾 Wheat MSP (2024-25): ₹2,275/quintal. Punjab mandis typically trade 5–10% above MSP during peak harvest.' },
  { require: ['disease', 'yellow', 'spot'], keys: ['paddy', 'rice'], answer: '🍂 Common paddy diseases: Bacterial Leaf Blight. Apply copper oxychloride @ 3 g/L.' },
  { require: ['fertiliz', 'npk', 'urea'], keys: ['cotton'], answer: '🌱 Cotton fertilizer: N:P:K = 120:60:60 kg/ha. Apply half N + full P + full K at sowing.' },
  { require: ['pmkisan', 'scheme', 'eligibility'], keys: ['pmkisan'], answer: '📋 PM-KISAN scheme: ₹6,000/year in 3 instalments. Register at pmkisan.gov.in.' }
  // (Note: Kept short here for clarity, but the fallback will trigger if backend fails)
];

function getOfflineFallback(query) {
  const q = query.toLowerCase();
  for (const e of OFFLINE_KB) {
    if (e.require.some(r => q.includes(r))) return e.answer;
  }
  return "🌾 Main abhi local mode mein hoon. Aapke naye backend se connect hone mein thodi dikkat aa rahi hai. Kripya apna backend server check karein!";
}

/* ─── Sentiment detection ──────────────────────────────────────────────────── */
function detectSentiment(text) {
  const t = text.toLowerCase();
  if (['good','great','help','thanks','best','profit','happy','success','solved'].some(w => t.includes(w))) return 'positive';
  if (['loss','problem','drought','disease','fail','worry','bad','pest','flood','damage'].some(w => t.includes(w))) return 'negative';
  return 'neutral';
}

/* ─── Backend API Call (NEW CONNECTION TO LOCALHOST:3001) ──────────────────── */
async function fetchFromBackend(prompt, lang, profileCtx, signal) {
  // Farmer ki profile aur language ko backend ke liye ready kar rahe hain
  const profileInfo = profileCtx?.name
    ? `Farmer profile: Name=${profileCtx.name}, State=${profileCtx.state}, Primary Crop=${profileCtx.primaryCrop}. `
    : '';
  const langName = LANG_NAMES[lang] || 'English';
  
  // Final message jo backend ke paas jayega
  const fullMessage = `You are FarmAI, an expert Indian agricultural advisor. ${profileInfo} Respond ONLY in ${langName}. Be concise (max 4 sentences). Question: ${prompt}`;

  try {
    // 🚀 Yeh line seedha aapke Node.js server ko message bhejti hai
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: fullMessage }),
      signal,
    });

    if (signal?.aborted) return { text: null, aborted: true };

    const data = await response.json();

    if (data.answer) {
      return { text: data.answer }; // Backend se AI ka answer aa gaya!
    } else {
      return { text: `⚠️ Backend Error: ${data.message}` };
    }
  } catch (err) {
    if (err.name === 'AbortError') return { text: null, aborted: true };
    console.error("Backend connect nahi hua:", err);
    return { text: null, offline: true };
  }
}

/* ─── Local storage ────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'farmAI_chatHistory';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

/* ─── Welcome message ──────────────────────────────────────────────────────── */
const WELCOME = {
  role: 'bot',
  text: 'Namaste! 🙏 I am FarmAI. Ask me about:\n• Mandi prices\n• Crop disease remedies\n• Government schemes',
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
};

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function Chatbot({ language }) {
  const { profile, addToast }    = useFarmerProfile();

  const [msgs, setMsgs]               = useState([WELCOME]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [sentiment, setSentiment]     = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]         = useState(loadHistory);
  const [lastLang, setLastLang]       = useState(language);

  const scrollRef  = useRef(null);
  const abortRef   = useRef(null);
  const inputRef   = useRef(null);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  /* Language-change notification */
  useEffect(() => {
    if (language !== lastLang && msgs.length > 1) {
      const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setMsgs(p => [...p, { role: 'system', text: `🌐 Language switched to ${LANG_NAMES[language] || language}.`, time }]);
    }
    setLastLang(language);
  }, [language]); 

  /* Cleanup abort on unmount */
  useEffect(() => () => abortRef.current?.abort(), []);

  /* ── send ─────────────────────────────────────────────────────────────── */
  const send = useCallback(async (q) => {
    if (loading) return; 
    const query = (typeof q === 'string' ? q : input).trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setSentiment(detectSentiment(query));
    setMsgs(p => [...p, { role: 'user', text: query, time }]);
    setInput('');
    setLoading(true);

    abortRef.current?.abort();
    const controller   = new AbortController();
    abortRef.current   = controller;

    // 🚀 Calling our new Backend Function
    const res = await fetchFromBackend(query, language, profile, controller.signal);
    if (res.aborted) { setLoading(false); return; }

    const botTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setLoading(false);

    const botText = res.offline ? getOfflineFallback(query) : res.text;

    setMsgs(p => [...p, { role: 'bot', text: botText, time: botTime, isOffline: res.offline }]);

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [loading, input, language, profile]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function saveChat() {
    if (msgs.length <= 1) return;
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      preview: msgs.find(m => m.role === 'user')?.text || 'Chat session',
      msgs: [...msgs],
    };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    addToast('Chat saved to history! 💾', 'success');
  }

  function clearChat() {
    abortRef.current?.abort();
    setLoading(false);
    setMsgs([WELCOME]);
    setSentiment(null);
    setInput('');
  }

  return (
    <section id="chatbot" className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-farm-green opacity-[0.04] rounded-full" />
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-farm-yellow opacity-[0.05] rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-farm-green dark:text-green-400 mb-3">
          💬 FarmAI Chatbot (Connected to Backend)
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto text-base leading-relaxed">
          Ask about crop diseases, market prices, and farming advice.
        </p>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 rounded-3xl shadow-xl border border-farm-green/10 dark:border-gray-700 overflow-hidden flex flex-col" style={{ height: 580 }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-farm-green to-farm-green-light px-6 py-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🌾</div>
              <div>
                <p className="text-white font-bold text-sm">FarmAI Assistant</p>
                <p className="text-white/70 text-xs">🚀 Powered by Node.js Backend</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shadow-sm bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.3)]" />
                <span className="text-white/70 text-xs">Online</span>
                <button onClick={clearChat} className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full font-bold transition">🔄 New</button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-5 pb-2 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : m.role === 'system' ? 'justify-center' : 'justify-start'} items-end gap-2`}>
                  {m.role === 'bot' && <div className="w-8 h-8 rounded-full bg-farm-green flex items-center justify-center text-sm flex-shrink-0">🌾</div>}
                  {m.role === 'system' && <span className="mx-auto text-center text-[11px] text-gray-400 italic bg-gray-100 dark:bg-gray-700/50 rounded-full px-4 py-1.5">{m.text}</span>}
                  
                  {m.role !== 'system' && (
                    <div className={m.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
                      <div className={`px-4 py-2 rounded-2xl ${m.role === 'user' ? 'bg-[#e8f5e9] text-[#1b5e20] rounded-br-sm' : 'bg-white dark:bg-gray-700 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-600'}`}>
                        <p className="whitespace-pre-line leading-relaxed text-sm">{m.text}</p>
                      </div>
                      {m.time && <p className="text-[10px] text-gray-400 mt-0.5">{m.time}</p>}
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-farm-green flex items-center justify-center text-sm">🌾</div>
                  <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            <div className="px-5 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {QUICK_QS.map(q => (
                <button key={q} onClick={() => send(q)} disabled={loading} className="bg-farm-light dark:bg-gray-700 text-farm-green dark:text-green-400 border border-farm-green/20 dark:border-green-700 rounded-full px-3 py-1 text-xs font-medium hover:bg-farm-green/15 transition cursor-pointer">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-5 pb-5 pt-2 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={loading}
                placeholder="Ask about crops, prices, diseases…"
                className="flex-1 px-5 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full text-sm focus:outline-none focus:border-farm-green"
              />
              <button onClick={() => send()} disabled={loading || !input.trim()} className="w-11 h-11 rounded-full bg-farm-green text-white flex items-center justify-center cursor-pointer transition hover:scale-105">
                ➤
              </button>
            </div>
          </div>

          {/* ── Side Panel ──────────────────────────────────────────────── */}
          <div className="w-52 flex-shrink-0 hidden lg:flex flex-col gap-4">
            <div className="bg-gradient-to-b from-farm-green to-farm-green-dark rounded-2xl p-5 text-white">
              <h3 className="text-sm font-bold border-b border-white/20 pb-2 mb-3">Sentiment AI</h3>
              <div className="space-y-2">
                {Object.entries(SENTIMENTS).map(([k, v]) => (
                  <div key={k} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${sentiment === k ? 'bg-white/20' : ''}`}>
                    <span>{v.icon}</span><span className="text-xs">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-bold text-farm-green dark:text-green-400 mb-3">🔥 Trending</h3>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => send(tag)} disabled={loading} className="bg-farm-light text-farm-green text-xs px-2 py-1 rounded-full font-medium">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}