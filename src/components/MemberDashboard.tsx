import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, Wallet, ArrowDownLeft, TrendingUp, Users, 
  Clock, ShieldCheck, Zap, Sparkles, PlusCircle, 
  ArrowRight, Copy, Check, Share2, CheckCircle2, MessageSquare, Target,
  Crown, Calendar, CalendarCheck, BadgeCheck
} from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { formatDateTime } from '../utils/dateFormatter';

interface MemberDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ setCurrentTab }) => {
  const { 
    currentUser, 
    plans, 
    users, 
    payments, 
    ledger, 
    setActiveModal, 
    setSelectedPlanForPurchase, 
    settings,
    t, 
    language,
    navigateToTeam,
    setSelectedTeamMember,
    runDailyDistribution 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [timeToMidnight, setTimeToMidnight] = useState('');
  const [showMidnightCelebration, setShowMidnightCelebration] = useState(false);

  // Calculate countdown to 12:00 AM IST
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // 12:00 AM next day
      const diff = midnight.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToMidnight(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        if (hours === 0 && minutes === 0 && seconds === 0) {
          runDailyDistribution(true);
          setShowMidnightCelebration(true);
          setTimeout(() => setShowMidnightCelebration(false), 8000);
        }
      } else {
        setTimeToMidnight('00:00:00');
        runDailyDistribution(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [runDailyDistribution]);

  if (!currentUser) {
    return (
      <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0D1E38] via-[#0A192F] to-[#152E52] border border-[#1E3A5F] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F3E5AB] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              Official Referral & Daily Return Engine
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              {t.brandName}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto">
              {t.tagline}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setActiveModal('user-login')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition cursor-pointer text-base flex items-center gap-2"
              >
                <span>{language === 'hi' ? 'ग्राहक लॉगिन' : 'Customer Login'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveModal('user-register')}
                className="bg-slate-800/80 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-xl border border-slate-700 transition cursor-pointer text-base"
              >
                {t.register}
              </button>
              <button
                onClick={() => setActiveModal('admin-login')}
                className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold px-6 py-3.5 rounded-xl transition cursor-pointer text-base flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <span>Super Admin Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activePlan = plans.find(p => p.id === currentUser.planId);
  const myTeam = users.filter(u => u.referredBy === currentUser.referralCode);
  const userLedger = ledger.filter(l => l.userId === currentUser.id).slice(0, 4);
  const userPendingPayment = payments.find(p => p.userId === currentUser.id && p.status === 'pending');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://logitech-rewards.app';
  const referralLink = `${origin}/?ref=${encodeURIComponent(currentUser.referralCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* PENDING RECHARGE / PLAN PURCHASE ALERT BANNER */}
      {userPendingPayment && (
        <div className="bg-gradient-to-r from-amber-950/90 via-[#13243C] to-amber-950/90 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-wider border border-amber-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    {language === 'hi' ? 'रिचार्ज पेंडिंग - एडमिन सत्यापन जारी' : 'Recharge Pending - Under Admin Review'}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    UTR: <strong className="text-amber-300 font-bold">{userPendingPayment.utr}</strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-extrabold text-white mt-1">
                  {userPendingPayment.planName} • ₹{userPendingPayment.amount.toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {language === 'hi'
                    ? 'आपका रिचार्ज अनुरोध सफलतापूर्वक दर्ज हो गया है। एडमिन द्वारा UTR सत्यापित होते ही आपका प्लान तुरंत सक्रिय हो जाएगा और दैनिक कमाई स्वतः शुरू हो जाएगी।'
                    : 'Your recharge request is currently under review by Admin. Once verified, your daily earnings will begin automatically.'}
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal('help-chat')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'एडमिन से सहायता चैट करें' : 'Chat with Admin about Recharge'}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right sm:border-l sm:border-slate-700/60 sm:pl-5 shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                {language === 'hi' ? 'जमा समय' : 'Requested At'}
              </span>
              <span className="text-xs font-mono text-slate-200">
                {new Date(userPendingPayment.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="mt-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  Status: PENDING
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attractive User Profile & Activation Showcase Card */}
      <div className="bg-gradient-to-br from-[#0D1E38] via-[#0A192F] to-[#132A4A] rounded-3xl border-2 border-[#1E3A5F] hover:border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          {/* Left: Luxury Glowing Avatar & User Profile Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Luxury Animated Avatar */}
            <div className="relative shrink-0 group">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#D4AF37] via-amber-400 to-cyan-400 p-[2.5px] shadow-xl shadow-[#D4AF37]/25 animate-pulse">
                <div className="w-full h-full bg-[#071326] rounded-[14px] sm:rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden border border-[#D4AF37]/40 group-hover:scale-105 transition-transform duration-300">
                  <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-[#D4AF37] drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)]" />
                  <span className="font-display font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-[#F3E5AB] tracking-widest mt-0.5">
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'VIP'}
                  </span>
                </div>
              </div>
              {/* Verified Shield Badge on Avatar */}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg border-2 border-[#0A192F] flex items-center justify-center" title="Verified Member">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
              </div>
            </div>

            {/* User Credentials & Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-500/40 text-[#F3E5AB] text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {language === 'hi' ? 'सत्यापित VIP सदस्य' : 'Verified VIP Member'}
                </span>
                {activePlan && currentUser.planId !== 'free' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {activePlan.name} • Active
                  </span>
                ) : userPendingPayment ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                    <Clock className="w-3 h-3 animate-spin" />
                    Pending Approval
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                    Free Member
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
                <span>{currentUser.name}</span>
              </h1>

              {/* ID & Referral Code with 1-Click Copy */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                {/* User ID Pill */}
                <div className="flex items-center bg-[#070F1E] border border-slate-700/80 rounded-xl px-2.5 py-1 gap-1.5 font-mono shadow-inner">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">User ID:</span>
                  <span className="text-white font-black">{currentUser.id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentUser.id);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="text-slate-400 hover:text-amber-300 transition cursor-pointer p-0.5 ml-0.5"
                    title="Copy User ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Referral Code Pill */}
                <div className="flex items-center bg-[#070F1E] border border-amber-500/40 rounded-xl px-2.5 py-1 gap-1.5 font-mono shadow-inner">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Referral:</span>
                  <span className="text-amber-300 font-black">{currentUser.referralCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentUser.referralCode);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="text-amber-300 hover:text-white transition cursor-pointer p-0.5 ml-0.5"
                    title="Copy Referral Code"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Direct Sponsor */}
                {currentUser.referredBy && (
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Sponsor: <strong className="text-slate-300 font-mono">{currentUser.referredBy}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('plans')}
              className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition cursor-pointer text-sm ${
                userPendingPayment
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 hover:brightness-110 shadow-[#D4AF37]/20'
              }`}
            >
              {userPendingPayment ? <Clock className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>{userPendingPayment ? (language === 'hi' ? 'सत्यापन पेंडिंग (प्रतीक्षारत)' : 'Verification Pending') : activePlan ? 'Upgrade Plan' : 'Buy Plan'}</span>
            </button>
            <button
              onClick={() => setActiveModal('withdraw')}
              disabled={currentUser.walletBalance < settings.minWithdrawal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition cursor-pointer text-sm"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{t.withdrawMoney}</span>
            </button>
            <button
              onClick={() => setActiveModal('help-chat')}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 font-bold px-4 py-2.5 rounded-xl border border-emerald-500/40 shadow-lg active:scale-95 transition cursor-pointer text-sm"
              title="24/7 Live Support Chat"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'सहायता चैट' : 'Support Chat'}</span>
            </button>
          </div>
        </div>

        {/* PROMINENT DATES SHOWCASE: Active Plan Date & Registration Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Box 1: Plan Activation Date (प्लान एक्टिवेशन दिनांक) */}
          <div className="bg-[#070F1E]/90 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-emerald-400 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-extrabold tracking-wider block">
                    {language === 'hi' ? '🗓️ प्लान सक्रिय दिनांक (Plan Activated At)' : '🗓️ Active Plan Date & Time'}
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-300 mt-0.5 font-mono">
                    {currentUser.planActivatedAt ? (
                      formatDateTime(currentUser.planActivatedAt, language)
                    ) : userPendingPayment ? (
                      <span className="text-amber-300 font-normal text-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        {language === 'hi' ? 'सत्यापन प्रतीक्षारत (Pending Verification)' : 'Approval Pending'}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal text-xs">
                        {language === 'hi' ? '⚠️ कोई प्लान सक्रिय नहीं (Inactive)' : 'Inactive / Free Account'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {activePlan && currentUser.planId !== 'free' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[11px] shrink-0">
                  ₹{activePlan.dailyEarning}/दिन
                </span>
              ) : (
                <button
                  onClick={() => setCurrentTab('plans')}
                  className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 font-bold text-[11px] rounded-lg shrink-0 cursor-pointer shadow hover:brightness-110"
                >
                  {language === 'hi' ? 'एक्टिव करें' : 'Activate'}
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>
                {activePlan && currentUser.planId !== 'free'
                  ? (() => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      const actStr = currentUser.planActivatedAt ? currentUser.planActivatedAt.slice(0, 10) : '';
                      if (actStr && todayStr <= actStr) {
                        return language === 'hi' 
                          ? `पैकेज: ${activePlan.name} • पहला दैनिक रिटर्न कल रात 12:00 AM से वॉलेट में स्वतः शुरू होगा।`
                          : `Package: ${activePlan.name} • First daily return starts tomorrow at 12:00 AM.`;
                      }
                      return language === 'hi'
                        ? `पैकेज: ${activePlan.name} • ₹${activePlan.dailyEarning}/दिन हर रात 12:00 बजे स्वतः वॉलेट में जमा होता है।`
                        : `Package: ${activePlan.name} • ₹${activePlan.dailyEarning}/day auto-credited nightly at 12:00 AM.`;
                    })()
                  : (language === 'hi' ? 'प्लान सक्रिय करते ही दैनिक रिटर्न रात 12:00 बजे वॉलेट में जुड़ेगा।' : 'Daily returns credited nightly at 12:00 AM upon activation.')}
              </span>
              <span className="text-emerald-400 font-semibold text-[10px]">
                {activePlan && currentUser.planId !== 'free' ? '● LIVE' : '○ INACTIVE'}
              </span>
            </p>
          </div>

          {/* Box 2: Registration Date (रजिस्ट्रेशन दिनांक) */}
          <div className="bg-[#070F1E]/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-cyan-400 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-extrabold tracking-wider block">
                    {language === 'hi' ? '📅 रजिस्ट्रेशन दिनांक (Registration Date)' : '📅 Account Created Date & Time'}
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-cyan-300 mt-0.5 font-mono">
                    {formatDateTime(currentUser.createdAt, language)}
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-[11px] shrink-0">
                Lifetime ID
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>
                {language === 'hi'
                  ? `स्पॉन्सर: ${currentUser.referredBy || 'Direct Company'} • स्टेटस: एक्टिव`
                  : `Sponsor: ${currentUser.referredBy || 'Direct Company'} • Status: Active`}
              </span>
              <span className="text-cyan-400 font-semibold text-[10px]">
                ✓ VERIFIED
              </span>
            </p>
          </div>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-[#070F1E]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
              {language === 'hi' ? 'कुल उपलब्ध वॉलेट फंड (Total Fund)' : 'Total Available Fund'}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1 font-display">
              ₹{currentUser.walletBalance.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ready for withdrawal
            </span>
          </div>

          <div className="bg-[#070F1E]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
              {t.totalEarnings}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-display">
              ₹{currentUser.totalEarnings.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> ROI + Referral Bonus
            </span>
          </div>

          {/* Today's Received Daily Income Card */}
          {(() => {
            const todayStr = new Date().toISOString().slice(0, 10);
            const isCredited = currentUser.lastDailyCreditDate && currentUser.lastDailyCreditDate.slice(0, 10) === todayStr;
            const activationDateStr = currentUser.planActivatedAt ? currentUser.planActivatedAt.slice(0, 10) : '';
            const isActivatedToday = activationDateStr && todayStr <= activationDateStr;
            const todayAmount = isCredited ? (currentUser.todayReceivedIncome || activePlan?.dailyEarning || 0) : 0;

            return (
              <div 
                onClick={() => setCurrentTab('wallet')}
                className="bg-[#070F1E]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#1E3A5F] hover:border-cyan-500/60 cursor-pointer transition group shadow-md"
                title="Click to view full daily income history in wallet"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                    {language === 'hi' ? 'आज प्राप्त दैनिक आय' : "Today's Received"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold mt-1 font-display">
                  {isCredited ? (
                    <span className="text-emerald-400 font-black">+₹{todayAmount}</span>
                  ) : (
                    <span className="text-slate-300">₹0</span>
                  )}
                  <span className="text-[11px] text-slate-400 font-normal ml-1">
                    (दर: ₹{activePlan ? activePlan.dailyEarning : 0}/दिन)
                  </span>
                </div>
                <span className={`text-[10px] flex items-center gap-1 mt-1 font-semibold ${isCredited ? 'text-emerald-400' : isActivatedToday ? 'text-amber-300' : 'text-cyan-400'}`}>
                  {isCredited ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{language === 'hi' ? '✓ आज का रिटर्न वॉलेट में जमा' : "✓ Credited to wallet today"}</span>
                    </>
                  ) : isActivatedToday ? (
                    <>
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{language === 'hi' ? 'कल रात 12:00 AM से शुरू' : 'Starts tomorrow 12:00 AM'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>{language === 'hi' ? '12:00 AM ऑटोमैटिक क्रेडिट' : 'Auto-credit at 12:00 AM'}</span>
                    </>
                  )}
                </span>
              </div>
            );
          })()}

          <div 
            onClick={() => navigateToTeam('all')}
            className="bg-[#070F1E]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#1E3A5F] hover:border-purple-500/60 hover:bg-[#0c1c36] cursor-pointer transition group shadow-md"
            title="Click to view all team members and their data"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                {t.teamSize}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 mt-1 font-display">
              {myTeam.length} Members
            </div>
            <span className="text-[10px] text-purple-300 flex items-center gap-1 mt-1 font-semibold">
              <Users className="w-3 h-3" /> {language === 'hi' ? 'क्लिक करें: टीम डेटा देखें →' : 'Click to view team data →'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Recharts Radial Progress & Earnings Milestone Section */}
      {(() => {
        const payoutTiers = [
          { target: settings.minWithdrawal || 320, label: language === 'hi' ? 'न्यूनतम विड्रॉल' : 'Min Payout', tier: 'Bronze' },
          { target: 500, label: 'Tier 2 Payout', tier: 'Silver' },
          { target: 1000, label: 'Tier 3 Payout', tier: 'Gold' },
          { target: 2500, label: 'Tier 4 Payout', tier: 'Platinum' },
          { target: settings.maxWithdrawal || 5000, label: 'Daily Cap Payout', tier: 'Diamond' },
        ];

        const currentBalance = currentUser.walletBalance;
        const nextPayoutMilestone = payoutTiers.find(t => t.target > currentBalance) || payoutTiers[payoutTiers.length - 1];
        const progressPercent = nextPayoutMilestone.target > 0
          ? Math.min(100, Math.max(0, Math.round((currentBalance / nextPayoutMilestone.target) * 100)))
          : 100;

        const radialChartData = [
          {
            name: 'Payout Progress',
            value: progressPercent,
            fill: progressPercent >= 100 ? '#10B981' : '#D4AF37',
          }
        ];

        const isEligibleForWithdrawal = currentBalance >= (settings.minWithdrawal || 320);

        return (
          <div className="bg-gradient-to-br from-[#0F223D] via-[#0E2038] to-[#0A192F] rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                    <span>{language === 'hi' ? 'निकासी व कमाई मील का पत्थर (Recharts Progress)' : 'Next Earnings Milestone & Payout Tier Progress'}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {progressPercent}% Complete
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'hi'
                      ? 'अपने अगले विड्रॉल स्तर (Payout Tier) और दैनिक रिटर्न लक्ष्य की लाइव प्रगति देखें:'
                      : 'Live visual tracking towards your next payout unlock and automated daily returns:'}
                  </p>
                </div>
              </div>

              {isEligibleForWithdrawal ? (
                <button
                  type="button"
                  onClick={() => setActiveModal('withdraw')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{language === 'hi' ? 'तुरंत UPI में निकालें' : 'Withdraw Now via UPI'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentTab('plans')}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:brightness-110 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'प्लान अपग्रेड करें' : 'Boost Returns'}</span>
                </button>
              )}
            </div>

            {/* Radial Chart & Step Milestone Progress */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Radial Progress Chart using Recharts */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-[#070F1E] rounded-2xl border border-slate-800">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="72%" 
                      outerRadius="100%" 
                      barSize={14} 
                      data={radialChartData} 
                      startAngle={90} 
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar 
                        background={{ fill: '#1E293B' }} 
                        dataKey="value" 
                        cornerRadius={8} 
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text inside Radial Ring */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                      {progressPercent}%
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold uppercase mt-0.5">
                      Next Tier
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono font-semibold">
                      ₹{nextPayoutMilestone.target.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2">
                  <span className="text-xs font-bold text-slate-200">
                    {language === 'hi' ? 'अगला विड्रॉल लक्ष्य:' : 'Next Milestone Goal:'}
                  </span>
                  <p className="text-[11px] text-emerald-400 font-mono font-extrabold">
                    ₹{nextPayoutMilestone.target.toLocaleString('en-IN')} ({nextPayoutMilestone.label})
                  </p>
                </div>
              </div>

              {/* Progress Detail & Step Tiers */}
              <div className="md:col-span-8 space-y-4">
                {/* Balance Stats Row */}
                <div className="grid grid-cols-3 gap-3 text-center bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available Wallet</span>
                    <span className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono">
                      ₹{currentBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Milestone Target</span>
                    <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                      ₹{nextPayoutMilestone.target.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remaining to Tier</span>
                    <span className="text-lg sm:text-xl font-extrabold text-cyan-300 font-mono">
                      ₹{Math.max(0, nextPayoutMilestone.target - currentBalance).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Progress to Next Tier:</span>
                    <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[#070F1E] h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-teal-400 to-[#D4AF37] h-full rounded-full transition-all duration-700 shadow-md"
                      style={{ width: `${Math.max(progressPercent, 4)}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Step Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center text-xs">
                  {payoutTiers.map((tier, idx) => {
                    const isPassed = currentBalance >= tier.target;
                    const isCurrent = nextPayoutMilestone.target === tier.target;

                    return (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded-xl border transition ${
                          isPassed
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : isCurrent
                              ? 'bg-[#152e52] border-amber-500/60 text-amber-300 shadow-md'
                              : 'bg-[#070F1E] border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 font-mono font-bold text-xs">
                          {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>₹{tier.target.toLocaleString('en-IN')}</span>
                        </div>
                        <span className="text-[10px] block mt-0.5 truncate opacity-90">
                          {tier.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status Notice Banner */}
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  isEligibleForWithdrawal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    {isEligibleForWithdrawal
                      ? (language === 'hi' ? '✓ बधाई हो! आप न्यूनतम सीमा पार कर चुके हैं और कभी भी विड्रॉल कर सकते हैं।' : '✓ Eligible for instant payout! Your balance qualifies for immediate UPI settlement.')
                      : (language === 'hi' ? `न्यूनतम ₹${settings.minWithdrawal || 320} सीमा पर पहुँचने के लिए केवल ₹${Math.max(0, (settings.minWithdrawal || 320) - currentBalance)} और शेष हैं।` : `Only ₹${Math.max(0, (settings.minWithdrawal || 320) - currentBalance)} more needed to reach minimum payout threshold.`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Active Plan Card & 12:00 AM Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="lg:col-span-2 bg-[#0F223D] rounded-2xl border border-[#1E3A5F] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {activePlan ? (language === 'hi' ? activePlan.nameHi : activePlan.name) : t.noActivePlan}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activePlan ? `₹${activePlan.price} Membership Package` : 'Activate a plan to start receiving daily returns'}
                  </p>
                </div>
              </div>

              {activePlan && currentUser.planId !== 'free' ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                  Active
                </span>
              ) : userPendingPayment ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'सत्यापन पेंडिंग' : 'Pending Approval'}
                </span>
              ) : (
                <button
                  onClick={() => setCurrentTab('plans')}
                  className="px-3 py-1 rounded-full bg-[#D4AF37] text-slate-950 font-bold text-xs hover:brightness-110 cursor-pointer"
                >
                  Activate Now
                </button>
              )}
            </div>

            {activePlan && currentUser.planId !== 'free' ? (
              <div className="grid grid-cols-3 gap-4 mt-5 text-center">
                <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Daily Return</span>
                  <span className="text-lg font-bold text-amber-300">₹{activePlan.dailyEarning} / day</span>
                </div>
                <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Plan Duration</span>
                  <span className="text-lg font-bold text-white">{activePlan.durationDays} Days</span>
                </div>
                <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Total Return</span>
                  <span className="text-lg font-bold text-emerald-400">₹{activePlan.totalReturn}</span>
                </div>
              </div>
            ) : userPendingPayment ? (
              <div className="mt-5 p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-bold">
                    {language === 'hi' ? 'अनुरोधित प्लान:' : 'Requested Package:'} {userPendingPayment.planName}
                  </span>
                  <span className="font-mono text-white font-extrabold">₹{userPendingPayment.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>UTR Reference: {userPendingPayment.utr}</span>
                  <span className="text-amber-400 font-bold">STATUS: PENDING</span>
                </div>
                <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                  {language === 'hi'
                    ? 'एडमिन सत्यापन के बाद यह प्लान आपकी ID में एक्टिवेट हो जाएगा और दैनिक आय जुड़ना शुरू हो जाएगी।'
                    : 'Admin is verifying your payment. Once approved, this plan will be activated on your ID.'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                You do not have an active investment package. Select a plan from Bronze (₹499) to Diamond (₹9999) to earn between ₹25 and ₹700 every single day directly into your wallet.
              </p>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Official Escrow Protection</span>
            <button
              onClick={() => setCurrentTab('plans')}
              className="text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All 5 Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 12:00 AM Countdown Clock & Guaranteed Auto-Credit */}
        <div className="bg-gradient-to-br from-[#0F223D] via-[#0E2038] to-[#0A192F] rounded-2xl border-2 border-emerald-500/40 p-6 shadow-xl flex flex-col justify-between text-center relative overflow-hidden">
          {showMidnightCelebration && (
            <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
              <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
              <h4 className="font-extrabold text-base text-emerald-300 mt-2 font-display">
                🎉 12:00 AM Midnight Auto-Credit!
              </h4>
              <p className="text-xs text-white mt-1">
                {language === 'hi'
                  ? `रात 12:00 बजे का दैनिक रिटर्न (+₹${activePlan?.dailyEarning || 0}) आपके वॉलेट में सफलता पूर्वक जुड़ चुका है!`
                  : `Your daily return of ₹${activePlan?.dailyEarning || 0} has been automatically credited to your wallet!`}
              </p>
              <button
                onClick={() => setShowMidnightCelebration(false)}
                className="mt-3 px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
              >
                OK
              </button>
            </div>
          )}

          <div>
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {language === 'hi' ? 'ऑटोमैटिक 12:00 AM क्रेडिट चालू' : 'Automated 12:00 AM Engine Active'}
            </div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              {t.nextCreditAt}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === 'hi' ? 'अगले दैनिक रिटर्न तक का समय:' : 'Time remaining until next automated credit:'}
            </p>
          </div>

          <div className="my-3">
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-widest bg-[#070F1E] py-3 rounded-2xl border border-slate-800 shadow-inner">
              {timeToMidnight || '00:00:00'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">HOURS : MINUTES : SECONDS</span>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] text-emerald-300 font-bold bg-emerald-950/60 py-2 px-3 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {activePlan && activePlan.id !== 'free'
                  ? (language === 'hi' 
                      ? `रात 12:00 बजे ₹${activePlan.dailyEarning} अपने आप वॉलेट में जुड़ेगा` 
                      : `₹${activePlan.dailyEarning}/day auto-credited at 12:00 AM`)
                  : (language === 'hi'
                      ? 'दैनिक रिटर्न हर रात 12:00 बजे अपने आप क्रेडिट होता है'
                      : 'Daily returns credited automatically at 12:00 AM')}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {language === 'hi' 
                ? 'किसी भी बटन को दबाने की आवश्यकता नहीं है, सिस्टम अपने आप क्रेडिट करता है।' 
                : 'Zero manual action needed. Completely automated by system.'}
            </p>
          </div>
        </div>
      </div>

      {/* Team Growth & Referral Milestones Section */}
      <div className="bg-gradient-to-br from-[#0F223D] via-[#0D1F38] to-[#0A1A30] rounded-3xl border border-[#1E3A5F] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Team Growth Progress
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display flex items-center gap-2">
                <span>{language === 'hi' ? 'टीम ग्रोथ एवं रेफरल प्रगति' : 'Team Growth & Referral Milestones'}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/30">
                  {myTeam.length >= 25 ? 'Diamond Elite' : myTeam.length >= 10 ? 'Gold Ambassador' : myTeam.length >= 5 ? 'Silver Captain' : myTeam.length >= 3 ? 'Bronze Leader' : 'Active Partner'}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'hi' 
                  ? 'अपने रेफरल लिंक से नए साथियों को जोड़ें। हर एक्टिवेशन पर 10% सीधा कमीशन आपके वॉलेट में जुड़ेगा।' 
                  : 'Track your referral journey. Every successful referral elevates your network tier and credits 10% instant commission.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#E5B834] text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Invite Link'}</span>
              </button>
              <button
                onClick={() => setCurrentTab('network')}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-1"
              >
                <span>Full Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Key Metrics Row */}
          {(() => {
            const totalReferrals = myTeam.length;
            const activeReferrals = myTeam.filter(u => u.planId !== 'free').length;
            const milestones = [
              { target: 3, label: 'Bronze Leader', bonus: '₹150 Bonus' },
              { target: 5, label: 'Silver Captain', bonus: '₹300 Bonus' },
              { target: 10, label: 'Gold Ambassador', bonus: '₹750 Bonus' },
              { target: 25, label: 'Diamond Elite', bonus: '₹2,000 Bonus' },
              { target: 50, label: 'Crown Director', bonus: '₹5,000 Bonus' },
            ];

            const nextMilestone = milestones.find(m => m.target > totalReferrals) || milestones[milestones.length - 1];
            const prevTarget = milestones.filter(m => m.target <= totalReferrals).pop()?.target || 0;
            const progressRange = Math.max(1, nextMilestone.target - prevTarget);
            const currentProgress = Math.max(0, totalReferrals - prevTarget);
            const progressPercent = totalReferrals >= nextMilestone.target 
              ? 100 
              : Math.min(100, Math.max(6, Math.round((currentProgress / progressRange) * 100)));
            const remainingToNext = Math.max(0, nextMilestone.target - totalReferrals);

            return (
              <div className="space-y-6">
                {/* 4 Cards Grid - Clickable & Interactive */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: Total Referrals */}
                  <div 
                    onClick={() => navigateToTeam('all')}
                    className="bg-[#070F1E] hover:bg-[#0c1c36] hover:border-cyan-500/60 p-4 rounded-2xl border border-slate-800/80 cursor-pointer transition group shadow-md"
                    title="Click to view all invited members and their complete details"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Total Referrals
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                        {totalReferrals}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Invited</span>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-bold mt-1.5 flex items-center gap-1 group-hover:underline">
                      <span>{language === 'hi' ? 'सभी मेंबर्स देखें →' : 'View all members →'}</span>
                    </span>
                  </div>

                  {/* Card 2: Active Plan Members (Click directly opens the 3 active members page & data) */}
                  <div 
                    onClick={() => navigateToTeam('active')}
                    className="bg-[#070F1E] hover:bg-[#062417] hover:border-emerald-500/80 p-4 rounded-2xl border-2 border-emerald-500/40 cursor-pointer transition group shadow-lg relative overflow-hidden"
                    title={`Click to view all ${activeReferrals} active paid members and their full data`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                        Active Plan Members
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                        {activeReferrals}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">Paid IDs</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-extrabold mt-1.5 flex items-center gap-1 group-hover:translate-x-1 transition bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      <span>{language === 'hi' ? `क्लिक: इन ${activeReferrals} का डेटा देखें →` : `Click: View ${activeReferrals} data →`}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 3: Referral Commissions */}
                  <div 
                    onClick={() => setCurrentTab('wallet')}
                    className="bg-[#070F1E] hover:bg-[#1a1705] hover:border-amber-500/60 p-4 rounded-2xl border border-slate-800/80 cursor-pointer transition group shadow-md"
                    title="Click to view wallet ledger and referral bonuses"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Referral Commissions
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                        ₹{currentUser.referralEarnings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-bold mt-1.5 flex items-center gap-1 group-hover:underline">
                      <span>{language === 'hi' ? 'वॉलेट लेजर देखें →' : 'View in Wallet →'}</span>
                    </span>
                  </div>

                  {/* Card 4: Next Growth Tier */}
                  <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Next Growth Tier
                    </span>
                    <div className="mt-1">
                      <span className="text-base sm:text-lg font-black text-white block truncate">
                        {nextMilestone.label}
                      </span>
                      <span className="text-[10px] font-semibold text-cyan-400">
                        {remainingToNext === 0 ? 'Goal Reached! 🎉' : `${remainingToNext} more needed`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Progress Bar Component */}
                <div className="bg-[#070F1E] p-5 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span className="font-bold text-white">
                        Milestone Progress: <span className="text-[#D4AF37]">{nextMilestone.label}</span> ({totalReferrals}/{nextMilestone.target} Referrals)
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-500/30">
                      {progressPercent}% Complete
                    </span>
                  </div>

                  {/* Progress Track */}
                  <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-[#D4AF37] transition-all duration-700 ease-out shadow-sm"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Milestone Indicators */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Current: {totalReferrals} Referrals</span>
                    <span className="text-amber-300 font-medium">
                      🎯 Goal: Reach {nextMilestone.target} Successful Referrals
                    </span>
                  </div>
                </div>

                {/* LIVE ACTIVE TEAM MEMBERS INSTANT DATA LIST (Directly on Dashboard) */}
                {activeReferrals > 0 && (
                  <div className="bg-[#070F1E] rounded-2xl border-2 border-emerald-500/40 p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <div>
                          <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                            <span>{language === 'hi' ? `सक्रिय मेंबर्स का लाइव डेटा (${activeReferrals} मेंबर्स)` : `Active Members Live Data (${activeReferrals} Members)`}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                              ALL DATA READY
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {language === 'hi'
                              ? 'नीचे दिए गए किसी भी मेंबर पर क्लिक करके उनका पूरा विवरण (प्लान, दैनिक आय, प्राप्त कमीशन) देखें।'
                              : 'Click any member below to inspect their full data, plan details, and your 10% commission.'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigateToTeam('active')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition cursor-pointer self-start sm:self-auto active:scale-95 whitespace-nowrap"
                      >
                        <span>{language === 'hi' ? 'पूरे पेज पर देखें →' : 'Go to Full Team Page →'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {myTeam.filter(u => u.planId !== 'free').map((m) => {
                        const pInfo = plans.find(p => p.id === m.planId);
                        const bonusAmount = pInfo ? Math.round(pInfo.price * 0.1) : 0;
                        return (
                          <div
                            key={m.id}
                            onClick={() => setSelectedTeamMember(m)}
                            className="bg-[#0B1728] hover:bg-[#10223D] border border-emerald-500/30 hover:border-emerald-400/80 p-3.5 rounded-xl cursor-pointer transition group shadow-sm flex flex-col justify-between space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                                  {m.id}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  ACTIVE
                                </span>
                              </div>
                              <h5 className="font-bold text-white text-sm mt-2 flex items-center justify-between">
                                <span>{m.name}</span>
                                <span className="text-xs font-mono text-slate-400">{m.mobile.slice(0, 3)}****{m.mobile.slice(7)}</span>
                              </h5>
                              <div className="text-xs text-amber-300 font-bold mt-1">
                                {pInfo ? pInfo.name : m.planId.toUpperCase()} • ₹{pInfo ? pInfo.price : ''}
                              </div>
                              <div className="text-[11px] text-cyan-300 mt-0.5">
                                Daily: +₹{pInfo ? pInfo.dailyEarning : 0}/day
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-slate-400">Your 10% Commission:</span>
                              <span className="font-mono font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded">
                                +₹{bonusAmount}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTeamMember(m);
                              }}
                              className="w-full py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>{language === 'hi' ? 'पूरा डेटा देखें (Full Data)' : 'View Full Data'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Quick Share Link Box */}
          <div className="bg-[#070F1E]/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <span className="text-[11px] text-slate-400 block">Your Dedicated Referral Link:</span>
              <span className="text-xs font-mono font-bold text-cyan-300 break-all select-all">
                {referralLink}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🚀 Join LOGITECH Rewards! Earn guaranteed daily income every midnight.\n\nUse Referral Code: ${currentUser.referralCode}\nSign up here: ${referralLink}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm shadow-emerald-600/30"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
