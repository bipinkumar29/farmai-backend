import { useState, useRef, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useFarmerProfile } from '../context/FarmerProfileContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

// Updated CROPS with yieldPerAcre (in quintals) to use with live prices (₹/quintal)
const CROPS = {
  Wheat:     { cost: 25000, yieldPerAcre: 20, icon: '🌾', duration: '120 days', water: 'Moderate', fallbackPrice: 2275 },
  Rice:      { cost: 30000, yieldPerAcre: 22, icon: '🍚', duration: '140 days', water: 'High', fallbackPrice: 2183 },
  Cotton:    { cost: 30000, yieldPerAcre: 8,  icon: '🌿', duration: '160 days', water: 'Low-Mod',  fallbackPrice: 7000 },
  Sugarcane: { cost: 40000, yieldPerAcre: 300,icon: '🎋', duration: '300 days', water: 'High', fallbackPrice: 300 },
  Maize:     { cost: 22000, yieldPerAcre: 20, icon: '🌽', duration: '100 days', water: 'Low', fallbackPrice: 1900 },
  Mustard:   { cost: 18000, yieldPerAcre: 8,  icon: '🌼', duration: '110 days', water: 'Low', fallbackPrice: 5200 },
  Gram:      { cost: 20000, yieldPerAcre: 7,  icon: '🫘', duration: '120 days', water: 'Low', fallbackPrice: 5400 },
  Soybean:   { cost: 24000, yieldPerAcre: 10, icon: '🌱', duration: '110 days', water: 'Moderate', fallbackPrice: 4400 },
  Potato:    { cost: 45000, yieldPerAcre: 80, icon: '🥔', duration: '100 days', water: 'Moderate', fallbackPrice: 1000 },
  Tomato:    { cost: 50000, yieldPerAcre: 80, icon: '🍅', duration: '120 days', water: 'High', fallbackPrice: 1200 },
};

const WEATHER = [
  { value: 'Normal',  label: 'Normal Rainfall',       factor: 1.0,  risk: 'Low',   icon: '🌤️' },
  { value: 'Drought', label: 'Drought Forecast',      factor: 0.65, risk: 'High',  icon: '☀️' },
  { value: 'Flood',   label: 'Heavy Monsoon/Flood',   factor: 0.5,  risk: 'Heavy', icon: '🌧️' },
];

const MARKETS = [
  { value: 'Stable',   label: 'Stable (Historical)',  factor: 1.0,  icon: '📊' },
  { value: 'Volatile', label: 'Volatile (Market)',    factor: 0.85, icon: '📉' },
  { value: 'MSP',      label: 'Govt. MSP Secured',    factor: 1.15, icon: '🏛️' },
];

const IRRIGATION = [
  { value: 'Flood',     label: 'Flood/Surface', costMulti: 1.0,  revMulti: 1.0, icon: '🌊' },
  { value: 'Sprinkler', label: 'Sprinkler System', costMulti: 1.1, revMulti: 1.1, icon: '🚿' },
  { value: 'Drip',      label: 'Drip Irrigation', costMulti: 1.2, revMulti: 1.25, icon: '💧' },
];

export default function CropSimulator() {
  const { addToast } = useFarmerProfile();
  
  // States
  const [activeTab, setActiveTab] = useState('single');
  const [landArea, setLandArea]   = useState(1);
  const [landUnit, setLandUnit]   = useState('Acre');
  const [selectedCrops, setSelectedCrops] = useState(['Wheat']);
  
  const [weather, setWx]       = useState('Normal');
  const [market, setMkt]       = useState('Stable');
  const [irrigation, setIrrig] = useState('Flood');
  
  const [result, setResult]       = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // LIVE API STATE
  const [livePrices, setLivePrices] = useState(null);
  
  const reportRef = useRef(null);

  // Quick preset loader
  const loadPreset = (c) => {
    setSelectedCrops([c]);
    setActiveTab('single');
  };

  // Fetch Live Prices on Mount
  useEffect(() => {
    fetch('http://localhost:3001/api/mandi/prices')
      .then(r => r.json())
      .then(json => {
        if(json && json.data) {
          // Flatten latest prices from one of the major regions globally to feed simulator
          // Here we just pick the first available state as an 'Average API Anchor'
          const stateKeys = Object.keys(json.data);
          if (stateKeys.length > 0) {
            setLivePrices(json.data[stateKeys[0]]); 
          }
        }
      })
      .catch(e => console.log('CropSim Live API skipped. Using fallback array.'));
  }, []);

  function calculateCropData(cropName) {
    const base = CROPS[cropName];
    if (!base) return null;
    
    const wx = WEATHER.find(w => w.value === weather);
    const mk = MARKETS.find(m => m.value === market);
    const ir = IRRIGATION.find(i => i.value === irrigation);
    
    // Scale for area
    const multiplier = landUnit === 'Acre' ? landArea : landArea * 2.471;
    
    // Check if we have a live price pulled from Node!
    const spotPricePerQuintal = livePrices && livePrices[cropName] && livePrices[cropName].price 
                                  ? livePrices[cropName].price 
                                  : base.fallbackPrice;

    // Calculate dynamic base revenue based on Live Government Metric vs Expected Yield
    const liveRevenuePerAcre = spotPricePerQuintal * base.yieldPerAcre;

    const totalCost = base.cost * multiplier * ir.costMulti;
    const totalRev  = liveRevenuePerAcre * multiplier * wx.factor * mk.factor * ir.revMulti;
    const profit    = totalRev - totalCost;
    const roi       = ((profit) / totalCost) * 100;
    
    return {
      name: cropName,
      icon: base.icon,
      duration: base.duration,
      water: base.water,
      cost: totalCost,
      revenue: totalRev,
      profit: profit,
      spotPrice: spotPricePerQuintal,
      isLive: !!(livePrices && livePrices[cropName]),
      roi: Math.round(roi)
    };
  }

  function simulate() {
    if (activeTab === 'single') {
      const data = calculateCropData(selectedCrops[0]);
      setResult({ type: 'single', current: data });
      addToast(`Simulation updated with ${data.isLive ? 'LIVE' : 'Historical'} Market Rates`, 'success');
    } else {
      const dataSet = selectedCrops.filter(Boolean).map(calculateCropData);
      setResult({ type: 'compare', list: dataSet });
      addToast(`Comparison generated`, 'success');
    }
  }

  // Trigger sim on param change silently
  useEffect(() => {
    if (result) simulate();
    // eslint-disable-next-line
  }, [weather, market, irrigation, landArea, landUnit, selectedCrops, activeTab, livePrices]);

  async function handleExport() {
    if (!result || !reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      
      pdf.setFillColor(34, 197, 94); // farm-green equivalent
      pdf.rect(0, 0, w, 24, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('FarmAI Advanced Simulation Report', w/2, 14, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleString()} | Weather: ${weather} | Market: ${market}`, w/2, 21, { align: 'center' });
      
      pdf.addImage(imgData, 'PNG', 10, 30, w - 20, (h - 40) > ((w - 20) * canvas.height / canvas.width) ? ((w - 20) * canvas.height / canvas.width) : (h - 40));
      
      pdf.save(`FarmAI_Report_${Date.now()}.pdf`);
      addToast('Pro PDF report saved!', 'success');
    } catch(e) {
      addToast('Export failed. Please try again.', 'error');
    }
    setExporting(false);
  }

  // Common UI elements
  const toggleCropForCompare = (cropName) => {
    if (selectedCrops.includes(cropName)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(prev => prev.filter(c => c !== cropName));
      }
    } else {
      if (selectedCrops.length < 4) {
        setSelectedCrops(prev => [...prev, cropName]);
      } else {
        addToast('Maximum 4 crops can be compared at once', 'info');
      }
    }
  };

  // Memoized Chart data
  const chartData = useMemo(() => {
    if (!result) return null;
    const items = result.type === 'single' ? [result.current] : result.list;
    return {
      labels: items.map(i => `${i.icon} ${i.name}`),
      datasets: [
        {
          label: 'Total Cost (₹)',
          data: items.map(i => Math.round(i.cost)),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderRadius: 8,
          barPercentage: 0.6,
        },
        {
          label: 'Estimated Revenue (₹)',
          data: items.map(i => Math.round(i.revenue)),
          backgroundColor: 'rgba(52, 211, 153, 0.9)',
          borderRadius: 8,
          barPercentage: 0.6,
        },
        {
          label: 'Net Profit (₹)',
          data: items.map(i => Math.round(i.profit)),
          backgroundColor: items.map(i => i.profit >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(107, 114, 128, 0.8)'),
          borderColor: items.map(i => i.profit >= 0 ? '#2563eb' : '#4b5563'),
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.6,
        }
      ]
    };
  }, [result]);

  return (
    <section id="simulation" className="py-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center gap-2 justify-center mb-4">
             <span className="py-1.5 px-4 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-bold rounded-full text-xs uppercase tracking-widest">Pro Tool</span>
             {livePrices && <span className="py-1.5 px-4 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold rounded-full text-xs flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/> LIVE DATA SYNCED</span>}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Advanced Crop Simulator
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Model your farming financials with industry-grade precision. Adjust land, weather, and market parameters to forecast ROI and make data-driven decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Controls Sidebar (Glassmorphism) */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-farm-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Simulation Setup
              </h3>

              {/* Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
                <button onClick={() => { setActiveTab('single'); setSelectedCrops([selectedCrops[0] || 'Wheat']); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab==='single' ? 'bg-white dark:bg-gray-700 shadow text-farm-green dark:text-green-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Single Crop</button>
                <button onClick={() => setActiveTab('compare')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab==='compare' ? 'bg-white dark:bg-gray-700 shadow text-farm-green dark:text-green-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Compare (Pro)</button>
              </div>

              {/* Land Input */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Land Area</label>
                <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 ring-farm-green transition-all">
                  <input type="number" min="0.1" step="0.1" value={landArea} onChange={(e) => setLandArea(Number(e.target.value) || 0)}
                    className="flex-1 bg-transparent px-4 py-3 text-gray-900 dark:text-white font-bold outline-none" />
                  <select value={landUnit} onChange={e => setLandUnit(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 outline-none cursor-pointer">
                    <option value="Acre">Acres</option>
                    <option value="Hectare">Hectares</option>
                  </select>
                </div>
              </div>

              {/* Crop Selection UI */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Target Crop(s)</label>
                  {activeTab === 'compare' && <span className="text-xs font-bold text-farm-green bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">{selectedCrops.length}/4 selected</span>}
                </div>
                
                {activeTab === 'single' ? (
                  <div className="relative">
                    <select value={selectedCrops[0]} onChange={e => setSelectedCrops([e.target.value])}
                      className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 font-bold text-gray-800 dark:text-white outline-none focus:border-farm-green transition">
                      {Object.entries(CROPS).map(([k, v]) => <option key={k} value={k}>{v.icon} {k}</option>)}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-gray-400">▼</div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 h-48 overflow-y-auto custom-scrollbar">
                    {Object.entries(CROPS).map(([cropName, data]) => {
                      const isSelected = selectedCrops.includes(cropName);
                      return (
                        <button key={cropName} onClick={() => toggleCropForCompare(cropName)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-farm-green text-white border-farm-green shadow-md scale-105' 
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-farm-green/50 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}>
                          <span>{data.icon}</span> <span>{cropName}</span>
                          {isSelected && <svg className="w-3.5 h-3.5 ml-1 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Run Button */}
              <button onClick={() => { if(!result) simulate(); else addToast("Live sync is active. Adjust parameters to see updates automatically.", "info") }}
                className="w-full bg-farm-green hover:bg-green-600 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl shadow-[0_10px_20px_rgba(74,222,128,0.3)] hover:shadow-lg transition-all transform hover:-translate-y-0.5 mt-2 cursor-pointer relative overflow-hidden group">
                <span className="relative z-10">{result ? "Live Sync Active ⚡" : "Generate Report 📊"}</span>
                <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Quick Modifiers Ribbon */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-2 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-2 overflow-x-auto">
              <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1 relative">
                <div className="absolute left-4 text-xs font-bold text-gray-400 tracking-wider">🌤️ WEATHER</div>
                <div className="pl-24 flex flex-1 gap-1">
                  {WEATHER.map(w => (
                    <button key={w.value} onClick={() => setWx(w.value)}
                      className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${weather===w.value ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'}`}>
                      {w.value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1 relative">
                <div className="absolute left-4 text-xs font-bold text-gray-400 tracking-wider">📊 MARKET</div>
                <div className="pl-24 flex flex-1 gap-1">
                  {MARKETS.map(m => (
                    <button key={m.value} onClick={() => setMkt(m.value)}
                      className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${market===m.value ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'}`}>
                      {m.value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1 relative">
                <div className="absolute left-4 text-xs font-bold text-gray-400 tracking-wider">🚿 IRRIGATION</div>
                <div className="pl-28 flex flex-1 gap-1">
                  {IRRIGATION.map(i => (
                    <button key={i.value} onClick={() => setIrrig(i.value)}
                      className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${irrigation===i.value ? 'bg-white dark:bg-gray-700 shadow-sm text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'}`}>
                      {i.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Visuals Workspace */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden min-h-[500px] flex flex-col relative" ref={reportRef}>
              
              {!result ? (
                // Empty State
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-4xl text-farm-green">🌱</span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-3">Awaiting Parameters</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-8">Set your land area, select targeted crops, and adjust market conditions to generate a detailed predictive financial report.</p>
                  
                  <div className="flex gap-4">
                    <button onClick={() => loadPreset('Wheat')} className="px-5 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm font-bold hover:-translate-y-1 hover:shadow-md transition cursor-pointer flex items-center gap-2">🌾 Wheat Template</button>
                    <button onClick={() => loadPreset('Cotton')} className="px-5 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm font-bold hover:-translate-y-1 hover:shadow-md transition cursor-pointer flex items-center gap-2">🌿 Cotton Template</button>
                  </div>
                </div>
              ) : (
                // Results State
                <>
                  {/* Results Header */}
                  <div className="flex flex-wrap items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">Financial Projection Output</h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-3">
                        <span><span className="font-bold text-gray-700 dark:text-gray-300">Area:</span> {landArea} {landUnit}s</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span><span className="font-bold text-gray-700 dark:text-gray-300">Risk Factor:</span> {WEATHER.find(w=>w.value === weather).risk}</span>
                      </p>
                    </div>
                    <button onClick={handleExport} disabled={exporting}
                      className="mt-4 sm:mt-0 flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold px-6 py-2.5 rounded-xl text-sm transition-all transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-wait">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      {exporting ? 'Generating PDF...' : 'Download Report'}
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:px-8 bg-white dark:bg-gray-800">
                    {(result.type === 'single' ? [result.current] : result.list).map((d, i) => (
                      <div key={i} className="relative rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow group">
                        
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-500/5 to-transparent rounded-tr-2xl rounded-bl-full pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl bg-white dark:bg-gray-800 shadow-sm rounded-lg w-10 h-10 flex items-center justify-center border border-gray-100 dark:border-gray-700">{d.icon}</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200 text-[15px]">{d.name}</span>
                          </div>
                          <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full ${d.roi >= 50 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : d.roi >= 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>
                            {d.roi}% ROI
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Est. Profit {d.isLive ? '(LIVE)' : ''}</p>
                            <p className={`text-2xl font-black ${d.profit >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                              {d.profit >= 0 ? '' : '-'}₹{Math.abs(Math.round(d.profit)).toLocaleString('en-IN')}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                            <div className="flex justify-between items-center bg-red-50/50 dark:bg-red-900/10 px-2 py-1 rounded">
                              <span className="text-xs text-red-500 font-medium">Cost</span>
                              <span className="text-xs font-bold text-red-600 dark:text-red-400">₹{Math.round(d.cost).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center bg-green-50/50 dark:bg-green-900/10 px-2 py-1 rounded">
                              <span className="text-xs text-green-600 font-medium">Spot / Qt.</span>
                              <span className="text-xs font-bold text-green-600 dark:text-green-400">₹{Math.round(d.spotPrice).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Chart Visualizations */}
                  <div className="flex-1 p-6 sm:px-8 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/30 dark:bg-gray-800/50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm h-72">
                      <Bar 
                        data={chartData} 
                        options={{
                          responsive: true, 
                          maintainAspectRatio: false,
                          interaction: { mode: 'index', intersect: false },
                          plugins: {
                            legend: { display: true, position: 'top', align: 'end', labels: { font: { family: 'Inter', weight: 'bold', size: 11 }, usePointStyle: true, boxWidth: 8 } },
                            tooltip: { 
                              backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: { size: 13 }, bodyFont: { size: 13, weight: 'bold' }, padding: 12, cornerRadius: 8,
                              callbacks: { label: c => ` ₹${Math.abs(c.raw).toLocaleString('en-IN')}` } 
                            }
                          },
                          scales: {
                            y: { 
                              beginAtZero: true, 
                              grid: { color: 'rgba(156, 163, 175, 0.1)', drawBorder: false }, 
                              ticks: { callback: v => `₹${v >= 100000 ? (v/100000).toFixed(1)+'L' : (v/1000).toFixed(0)+'k'}`, font: { family: 'Inter', weight: '500' } } 
                            },
                            x: { 
                              grid: { display: false, drawBorder: false }, 
                              ticks: { font: { family: 'Inter', weight: 'bold', size: 12 } } 
                            }
                          }
                        }} 
                      />
                    </div>

                    {/* Expert AI Insights Block */}
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 text-xl">🧠</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">FarmAI Advisory Panel</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200/80 leading-relaxed">
                          {weather === 'Drought' 
                            ? `High drought risk selected. Ensure robust irrigation strategies (like Drip) are utilized. Crops with high water dependency may fail to yield projected revenue.` 
                            : weather === 'Flood'
                            ? `Heavy monsoon predicted. Implement robust field drainage. Deep-rooted or water-tolerant crops will perform best.`
                            : `Conditions are optimal. `}
                          {market === 'Volatile' 
                            ? `Market volatility is high. Recommended to engage with Govt MSP or forward contracts to secure baseline revenue.`
                            : ``}
                          {result.type === 'compare' && ` ${[...result.list].sort((a,b)=>b.profit - a.profit)[0].name} shows the strongest financial indicators in your current simulation parameters.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
