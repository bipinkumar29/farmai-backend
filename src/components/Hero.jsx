import { useEffect, useRef } from 'react';
import { usePage } from '../context/PageContext';

const FEATURE_CARDS = [
  { icon: '💬', title: 'Multilingual Chatbot',  desc: 'Ask in 6 Indian languages', page: 'chatbot'   },
  { icon: '📈', title: 'Crop Simulator',         desc: 'Multi-crop profit analysis', page: 'simulator' },
  { icon: '🌦️', title: 'Live Weather',           desc: 'Farm-specific alerts',       page: 'weather'   },
  { icon: '🧪', title: 'Soil Analysis',          desc: 'AI crop recommendations',    page: 'soil'      },
  { icon: '🌿', title: 'Disease Detection',      desc: 'Camera + upload detection',  page: 'disease'   },
  { icon: '🏪', title: 'Mandi Prices',           desc: 'Live market rates',          page: 'mandi'     },
  { icon: '📅', title: 'Crop Calendar',          desc: 'Season planner',             page: 'calendar'  },
  { icon: '♻️', title: 'Waste to Income',        desc: 'Turn waste into revenue',    page: 'waste'     },
  { icon: '🛡️', title: 'PMFBY Insurance',        desc: 'PDF claim generator',        page: 'insurance' },
  { icon: '📰', title: 'Agri News',              desc: 'Latest schemes & alerts',    page: 'news'      },
  { icon: '📖', title: 'Agri Glossary',          desc: 'Searchable term dictionary', page: 'glossary'  },
  { icon: '🧑‍🌾', title: 'Farmer Profile',        desc: 'Personalize your dashboard', page: 'profile'  },
];

const STATS = [
  { val: '6', label: 'Languages' },
  { val: '12', label: 'Features' },
  { val: 'Free', label: 'To Use' },
  { val: 'AI', label: 'Powered' },
];

export default function Hero() {
  const { setActivePage } = usePage();
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const btnRef      = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      titleRef.current?.classList.add('animate-fade-up');
      subtitleRef.current?.classList.add('animate-fade-up-d1');
      btnRef.current?.classList.add('animate-fade-up-d2');
    }, 100);
  }, []);

  function go(page) { setActivePage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-bg min-h-[60vh] flex items-center justify-center px-4 relative">
        <div className="max-w-4xl w-full text-center">
          <div className="glass-card p-10 md:p-16">
            <div className="inline-flex items-center gap-2 bg-farm-yellow/20 border border-farm-yellow/40 rounded-full px-4 py-1.5 text-farm-yellow text-xs font-semibold mb-6 backdrop-blur-sm">
              <span>✨</span> AI-Powered Agriculture Platform
            </div>
            <h1 ref={titleRef} className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight opacity-0"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
              Welcome to <span className="text-farm-yellow">FarmAI</span>
            </h1>
            <p ref={subtitleRef} className="text-lg md:text-xl text-white/85 font-light mb-8 leading-relaxed opacity-0">
              Empowering Indian Farmers with AI-driven insights,<br className="hidden md:block" />
              market intelligence &amp; crop advisory
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8 opacity-0" ref={btnRef}>
              <button onClick={() => go('chatbot')}
                className="inline-flex items-center gap-2 bg-farm-green hover:bg-farm-green-dark text-white font-bold px-8 py-3.5 rounded-full text-base shadow-green hover:shadow-green-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                💬 Start Chatting
              </button>
              <button onClick={() => go('simulator')}
                className="inline-flex items-center gap-2 bg-farm-yellow hover:bg-farm-yellow-dark text-gray-900 font-bold px-8 py-3.5 rounded-full text-base shadow-yellow hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                📈 Crop Simulator
              </button>
            </div>
            {/* Stats */}
            <div className="flex justify-center gap-8">
              {STATS.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black text-farm-yellow">{s.val}</p>
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-2xl animate-bounce">↓</div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-farm-green dark:text-green-400 mb-3">
            🌾 Everything You Need, In One Place
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-sm">
            Click any feature below to open it instantly
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {FEATURE_CARDS.map(card => (
              <button key={card.page} onClick={() => go(card.page)}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-700 hover:border-farm-green dark:hover:border-green-500 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer text-left flex flex-col gap-2">
                <span className="text-3xl">{card.icon}</span>
                <div>
                  <p className="font-black text-sm text-gray-800 dark:text-white group-hover:text-farm-green dark:group-hover:text-green-400 transition-colors">
                    {card.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.desc}</p>
                </div>
                <span className="mt-auto text-farm-green dark:text-green-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Open →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
