import sys

with open("d:/AI-Based Farmer Query support and Advisory System 1/src/components/Chatbot.jsx", "r", encoding="utf-8") as f:
    content = f.read()

massive_kb = """/* ─── Offline fallback knowledge base ─────────────────────────────────────── */
const OFFLINE_KB = [
  { require: ['price', 'rate', 'cost', 'mandi', 'market', 'sell', 'selling', 'value'], keys: ['wheat', 'price', 'rate', 'mandi', 'market', 'punjab', 'sell'], answer: '🌾 Wheat MSP (2024-25): ₹2,275/quintal. Punjab mandis typically trade 5–10% above MSP during peak harvest (March–April).' },
  { require: ['irrigat', 'irrigation', 'water', 'when', 'season', 'sow', 'time', 'best', 'how many'], keys: ['wheat', 'irrigat', 'water', 'season', 'sow', 'rabi', 'when', 'best'], answer: '💧 Wheat Irrigation Schedule:\\n• Crown Root Initiation (20–25 DAS) — most critical\\n• Tillering (40–45 DAS)\\n• Jointing (60–65 DAS)\\n• Flowering (80–85 DAS)\\n• Grain filling (100–105 DAS)\\nTotal: 4–6 irrigations. Rabi sowing: Oct–Nov in North India.' },
  { require: ['disease', 'rust', 'blight', 'fungus', 'spot', 'yellow', 'brown', 'black', 'smut'], keys: ['wheat', 'disease', 'rust', 'blight', 'fungus', 'spot'], answer: '🍂 Wheat diseases & treatment:\\n• Yellow rust → Propiconazole 25 EC @ 0.1%\\n• Brown rust → Mancozeb 75 WP @ 2 g/L\\n• Loose smut → Seed treat with Carboxin + Thiram\\n• Karnal bunt → Use certified disease-free seeds' },
  { require: ['fertiliz', 'urea', 'npk', 'dap', 'nutrient', 'dose', 'apply'], keys: ['wheat', 'fertiliz', 'urea', 'npk', 'dap', 'dose'], answer: '🌱 Wheat fertilizer dose:\\n• N:P:K = 120:60:40 kg/ha\\n• At sowing: full P+K + ⅓ N\\n• 1st irrigation (20–25 DAS): ⅓ N\\n• Tillering (40–45 DAS): remaining N\\nFor irrigated conditions; reduce 20% for rainfed.' },
  { require: ['harvest', 'cut', 'thresh', 'combine', 'yield'], keys: ['wheat', 'harvest', 'cutting', 'thresh', 'yield', 'quintal'], answer: '🌾 Wheat harvest tips:\\n• Harvest when moisture < 14% (golden-yellow grains)\\n• Typical yield: 40–55 quintals/ha (irrigated varieties)\\n• Use combine harvester; thresh within 2–3 days\\n• Store at <12% moisture in bags or silos' },
  { require: ['seed', 'variety', 'sow', 'which', 'recommend', 'best', 'good'], keys: ['wheat', 'seed', 'variety', 'sow', 'recommend'], answer: '🌱 Popular wheat varieties:\\n• HD-3086 (high yield, disease resistant)\\n• WH-1105 (Punjab, good for late sowing)\\n• K-307 (UP & Bihar, rust resistant)\\n• DBW-187 (early maturing, heat tolerant)\\nBuy only certified seeds from government outlets.' },
  { require: ['price', 'rate', 'mandi', 'market', 'sell'], keys: ['rice', 'paddy', 'price', 'rate', 'mandi'], answer: '🌾 Rice MSP (2024-25): Common grade ₹2,300/quintal, Grade A ₹2,320/quintal. Karnataka, Punjab, AP mandis are major trading centres. Check agmarknet.gov.in for today\\'s rates.' },
  { require: ['yellow', 'spot', 'blight', 'blast', 'disease', 'brown', 'sheath'], keys: ['paddy', 'rice', 'yellow', 'spot', 'blight', 'blast', 'disease', 'leaf'], answer: '🍂 Common paddy diseases:\\n• Bacterial Leaf Blight → Apply copper oxychloride @ 3 g/L\\n• Blast → Tricyclazole 75 WP @ 0.6 g/L\\n• Iron deficiency (yellow leaves) → Zinc sulphate 25 kg/ha\\n• Sheath rot → Carbendazim 50 WP @ 1 g/L' },
  { require: ['fertiliz', 'urea', 'npk', 'dap', 'nutrient'], keys: ['paddy', 'rice', 'fertiliz', 'urea', 'npk'], answer: '🌱 Paddy fertilizer (transplanted):\\n• N:P:K = 120:60:60 kg/ha\\n• Basal: full P+K + ⅓ N at transplanting\\n• Active tillering (25–30 DAT): ⅓ N\\n• Panicle initiation (45–50 DAT): remaining N\\n+ Zinc sulphate 25 kg/ha in zinc-deficient soils.' },
  { require: ['transplant', 'nursery', 'sow', 'seedling', 'when'], keys: ['paddy', 'rice', 'transplant', 'nursery', 'seedling', 'sow'], answer: '🌱 Paddy nursery & transplanting:\\n• Raise nursery 25–30 days before transplanting\\n• Seed rate: 20–25 kg/ha\\n• Transplant 2–3 seedlings per hill, 20×15 cm spacing\\n• Kharif sowing: June–July (after onset of monsoon)' },
  { require: ['irrigat', 'water', 'flood', 'submerged', 'drain'], keys: ['paddy', 'rice', 'water', 'irrigat', 'flood', 'drain'], answer: '💧 Paddy water management:\\n• Maintain 5 cm standing water during vegetative stage\\n• AWD (Alternate Wetting & Drying) saves 25–30% water\\n• Drain field 10 days before harvest\\n• Avoid water stress at flowering — critical stage' },
  { require: ['price', 'rate', 'mandi', 'sell', 'market'], keys: ['cotton', 'price', 'rate', 'mandi', 'sell'], answer: '🌿 Cotton MSP (2024-25): Medium staple ₹7,121/quintal, Long staple ₹7,521/quintal. Gujarat, Maharashtra & Telangana are major cotton markets. Check CCI portal for live rates.' },
  { require: ['fertiliz', 'npk', 'urea', 'dap', 'nutrient'], keys: ['cotton', 'fertiliz', 'npk', 'urea', 'dap'], answer: '🌱 Cotton fertilizer:\\n• N:P:K = 120:60:60 kg/ha\\n• Half N + full P + full K at sowing\\n• Remaining N: ½ at squaring, ½ at boll formation\\n• Apply boron 1.5 kg/ha for better boll setting' },
  { require: ['bollworm', 'pest', 'whitefly', 'jassid', 'thrips', 'insect'], keys: ['cotton', 'bollworm', 'pest', 'whitefly', 'jassid', 'thrips'], answer: '🐛 Cotton pest management:\\n• Pink bollworm → Emamectin benzoate 5 SG @ 0.4 g/L\\n• Whitefly → Spiromesifen 22.9 SC @ 0.9 ml/L\\n• Jassids → Thiamethoxam 25 WG @ 0.4 g/L\\n• Use pheromone traps for bollworm monitoring' },
  { require: ['disease', 'wilt', 'blight', 'rot', 'leaf spot'], keys: ['cotton', 'disease', 'wilt', 'blight', 'root rot'], answer: '🍂 Cotton diseases:\\n• Fusarium wilt → Use resistant Bt varieties; soil drench with Carbendazim\\n• Alternaria blight → Mancozeb 75 WP @ 2 g/L spray\\n• Bacterial blight → Copper oxychloride @ 3 g/L\\n• Ensure proper drainage to avoid root rot' },
  { require: ['maize', 'corn', 'makka', 'sweet corn'], keys: ['maize', 'corn', 'makka', 'price', 'fertiliz', 'disease', 'yield'], answer: '🌽 Maize overview:\\n• MSP (2024-25): ₹2,090/quintal\\n• N:P:K: 150:75:75 kg/ha; apply ⅓ N at sowing, ⅓ at knee-high, ⅓ at tasselling\\n• Fall Armyworm (FAW) — apply Spinetoram 11.7 SC @ 0.5 ml/L at whorl stage\\n• Yield: 70–90 quintals/ha' },
  { require: ['sugarcane', 'ganna', 'sugar'], keys: ['sugarcane', 'ganna', 'sugar', 'price', 'disease', 'fertiliz', 'yield'], answer: '🎋 Sugarcane overview:\\n• FRP (2024-25): ₹340/quintal\\n• N:P:K: 250:85:115 kg/ha in 3 splits\\n• Plant in Feb–March; ratoon crop in Oct–Nov\\n• Red rot: drench with Carbendazim; use disease-free sett\\n• Yield: 700–900 quintals/ha' },
  { require: ['soybean', 'soya', 'soyabean'], keys: ['soybean', 'soya', 'price', 'disease', 'fertiliz', 'yield'], answer: '🫘 Soybean overview:\\n• MSP (2024-25): ₹4,892/quintal\\n• N:P:K: 20:80:40 kg/ha (N low — fixes own nitrogen)\\n• Rhizobium seed treatment essential\\n• Kharif crop: sow June–July\\n• Girdle beetle & pod borer — spray Triazophos @ 2 ml/L\\n• Yield: 20–30 quintals/ha' },
  { require: ['pulse', 'dal', 'lentil', 'gram', 'tur', 'arhar', 'moong', 'urad', 'masoor', 'chana'], keys: ['pulse', 'dal', 'lentil', 'gram', 'tur', 'arhar', 'moong', 'urad', 'masoor', 'chana'], answer: '🫘 Pulses guidance:\\n• Tur/Arhar MSP: ₹7,550/quintal | Moong: ₹8,682 | Urad: ₹7,400 | Chana: ₹5,440\\n• Rhizobium seed treatment improves yield 15–20%\\n• NPK: 20:40:20 kg/ha\\n• Fusarium wilt (gram): use resistant varieties (JG-11, KAK-2)' },
  { require: ['tomato', 'tamatar'], keys: ['tomato', 'tamatar', 'price', 'disease', 'fertiliz', 'pest'], answer: '🍅 Tomato farming:\\n• Space: 60×45 cm; provide staking/trellising\\n• N:P:K: 120:80:60 kg/ha in 4–5 splits\\n• Early blight (Alternaria) → Mancozeb @ 2 g/L\\n• Fruit borer → Spinosad 45 SC @ 0.3 ml/L\\n• Avg price: ₹800–2,500/quintal' },
  { require: ['potato', 'aloo'], keys: ['potato', 'aloo', 'price', 'disease', 'fertiliz', 'store'], answer: '🥔 Potato farming:\\n• MSP varies; market ₹500–1,200/quintal\\n• N:P:K: 180:120:150 kg/ha\\n• Late blight (most dangerous) → Mancozeb or Metalaxyl @ 2 g/L preventively\\n• Aphid (virus vector) → Thiamethoxam 25 WG @ 0.4 g/L\\n• Store in cold storage at 4°C, 90–95% humidity' },
  { require: ['onion', 'pyaz'], keys: ['onion', 'pyaz', 'price', 'disease', 'storage', 'yield'], answer: '🧅 Onion farming:\\n• Kharif sow: June–July | Rabi sow: Oct–Nov\\n• N:P:K: 100:50:50 kg/ha\\n• Purple blotch → Mancozeb @ 2 g/L + Iprodione @ 1 g/L\\n• Thrips → Spinosad @ 0.3 ml/L\\n• Store in shade with good air circulation; use net bags' },
  { require: ['mango', 'aam'], keys: ['mango', 'aam', 'disease', 'yield', 'flower', 'fruit'], answer: '🥭 Mango cultivation:\\n• Powdery mildew → Sulphur 80 WP @ 2 g/L before flowering\\n• Gall midge → Dimethoate 30 EC @ 1.5 ml/L\\n• Fruit fly → Malathion bait spray\\n• Avoid over-irrigation at stone-hardening stage' },
  { require: ['banana', 'kela'], keys: ['banana', 'kela', 'disease', 'pest', 'yield', 'bunch'], answer: '🍌 Banana cultivation:\\n• N:P:K: 200:60:300 g/plant/year in 5 splits\\n• Panama wilt (Fusarium) → use resistant var (Grand Naine, Ney Poovan)\\n• Sigatoka leaf spot → Propiconazole 25 EC @ 1 ml/L\\n• Bagging at 50% emergence increases quality' },
  { require: ['pest', 'insect', 'bug', 'attack', 'damage', 'spray', 'pesticide', 'control'], keys: ['pest', 'insect', 'bug', 'attack', 'spray', 'pesticide', 'control', 'neem'], answer: '🐛 General IPM (Integrated Pest Management):\\n• Start with neem oil spray (5 ml/L) as a safe first step\\n• Use sticky yellow traps for whiteflies/thrips monitoring\\n• Spray only in early morning or evening\\n• Do not spray during flowering' },
  { require: ['fungus', 'fungal', 'mould', 'mold', 'rot', 'blight', 'wilt'], keys: ['fungus', 'fungal', 'mould', 'rot', 'blight', 'wilt', 'disease'], answer: '🍂 Managing fungal diseases:\\n• Avoid water stagnation; ensure good air circulation\\n• Mancozeb 75 WP (2 g/L) — broad-spectrum contact fungicide\\n• Carbendazim 50 WP (1 g/L) — systemic, for wilt & stem rot\\n• Trichoderma viride — biological control' },
  { require: ['urea', 'nitrogen', 'npk', 'dap', 'fertiliz', 'dose', 'apply', 'top dress'], keys: ['urea', 'nitrogen', 'npk', 'dap', 'fertiliz', 'top dress'], answer: '🌱 General fertilizer guidance:\\n• Urea (46% N): most common N source; apply in splits to reduce losses\\n• DAP (18% N, 46% P): basal application at sowing\\n• MOP/Potash (60% K): at sowing, especially for fruits & roots\\n• Soil test your field every 3 years for accurate doses' },
  { require: ['soil', 'test', 'ph', 'health', 'quality'], keys: ['soil', 'test', 'ph', 'health', 'acidic', 'alkaline', 'organic matter'], answer: '🧪 Soil health:\\n• Test at KVK or Soil Health Lab every 3 years\\n• Ideal pH: 6.0–7.5 for most crops\\n• Acidic soil (pH < 6): apply lime (CaCO₃) @ 2–4 tonnes/ha\\n• Alkaline/saline (pH > 8): apply gypsum @ 5 tonnes/ha' },
  { require: ['organic', 'vermicompost', 'compost', 'manure', 'fym', 'natural', 'cow dung'], keys: ['organic', 'vermicompost', 'compost', 'manure', 'fym', 'cow dung', 'natural'], answer: '♻️ Organic inputs:\\n• FYM (Farm Yard Manure): 10–15 tonnes/ha, apply 3–4 weeks before sowing\\n• Vermicompost: 3–5 tonnes/ha; replaces 50% chemical fertilizer\\n• Green manure (Dhaincha): incorporate at 40–45 days\\n• PKVY subsidises organic farming' },
  { require: ['drip', 'sprinkler', 'irrigation', 'water saving', 'micro'], keys: ['drip', 'sprinkler', 'irrigation', 'water', 'micro', 'saving', 'pmksy'], answer: '💧 Micro-irrigation:\\n• Drip irrigation saves 40–50% water; increases yield 20–40%\\n• Sprinkler irrigation saves 25–35%; ideal for undulating terrain\\n• PMKSY subsidy: up to 55%\\n• Can integrate with fertigation (water-soluble fertilizers)' },
  { require: ['pmkisan', 'pm-kisan', 'pm kisan', '6000', 'instalment'], keys: ['pmkisan', 'kisan', 'scheme', 'eligib', 'register', '6000', 'instalment'], answer: '📋 PM-KISAN scheme:\\n• ₹6,000/year paid in 3 instalments of ₹2,000\\n• Eligible: all land-holding farmers\\n• Register at pmkisan.gov.in with Aadhaar + bank account + land records\\n• Check payment status: 9am–6pm at 155261' },
  { require: ['pmfby', 'insurance', 'claim', 'bima', 'fasal'], keys: ['pmfby', 'insurance', 'bima', 'claim', 'premium', 'kharif', 'rabi', 'fasal'], answer: '🛡️ PMFBY crop insurance:\\n• Premium: 2% (kharif) | 1.5% (rabi) | 5% (commercial)\\n• Covers: drought, flood, hailstorm, pest, post-harvest losses\\n• Enroll at nearest bank/CSC/PMFBY portal before cut-off date\\n• Helpline: 14447' },
  { require: ['kcc', 'kisan credit card', 'loan', 'credit', 'bank'], keys: ['kcc', 'kisan credit card', 'loan', 'credit', 'bank', 'interest'], answer: '💳 Kisan Credit Card (KCC):\\n• Revolving credit for crop cultivation & maintenance\\n• Interest: 7% p.a. (4% with timely repayment)\\n• Apply at any bank, cooperative, or RRB with land records & ID\\n• Animal husbandry & fishery farmers also eligible' },
  { require: ['weather', 'forecast', 'rain', 'monsoon', 'temperature', 'climate', 'rainfall'], keys: ['weather', 'forecast', 'rain', 'monsoon', 'temperature', 'imd', 'meghdoot'], answer: '🌦️ Weather resources for farmers:\\n• IMD forecast: mausam.imd.gov.in\\n• Meghdoot app: agro-met advisory tailored to your location\\n• Damini app: lightning alerts\\n• Text-based advisory: SMS KRISHI to 51969' },
  { require: ['tractor', 'machinery', 'equipment', 'combine', 'power tiller', 'machine'], keys: ['tractor', 'machinery', 'equipment', 'combine', 'power tiller', 'machine', 'rent'], answer: '🚜 Farm machinery:\\n• SMAM scheme: 40–50% subsidy on farm implements\\n• CHC (Custom Hiring Centre): rent tractor/combine from nearby centres\\n• CHC Portal: chcfarm.nic.in — find nearest rental machines\\n• Happy Seeder: sows wheat directly in paddy stubble' },
  { require: ['cow', 'buffalo', 'goat', 'animal', 'livestock', 'dairy', 'milk', 'poultry'], keys: ['cow', 'buffalo', 'goat', 'animal', 'livestock', 'dairy', 'milk', 'poultry', 'sheep'], answer: '🐄 Livestock & dairy:\\n• Pashu Kisan Credit Card: loan for animal purchase\\n• RKBY: subsidy for cattle vet services\\n• FMD, BQ, HS vaccination — schedule at government vet clinic (free)\\n• Dairy cooperative milk: contact AMUL/state dairy union' },
  { require: ['price', 'rate', 'mandi', 'market', 'sell', 'today price', 'what is price'], keys: ['price', 'rate', 'mandi', 'market', 'sell', 'today', 'crop'], answer: '📊 Live crop prices:\\n• agmarknet.gov.in — daily mandi arrivals & prices\\n• enam.gov.in — live online auction prices\\n• Kisan Suvidha app — price, weather, advisory\\n• Kisan Call Centre: 1800-180-1551 — ask by voice' },
  { require: ['helpline', 'contact', 'call', 'number', 'help', 'support', 'reach'], keys: ['helpline', 'contact', 'call', 'number', 'support', 'kcc', 'kvk'], answer: '📞 Farmer helplines:\\n• Kisan Call Centre: 1800-180-1551 (toll-free, Mon–Sat 6AM–10PM)\\n• PM-KISAN: 155261 | PMFBY: 14447\\n• Soil Health Card: 1800-180-1551\\n• Nearest KVK (Krishi Vigyan Kendra): kvk.icar.gov.in' },
  { require: ['crop', 'farm', 'field', 'farming', 'agriculture', 'khet', 'kheti'], keys: ['crop', 'farm', 'field', 'farming', 'agriculture', 'khet', 'kheti', 'how', 'best', 'good'], answer: '🌾 General farming advice:\\n• Follow Integrated Crop Management (ICM): right variety + timely sowing + balanced nutrition + pest control\\n• Soil test every 3 years → saves fertilizer cost by 20–30%\\n• Keep records of input costs & yields\\n• Contact your nearest KVK for free expert advice' }
];

const BROAD_CATEGORIES = [
  { detect: ['price','rate','mandi','sell','market','cost'], answer: '📊 For live crop prices visit agmarknet.gov.in or enam.gov.in. Kisan Call Centre 1800-180-1551 also provides mandi rates.' },
  { detect: ['disease','blight','fungus','rust','spot','rot','wilt'], answer: '🍂 Describe symptoms (which part, colour). First step: spray copper oxychloride @ 3 g/L. For diagnosis contact KVK or call 1800-180-1551.' },
  { detect: ['pest','insect','worm','aphid','whitefly','bug'], answer: '🐛 Start with neem oil spray (5 ml/L). For specific chemistry, visit your nearest KVK or call 1800-180-1551.' },
  { detect: ['fertiliz','urea','npk','dap','manure','compost'], answer: '🌱 Fertilizer doses depend on crop. Soil test first! General cereals: N:P:K = 120:60:40 kg/ha. Apply N in splits.' },
  { detect: ['water','irrigat','irrigate','drip','sprinkler','drought'], answer: '💧 Irrigation timing depends on stage (flowering/grain filling are critical). Drip saves 40% water.' },
  { detect: ['scheme','subsidy','yojana','loan','kcc'], answer: '🏛️ Key schemes: PM-KISAN (₹6k/yr), PMFBY (insurance), KCC (loan @ 4%), PMKSY (irrigation subsidy).' },
  { detect: ['sell','profit','loss','buyer'], answer: '💰 Better prices: 1) Warehouse receipt if prices are low, 2) Join FPO, 3) Try e-NAM, 4) Farm processing.' },
  { detect: ['sow','sowing','plant','planting','when'], answer: '📅 Sowing depends on region. Kharif: June–July. Rabi: Oct–Nov. Consult local KVK.' },
  { detect: ['yield','production','output','quintal'], answer: '📈 Yield depends on variety & soil. Get certified seeds, follow NPK doses, and consult your KVK.' },
  { detect: ['organic','natural','without chemical','jaivik'], answer: '♻️ Organic farming: use vermicompost (3–5 t/ha), jeevamrut. PKVY scheme provides subsidy.' },
];

function getOfflineFallback(query) {
  const q = query.toLowerCase();
  
  let best = 0, bestEntry = null;
  for (const e of OFFLINE_KB) {
    if (!e.require.some(r => q.includes(r))) continue;
    const score = e.keys.filter(k => q.includes(k)).length;
    if (score > best) { best = score; bestEntry = e; }
  }
  if (bestEntry) return bestEntry.answer;

  let best2 = 0, bestEntry2 = null;
  for (const e of OFFLINE_KB) {
    const score = e.keys.filter(k => q.includes(k)).length;
    if (score >= 2 && score > best2) { best2 = score; bestEntry2 = e; }
  }
  if (bestEntry2) return bestEntry2.answer;

  for (const cat of BROAD_CATEGORIES) {
    if (cat.detect.some(d => q.includes(d))) return cat.answer;
  }

  return '🌾 I may not have a specific offline answer for that, but here\\'s how to get help:\\n\\n• 📞 Kisan Call Centre: 1800-180-1551 (toll-free, Mon-Sat 6AM-10PM)\\n• 🏫 Nearest KVK (Krishi Vigyan Kendra): kvk.icar.gov.in\\n• 📱 Add your Gemini API key (click 🔑 in header) for full AI answers to any question!';
}
"""

# Insert right before detectSentiment
lines = content.split('\\n')
for i, line in enumerate(lines):
    if "function detectSentiment" in line:
        lines.insert(i-1, massive_kb)
        break

with open("d:/AI-Based Farmer Query support and Advisory System 1/src/components/Chatbot.jsx", "w", encoding="utf-8") as f:
    f.write('\\n'.join(lines))

print("Injected KB!")
