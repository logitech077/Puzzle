import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Clock, 
  Download, Filter, CheckCircle2, AlertCircle, Shield,
  TrendingUp, Sparkles, PlusCircle, Crown, Zap, CalendarCheck, Check, ArrowRight
} from 'lucide-react';

export const WalletSection: React.FC = () => {
  const { 
    currentUser, 
    ledger, 
    withdrawals, 
    payments,
    plans,
    setSelectedPlanForPurchase,
    setActiveModal, 
    exportToCsv, 
    settings,
    t, 
    language,
    claimUserDailyIncome,
    setCurrentTab
  } = useApp();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [claimToast, setClaimToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  if (!currentUser) {
    return (
      <div className="py-16 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
          <Wallet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Member Wallet Login Required</h3>
        <p className="text-sm text-slate-400 mb-6">
          Please log in with your Mobile number or User ID to view your live wallet ledger and earnings.
        </p>
        <button
          onClick={() => setActiveModal('user-login')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg hover:brightness-110 cursor-pointer"
        >
          {language === 'hi' ? 'ग्राहक लॉगिन करें' : 'Member Login'}
        </button>
      </div>
    );
  }

  // Filter user ledger entries
  const userLedger = ledger.filter(l => l.userId === currentUser.id);
  const filteredLedger = filterType === 'ALL' 
    ? userLedger 
    : userLedger.filter(l => l.type === filterType);

  // User pending withdrawals & payments
  const userWithdrawals = withdrawals.filter(w => w.userId === currentUser.id);
  const userPayments = payments.filter(p => p.userId === currentUser.id);

  const handleAddMoney = () => {
    const defaultPlan = plans.find(p => p.id !== 'free') || plans[0];
    if (defaultPlan) {
      setSelectedPlanForPurchase(defaultPlan);
    }
    setActiveModal('payment');
  };

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner / Stats */}
      <div className="bg-gradient-to-br from-[#0D1E38] via-[#0A192F] to-[#132A4A] rounded-3xl border border-[#1E3A5F] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              LOGITECH Protected Escrow Wallet
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              User ID: <span className="font-mono text-white font-bold">{currentUser.id}</span> • Plan: <span className="text-amber-300 uppercase font-bold">{currentUser.planId}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddMoney}
              className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition cursor-pointer text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addMoney}</span>
            </button>
            <button
              onClick={() => setActiveModal('withdraw')}
              disabled={currentUser.walletBalance < settings.minWithdrawal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition cursor-pointer text-sm"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{t.withdrawMoney}</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Balances Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-[#070F1E]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
              {language === 'hi' ? 'कुल उपलब्ध वॉलेट फंड (Total Fund)' : 'Total Available Fund'}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1 font-display">
              ₹{currentUser.walletBalance.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ready for instant withdrawal
            </span>
          </div>

          <div className="bg-[#070F1E]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
              {t.pendingBalance}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 mt-1 font-display">
              ₹{currentUser.pendingBalance.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-amber-400/80 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Under admin UTR review
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

          <div className="bg-[#070F1E]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
              {t.totalWithdrawn}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1 font-display">
              ₹{currentUser.totalWithdrawn.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-cyan-400/80 flex items-center gap-1 mt-1">
              <Shield className="w-3 h-3" /> Settled to bank account
            </span>
          </div>
        </div>
      </div>

      {/* Claim Toast Notification */}
      {claimToast && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xl animate-fade-in ${
          claimToast.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' 
            : claimToast.type === 'error'
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
            : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{claimToast.message}</span>
          </div>
          <button 
            onClick={() => setClaimToast(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Plan Daily Income & Wallet Credit Status Section */}
      {(() => {
        const activePlan = plans.find(p => p.id === currentUser.planId);
        const todayDateStr = new Date().toISOString().slice(0, 10);
        const lastCreditDateStr = currentUser.lastDailyCreditDate ? currentUser.lastDailyCreditDate.slice(0, 10) : '';
        const isCreditedToday = lastCreditDateStr === todayDateStr;
        const dailyRoiEntries = userLedger.filter(l => l.type === 'DAILY_ROI');
        const totalDailyRoiAmount = dailyRoiEntries.reduce((sum, e) => sum + e.amount, 0);

        const handleManualClaim = () => {
          setIsClaiming(true);
          const res = claimUserDailyIncome(currentUser.id);
          setIsClaiming(false);
          setClaimToast({
            type: res.success ? 'success' : 'info',
            message: res.message
          });
          setTimeout(() => setClaimToast(null), 6000);
        };

        if (!activePlan || activePlan.id === 'free') {
          return (
            <div className="bg-gradient-to-r from-amber-950/40 via-[#0F223D] to-amber-950/30 rounded-3xl border-2 border-amber-500/40 p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Crown className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      Free Member Plan
                    </span>
                    <span className="text-xs text-amber-300 font-bold">Daily Income: ₹0/Day</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                    {language === 'hi' ? 'दैनिक इनकम शुरू करने के लिए एक्टिव प्लान चुनें' : 'Activate a Paid Plan to Start Receiving Daily Income'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    {language === 'hi' 
                      ? 'वर्तमान में आप फ्री प्लान पर हैं। ब्रॉन्ज (₹25/दिन), सिल्वर (₹55/दिन), गोल्ड (₹150/दिन), प्लेटिनम (₹320/दिन) या डायमंड (₹700/दिन) प्लान सक्रिय करें और रोज रात 12:00 बजे अपने वॉलेट में गारंटीड दैनिक रिटर्न पाएं।'
                      : 'You are on the Free tier. Activate Bronze (₹25/day), Silver (₹55/day), Gold (₹150/day), Platinum (₹320/day), or Diamond (₹700/day) to receive daily automated ROI in this wallet!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (setCurrentTab) setCurrentTab('plans');
                  else setActiveModal('payment');
                }}
                className="shrink-0 px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:brightness-110 active:scale-95 transition flex items-center gap-2 cursor-pointer"
              >
                <span>{language === 'hi' ? 'प्लान चुनें व एक्टिव करें' : 'View Plans & Activate'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        }

        return (
          <div className="bg-gradient-to-br from-[#0F223D] via-[#0E223D] to-[#0A192F] rounded-3xl border-2 border-emerald-500/50 p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header & Plan Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 p-0.5 shadow-lg shadow-[#D4AF37]/20 shrink-0">
                  <div className="w-full h-full bg-[#070F1E] rounded-[14px] flex items-center justify-center">
                    <Crown className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-base sm:text-lg text-white font-display">
                      {activePlan.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      🟢 ACTIVE PLAN
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 bg-black/40 border border-amber-500/30">
                      ₹{activePlan.price.toLocaleString('en-IN')} Tier
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {language === 'hi' 
                      ? `प्लान के अनुसार दैनिक इनकम: ₹${activePlan.dailyEarning}/दिन • अवधि: ${activePlan.durationDays} दिन (कुल रिटर्न: ₹${activePlan.totalReturn})`
                      : `Daily Income as per Plan: ₹${activePlan.dailyEarning}/Day • Duration: ${activePlan.durationDays} Days (Total Return: ₹${activePlan.totalReturn})`}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isCreditedToday ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'hi' ? '✅ आज का दैनिक रिटर्न जमा' : "✅ Today's Income Credited"}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleManualClaim}
                    disabled={isClaiming}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                    title="Click to credit today's daily return to wallet immediately"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>{isClaiming ? 'Crediting...' : (language === 'hi' ? '⚡ आज का रिटर्न अभी वॉलेट में जोड़ें' : "Claim Today's ₹" + activePlan.dailyEarning)}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3-Point Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Daily Income Rate */}
              <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                  {language === 'hi' ? 'दैनिक प्लान रिटर्न' : 'Plan Daily Return'}
                </span>
                <div className="text-2xl font-extrabold text-cyan-300 font-display mt-1">
                  ₹{activePlan.dailyEarning}
                  <span className="text-xs text-slate-400 font-normal ml-1">/ दिन (Daily)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Automated at 12:00 AM IST
                </p>
              </div>

              {/* Today's Credit State */}
              <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                  {language === 'hi' ? "आज प्राप्त दैनिक आय (Today Received)" : "Today's Received Amount"}
                </span>
                {(() => {
                  const activationDateStr = currentUser.planActivatedAt ? currentUser.planActivatedAt.slice(0, 10) : '';
                  const isActivatedToday = activationDateStr && todayDateStr <= activationDateStr;
                  const todayAmount = isCreditedToday ? (currentUser.todayReceivedIncome || activePlan.dailyEarning) : 0;

                  return (
                    <>
                      <div className="text-xl font-extrabold font-display mt-1 flex items-center gap-1.5">
                        {isCreditedToday ? (
                          <>
                            <Check className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 font-black">+₹{todayAmount} Credited</span>
                          </>
                        ) : isActivatedToday ? (
                          <>
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300 text-sm">₹0 (कल 12 AM से शुरू)</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300 text-sm">₹0 (रात 12 AM पेंडिंग)</span>
                          </>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        {isCreditedToday 
                          ? '✓ आज रात 12:00 AM पर वॉलेट में जमा हुआ'
                          : isActivatedToday
                          ? 'पहला दैनिक रिटर्न कल रात 12:00 AM से वॉलेट में आएगा'
                          : currentUser.lastDailyCreditDate 
                          ? `Last: ${new Date(currentUser.lastDailyCreditDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
                          : 'Awaiting first daily payout'}
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Total Daily Income Earned */}
              <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                  {language === 'hi' ? 'कुल दैनिक रिटर्न प्राप्त' : 'Total Daily Returns Earned'}
                </span>
                <div className="text-2xl font-extrabold text-amber-300 font-display mt-1">
                  ₹{totalDailyRoiAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {dailyRoiEntries.length} daily payouts credited to date
                </p>
              </div>
            </div>

            {/* Quick shortcut to filter passbook by Daily Returns */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">
                {language === 'hi' 
                  ? 'सभी दैनिक रिटर्न एंट्रीज नीचे पासबुक में लाइव रिकॉर्ड होती हैं।' 
                  : 'Every daily payout is permanently audited in your ledger passbook below.'}
              </span>
              <button
                onClick={() => setFilterType('DAILY_ROI')}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1 cursor-pointer"
              >
                <span>Filter Daily Returns in Ledger →</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Recharge / Payment Status Tracker if any exist */}
      {userPayments.length > 0 && (
        <div className="bg-[#0F223D] rounded-2xl border border-amber-500/40 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'रिचार्ज व प्लान भुगतान अनुरोध' : 'Recharge & Plan Purchase Requests'}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">Total: {userPayments.length} Requests</span>
          </div>
          <div className="space-y-2.5">
            {userPayments.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#070F1E] rounded-xl border border-slate-800 text-xs gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 font-semibold">{p.id}</span>
                    <span className="text-amber-300 font-bold">{p.planName}</span>
                  </div>
                  <p className="font-mono font-black text-white text-sm mt-0.5">₹{p.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-cyan-300 font-mono mt-0.5">UTR: {p.utr} • Via: {p.paymentMethod}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] inline-block ${
                    p.status === 'approved' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : p.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}>
                    {p.status === 'pending' ? (language === 'hi' ? 'सत्यापन पेंडिंग (PENDING)' : 'PENDING') : p.status.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(p.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {p.rejectionReason && (
                    <p className="text-[10px] text-rose-400 mt-0.5">
                      Reason: {p.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal Status Tracker if any exist */}
      {userWithdrawals.length > 0 && (
        <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] p-5">
          <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Active Withdrawal Requests
          </h3>
          <div className="space-y-2">
            {userWithdrawals.slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-3 bg-[#070F1E] rounded-xl border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-mono text-slate-400 font-semibold">{w.id}</span>
                  <p className="font-bold text-white text-sm">₹{w.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-slate-400">To UPI: {w.upiId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                    w.status === 'approved' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : w.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {w.status}
                  </span>
                  {w.payoutReference && (
                    <p className="text-[10px] font-mono text-slate-500 mt-1">
                      Ref: {w.payoutReference}
                    </p>
                  )}
                  {w.rejectionReason && (
                    <p className="text-[10px] text-rose-400 mt-1">
                      Reason: {w.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Ledger & History */}
      <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-[#1E3A5F] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              {t.recentTransactions}
            </h3>
            <p className="text-xs text-slate-400">
              Immutable ledger of daily ROI, referral commissions, and payouts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-[#070F1E] p-1 rounded-xl border border-[#1E3A5F] text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === 'ALL' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('DAILY_ROI')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === 'DAILY_ROI' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily ROI
              </button>
              <button
                onClick={() => setFilterType('REFERRAL_BONUS')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === 'REFERRAL_BONUS' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Referral
              </button>
              <button
                onClick={() => setFilterType('WITHDRAWAL_REQUEST')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === 'WITHDRAWAL_REQUEST' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Withdrawals
              </button>
            </div>

            <button
              onClick={() => exportToCsv('ledger')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportCsv}</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#070F1E] text-slate-400 font-semibold border-b border-[#1E3A5F]">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    {t.noTransactions}
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item) => {
                  const isCredit = item.amount >= 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.type === 'DAILY_ROI'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : item.type === 'REFERRAL_BONUS'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : item.type === 'WITHDRAWAL_REQUEST'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        }`}>
                          {isCredit ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownLeft className="w-3 h-3 text-rose-400" />}
                          {item.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {language === 'hi' ? item.descriptionHi || item.description : item.description}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold text-sm font-mono ${
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isCredit ? '+' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-400">
                        ₹{item.balanceAfter.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {new Date(item.createdAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
