const NAV = [
  { href:'#home', label:'Home' },
  { href:'#chatbot', label:'Chatbot' },
  { href:'#simulation', label:'Simulation' },
  { href:'#waste', label:'Waste' },
  { href:'#insurance', label:'Insurance' },
];

const RESOURCES = [
  { label:'PMFBY Official Site',  href:'https://pmfby.gov.in/' },
  { label:'Kisan Suvidha App',    href:'https://farmer.gov.in/' },
  { label:'eNAM Portal',          href:'https://www.enam.gov.in/' },
  { label:'PM Kisan Portal',      href:'https://pmkisan.gov.in/' },
];

const CHIPS = ['💬 6 Languages', '🤖 Gemini AI', '📊 Live Charts', '📄 PDF Export'];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-green-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🌾</span>
              <span className="text-2xl font-black tracking-tight">FarmAI</span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs mb-6">
              Empowering Indian farmers with AI-driven crop advisory, market intelligence,
              and agricultural support — available in 6 Indian languages.
            </p>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map(c => (
                <span key={c} className="bg-white/8 border border-white/12 text-white/65 rounded-full px-3 py-1 text-xs font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-farm-yellow text-xs font-bold uppercase tracking-widest mb-5">Navigation</h4>
            <ul className="space-y-3">
              {NAV.map(l => (
                <li key={l.href}>
                  <a href={l.href}
                    className="text-white/55 hover:text-farm-yellow text-sm transition-colors duration-200 no-underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-farm-yellow text-xs font-bold uppercase tracking-widest mb-5">Gov. Resources</h4>
            <ul className="space-y-3">
              {RESOURCES.map(r => (
                <li key={r.href}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer"
                    className="text-white/55 hover:text-farm-yellow text-sm transition-colors duration-200 no-underline inline-flex items-center gap-1.5">
                    {r.label}
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/35 text-xs">© 2025 FarmAI | Digital Agriculture for India 🇮🇳</p>
          <p className="text-white/35 text-xs">Powered by Google Gemini AI</p>
        </div>
      </div>
    </footer>
  );
}
