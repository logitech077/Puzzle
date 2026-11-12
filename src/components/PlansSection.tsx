import React from 'react';
import { useApp } from '../context/AppContext';
import { Plan } from '../types';
import { 
  Award, CheckCircle2, TrendingUp, Sparkles, 
  ArrowRight, ShieldCheck, Zap, Clock 
} from 'lucide-react';

export const PlansSection: React.FC = () => {
  const { 
    plans, 
    currentUser, 
    payments,
    setSelectedPlanForPurchase, 
    setActiveModal, 
    t, 
    language 
  } = useApp();

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanForPurchase(plan);
    if (!currentUser) {
      setActiveModal('user-login');
    } else {
      setActiveModal('payment');
    }
  };

  // Check current user's active plan or pending activation
  const activePlan = currentUser ? plans.find(p => p.id === currentUser.planId) : null;
  const pendingPayment = currentUser 
    ? payments.find(p => p.userId === currentUser.id && p.status === 'pending')
    : null;

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Active Plan / Pending Status Banner for Logged-in Customer */}
      {currentUser && (
        <div className="rounded-2xl border overflow-hidden shadow-2xl transition">
          {activePlan && currentUser.planId !== 'free' ? (
            <div className="bg-gradient-to-r from-[#072719] via-[#0A192F] to-[#0A2540] border-2 border-emerald-500/60 p-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-500/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        {language === 'hi' ? 'सक्रिय प्लान' : 'Current Active Plan'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        User ID: <strong className="text-white">{currentUser.id}</strong>
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display mt-1">
                      {language === 'hi' ? activePlan.nameHi : activePlan.name}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {language === 'hi'
                        ? 'आपकी आईडी सक्रिय है। आपको रात 12:00 बजे दैनिक आय आपके वॉलेट में स्वतः प्राप्त होगी।'
                        : 'Your ID is active. You will receive nightly daily return credited directly to your wallet.'}
                    </p>
                  </div>
                </div>

                {/* Daily Income Live Box */}
                <div className="bg-[#070F1E] border border-emerald-500/40 rounded-xl p-3.5 sm:p-4 text-center min-w-[200px]">
                  <span className="text-[11px] text-emerald-400 font-bold block uppercase tracking-wider">
                    {language === 'hi' ? 'आपकी दैनिक आय (Daily Income)' : 'Your Daily Income'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono mt-0.5">
                    ₹{activePlan.dailyEarning.toLocaleString('en-IN')}<span className="text-xs text-slate-400 font-normal"> / day</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    12:00 AM Auto-Credit • {activePlan.durationDays} Days
                  </span>
                </div>
              </div>
            </div>
          ) : pendingPayment ? (
            <div className="bg-gradient-to-r from-amber-950/60 via-[#0A192F] to-amber-950/60 border border-amber-500/50 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
                        {language === 'hi' ? 'सक्रियता प्रतीक्षारत (Pending Activation)' : 'Activation Pending'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      {pendingPayment.planName} (₹{pendingPayment.amount.toLocaleString('en-IN')})
                    </h3>
                    <p className="text-xs text-slate-300">
                      {language === 'hi'
                        ? 'आपका UTR जमा हो गया है। जैसे ही एडमिन आपकी ID को एक्टिवेट करेंगे, आपकी दैनिक आय तुरंत शुरू हो जाएगी।'
                        : 'Your payment is submitted. As soon as Admin activates your ID, daily income will begin.'}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/30 text-right">
                  UTR: {pendingPayment.utr}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F223D] border border-[#1E3A5F] p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'hi' ? 'सदस्यता स्थिति' : 'Membership Status'}
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {language === 'hi' ? 'नि:शुल्क सदस्य (Free Member)' : 'Free Member - No Plan Active'}
                </div>
              </div>
              <span className="text-xs text-amber-300 font-semibold">
                {language === 'hi' ? 'नीचे से कोई भी प्लान चुनें और दैनिक आय शुरू करें' : 'Select any plan below to activate daily income'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F3E5AB] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          Verified Daily ROI Packages
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
          {t.choosePlan}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-400">
          {t.plansSubtitle}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {plans.map((plan) => {
          const isCurrentPlan = currentUser?.planId === plan.id;
          const roiPercentage = Math.round((plan.totalReturn / plan.price) * 100);

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between bg-[#0F223D] rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#D4AF37]/15 ${
                isCurrentPlan 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30' 
                  : plan.isPopular 
                  ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40' 
                  : 'border-[#1E3A5F] hover:border-[#D4AF37]/50'
              }`}
            >
              {/* Badge if Popular or Active */}
              {isCurrentPlan ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t.activeBadge}
                </div>
              ) : plan.isPopular ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t.popularBadge}
                </div>
              ) : null}

              {/* Card Header */}
              <div className="p-5 pb-4 border-b border-[#1E3A5F]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                    {plan.badge || 'Standard'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {roiPercentage}% ROI
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-lg text-white mt-2">
                  {language === 'hi' ? plan.nameHi : plan.name}
                </h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ one-time</span>
                </div>
              </div>

              {/* Card Body - Financial Highlights */}
              <div className="p-5 space-y-3.5 flex-1 text-xs">
                {/* Daily Earning Highlight */}
                <div className="bg-[#070F1E] p-3 rounded-xl border border-[#1E3A5F] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{t.dailyRoi}</span>
                    <span className="text-base font-extrabold text-amber-300">
                      ₹{plan.dailyEarning.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500"> / day at 12 AM</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {t.validity}:
                  </span>
                  <span className="font-bold text-slate-200">
                    {plan.durationDays} {t.days}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    {t.totalReturn}:
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{plan.totalReturn.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Referral Commission:</span>
                  <span className="font-bold text-amber-300">
                    ₹{Math.round(plan.price * 0.1)} (10%)
                  </span>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-5 pt-0">
                {(() => {
                  const isPendingThisPlan = pendingPayment && pendingPayment.planId === plan.id;
                  if (isPendingThisPlan) {
                    return (
                      <div className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/50">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>{language === 'hi' ? 'सत्यापन पेंडिंग (Under Review)' : 'Pending Verification'}</span>
                      </div>
                    );
                  }
                  return (
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        isCurrentPlan
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 hover:brightness-110 shadow-md shadow-[#D4AF37]/20 active:scale-95'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isCurrentPlan ? 'Active Plan' : t.buyNow}</span>
                      {!isCurrentPlan && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
