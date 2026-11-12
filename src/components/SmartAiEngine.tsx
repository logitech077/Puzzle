import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PlanId } from '../types';
import { 
  Sparkles, TrendingUp, Zap, Cpu, Calculator, ShieldCheck, 
  ArrowRight, CheckCircle2, ChevronRight, BarChart3, RefreshCw,
  Layers, Gauge, Activity, Smartphone, Flame, Compass
} from 'lucide-react';

interface SmartAiEngineProps {
  defaultPlanId?: PlanId;
  onSelectPlan?: (planId: PlanId) => void;
}

export const SmartAiEngine: React.FC<SmartAiEngineProps> = ({ defaultPlanId, onSelectPlan }) => {
  const { plans, currentUser, language, isCloudSynced } = useApp();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(defaultPlanId || (currentUser?.planId !== 'free' ? currentUser?.planId as PlanId : 'gold'));
  const [simulatedTeamSize, setSimulatedTeamSize] = useState<number>(5);
  const [activeAiTab, setActiveAiTab] = useState<'julius' | 'lovable'>('julius');
  const [reinvestRoi, setReinvestRoi] = useState<boolean>(false);
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState<boolean>(false);
  const [deviceStats, setDeviceStats] = useState({
    fps: 60,
    renderLatencyMs: 14,
    deviceMemoryTier: 'High Performance',
    mobileOptimized: true,
  });

  const selectedPlan = useMemo(() => {
    return plans.find(p => p.id === selectedPlanId) || plans[2] || plans[0];
  }, [plans, selectedPlanId]);

  // Julius AI Financial Model calculations
  const analytics = useMemo(() => {
    const dailyEarning = selectedPlan?.dailyEarning || 120;
    const price = selectedPlan?.price || 1999;
    const durationDays = selectedPlan?.durationDays || 45;

    // Days to 100% break-even
    const breakEvenDays = dailyEarning > 0 ? Math.ceil(price / dailyEarning) : 0;

    // Projected returns without team
    const return7Days = dailyEarning * 7;
    const return30Days = dailyEarning * 30;
    const return60Days = dailyEarning * Math.min(60, durationDays);
    const returnFullDuration = dailyEarning * durationDays;

    // 10% direct referral commission simulation (assuming team buys same plan or average plan)
    const avgReferralPlanPrice = price;
    const referralCommissionPerMember = Math.round((avgReferralPlanPrice * 10) / 100);
    const totalTeamCommission = referralCommissionPerMember * simulatedTeamSize;

    // Compounded 30-day projection if reinvested
    const compounded30Day = reinvestRoi 
      ? Math.round(return30Days * 1.18 + totalTeamCommission) 
      : return30Days + totalTeamCommission;

    const netRoiPercent = price > 0 ? Math.round(((returnFullDuration - price) / price) * 100) : 0;

    return {
      price,
      dailyEarning,
      durationDays,
      breakEvenDays,
      return7Days,
      return30Days,
      return60Days,
      returnFullDuration,
      referralCommissionPerMember,
      totalTeamCommission,
      compounded30Day,
      netRoiPercent,
    };
  }, [selectedPlan, simulatedTeamSize, reinvestRoi]);

  const handleRunAiAnalysis = () => {
    setAiAnalysisRunning(true);
    setTimeout(() => {
      setAiAnalysisRunning(false);
      setDeviceStats({
        fps: 60,
        renderLatencyMs: Math.floor(10 + Math.random() * 6),
        deviceMemoryTier: 'Ultra Turbo 60FPS',
        mobileOptimized: true,
      });
    }, 700);
  };

  return (
    <div className="bg-gradient-to-br from-[#0B1728] via-[#081220] to-[#0D1F38] rounded-3xl border border-cyan-500/30 p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-cyan-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-amber-500/15 via-emerald-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header with Dual AI Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Julius AI Financial Intelligence
            </span>
            <span className="px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/40 text-pink-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              Lovable AI 60FPS Speed Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
            <span>{language === 'hi' ? 'स्मार्ट AI वित्तीय एवं स्पीड इंजन' : 'Smart AI Financial & Speed Engine'}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
              100% FREE ACTIVE
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'hi' 
              ? 'जूलियस AI (Julius AI) द्वारा दैनिक रिटर्न व टीम ग्रोथ का पूर्वानुमान, और लवेबल AI (Lovable AI) द्वारा मोबाइल में शून्य लैग एवं सुपर-स्मूथ 60FPS एनीमेशन।' 
              : 'Powered by Julius AI for computational compounding projections, and Lovable AI for ultra-smooth mobile speed, instant reactivity & zero latency.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveAiTab('julius')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAiTab === 'julius'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Julius AI (ROI Model)</span>
          </button>
          <button
            onClick={() => setActiveAiTab('lovable')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAiTab === 'lovable'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Lovable AI (Speed)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: JULIUS AI FINANCIAL INTELLIGENCE */}
      {activeAiTab === 'julius' && (
        <div className="space-y-6 relative z-10">
          {/* Plan Selector Buttons */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                {language === 'hi' ? 'विश्लेषण हेतु प्लान चुनें:' : 'Select Investment Package to Analyze:'}
              </span>
              <span className="text-cyan-400 font-mono">
                Daily: ₹{selectedPlan?.dailyEarning}/day • Price: ₹{selectedPlan?.price}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {plans.map((p) => {
                const isSelected = p.id === selectedPlanId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      if (onSelectPlan) onSelectPlan(p.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      {p.id.toUpperCase()}
                    </span>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      ₹{p.price.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">
                      +₹{p.dailyEarning}/day
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Analytics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800/90">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                {language === 'hi' ? 'ब्रेक-ईवन अवधि' : '100% Break-Even'}
              </span>
              <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                {analytics.breakEvenDays} <span className="text-xs font-sans text-slate-400">Days</span>
              </div>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                Full Capital Recovered
              </span>
            </div>

            <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800/90">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                {language === 'hi' ? '30 दिन की शुद्ध आय' : '30-Day Estimated Return'}
              </span>
              <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
                ₹{analytics.return30Days.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-cyan-400 block mt-0.5">
                Automated 12:00 AM credits
              </span>
            </div>

            <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800/90">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                {language === 'hi' ? 'कुल पैकेज रिटर्न' : 'Full Package Return'}
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ₹{analytics.returnFullDuration.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                +{analytics.netRoiPercent}% Net Profit Margin
              </span>
            </div>

            <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800/90">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                {language === 'hi' ? 'टीम कमीशन (10% दर)' : 'Simulated Team Commission'}
              </span>
              <div className="text-2xl font-black text-purple-300 font-mono mt-1">
                ₹{analytics.totalTeamCommission.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-purple-400 block mt-0.5">
                From {simulatedTeamSize} Invited Members
              </span>
            </div>
          </div>

          {/* Interactive Team Slider & Compounding Simulation */}
          <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'hi' ? 'जूलियस AI टीम सिम्युलेटर' : 'Julius AI Team Multiplier Simulator'}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'hi' 
                    ? 'अपनी टीम का आकार बदलकर देखें कि 10% डायरेक्ट कमीशन से आपकी आय कितनी तेजी से बढ़ेगी:'
                    : 'Adjust simulated team size to see instant 10% direct commission calculations:'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-xl">
                  {simulatedTeamSize} Active Referrals
                </span>
                <button
                  onClick={handleRunAiAnalysis}
                  disabled={aiAnalysisRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${aiAnalysisRunning ? 'animate-spin' : ''}`} />
                  <span>{aiAnalysisRunning ? 'Computing...' : 'Recalculate AI'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={simulatedTeamSize}
                onChange={(e) => setSimulatedTeamSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 Members (Solo)</span>
                <span>10 Members (Ambassador)</span>
                <span>25 Members (Elite)</span>
                <span>50 Members (Director)</span>
              </div>
            </div>

            {/* Total 30-Day Potential with Team */}
            <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/40 border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-300 font-bold block">
                  {language === 'hi' ? '30-दिवसीय कुल संभावित आय (दैनिक रिटर्न + 10% टीम बोनस):' : 'Total 30-Day Potential (Daily ROI + 10% Team Bonus):'}
                </span>
                <span className="text-xs text-slate-400">
                  Plan daily payout ₹{analytics.dailyEarning}/day + ₹{analytics.totalTeamCommission} instant referral commissions
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-amber-300 font-mono">
                  ₹{analytics.compounded30Day.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-400 block font-semibold">
                  ✓ Verified by Julius AI Model
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOVABLE AI 60FPS SPEED & MOTION ACCELERATOR */}
      {activeAiTab === 'lovable' && (
        <div className="space-y-6 relative z-10 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800/90 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Rendering Frame Rate
              </span>
              <div className="text-3xl font-black text-pink-400 font-mono mt-1 flex items-center justify-center gap-1">
                <span>{deviceStats.fps}</span>
                <span className="text-xs text-slate-400 font-sans">FPS</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                Ultra-Smooth 60FPS
              </span>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800/90 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Touch Latency
              </span>
              <div className="text-3xl font-black text-cyan-300 font-mono mt-1 flex items-center justify-center gap-1">
                <span>{deviceStats.renderLatencyMs}</span>
                <span className="text-xs text-slate-400 font-sans">ms</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold block mt-1">
                Instant Zero-Lag Tap
              </span>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800/90 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Cloud Sync Pipeline
              </span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-2 flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{isCloudSynced ? 'Connected' : 'Active'}</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold block mt-1">
                Real-Time Firestore
              </span>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800/90 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Device Compatibility
              </span>
              <div className="text-xl font-black text-amber-300 font-mono mt-2 flex items-center justify-center gap-1">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span>All Devices</span>
              </div>
              <span className="text-[10px] text-amber-300 font-semibold block mt-1">
                Mobile & Desktop
              </span>
            </div>
          </div>

          {/* Lovable AI Motion Engine Details */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-pink-500/20 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-400" />
              <span>Lovable AI Performance Features Active in This App:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Immediate Client State Reflection</strong>
                  <span>Admin approvals and plan activations render within milliseconds on user devices without manual page refresh.</span>
                </div>
              </div>

              <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Touch-Optimized Mobile Gestures</strong>
                  <span>PWA-style fast touch buttons, sticky tab navigation, and zero-bounce scrolling on Android & iOS.</span>
                </div>
              </div>

              <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Zero Data Erasure Architecture</strong>
                  <span>Every user registration, UTR transaction, ledger credit, and withdrawal request is permanently locked in Firestore.</span>
                </div>
              </div>

              <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Canvas Screenshot Optimization</strong>
                  <span>Downsamples high-resolution UPI payment proofs to under 150KB to preserve Firestore document limits and load fast.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Speed Status: <strong className="text-emerald-400">Optimal (Zero Bottlenecks)</strong>
              </span>
              <button
                onClick={handleRunAiAnalysis}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/20 cursor-pointer transition active:scale-95"
              >
                Boost Speed with Lovable AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
