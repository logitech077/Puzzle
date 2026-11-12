import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Wallet, ArrowRight, AlertCircle, CheckCircle2, 
  ShieldCheck, Banknote, Landmark, Smartphone 
} from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    currentUser, 
    settings, 
    requestWithdrawal, 
    t,
    language 
  } = useApp();

  const [amount, setAmount] = useState<number | ''>('');
  const [upiId, setUpiId] = useState('');
  const [upiMobile, setUpiMobile] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== 'withdraw' || !currentUser) {
    return null;
  }

  const handleQuickAmount = (val: number) => {
    if (val <= currentUser.walletBalance) {
      setAmount(val);
    } else {
      setAmount(currentUser.walletBalance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return;
    }

    if (numericAmount < settings.minWithdrawal) {
      setErrorMsg(`${t.minWithdrawalNotice}${settings.minWithdrawal}`);
      return;
    }

    if (settings.maxWithdrawal && numericAmount > settings.maxWithdrawal) {
      setErrorMsg(`Maximum withdrawal limit is ₹${settings.maxWithdrawal.toLocaleString('en-IN')}`);
      return;
    }

    if (numericAmount > currentUser.walletBalance) {
      setErrorMsg(t.insufficientBalance);
      return;
    }

    if (!upiId.trim() && !upiMobile.trim()) {
      setErrorMsg('Please provide either your UPI ID or UPI-linked Mobile Number.');
      return;
    }

    setIsSubmitting(true);
    const res = requestWithdrawal(
      numericAmount, 
      upiId.trim() || `${upiMobile.trim()}@upi`, 
      upiMobile.trim() || currentUser.mobile
    );
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setActiveModal(null);
      }, 2500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0F223D] border border-[#1E3A5F] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A192F] via-[#132A4A] to-[#0A192F] p-5 border-b border-[#1E3A5F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {t.withdrawMoney}
              </h3>
              <p className="text-xs text-slate-400">
                Direct Settlement into Bank via UPI
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="bg-[#070F1E] px-5 py-3 border-b border-[#1E3A5F] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">{t.availableBalance}</span>
            <span className="text-xl font-extrabold text-amber-300">
              ₹{currentUser.walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
              {language === 'hi' ? 'दैनिक निकासी सीमा' : '1-Day Daily Limit'}
            </span>
            <span className="text-xs font-extrabold text-white font-mono">
              ₹{settings.minWithdrawal} - ₹{settings.maxWithdrawal?.toLocaleString('en-IN') || '5,000'} / Day
            </span>
          </div>
        </div>

        {/* Withdrawal Mode Indicator (Admin Instant vs User Pending) */}
        <div className={`px-5 py-2 text-xs flex items-center gap-2 border-b ${
          currentUser.role === 'admin'
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
        }`}>
          {currentUser.role === 'admin' ? (
            <>
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>{language === 'hi' ? 'एडमिन मोड:' : 'Admin Mode:'}</strong> {language === 'hi' ? 'यह विड्रॉल तुरंत सफल (Direct Instant Success) होगा।' : 'Direct instant settlement. Instant approved & settled.'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>{language === 'hi' ? 'मेंबर मोड:' : 'Member Mode:'}</strong> {language === 'hi' ? 'विड्रॉल एडमिन अनुमोदन पर निर्भर है (Admin will verify and approve).' : 'Request is subject to Admin verification & approval before UPI payout.'}
              </span>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {t.enterWithdrawAmount} (₹)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Min ₹{settings.minWithdrawal} • Max ₹{settings.maxWithdrawal?.toLocaleString('en-IN') || '5,000'}/day
              </span>
            </div>
            <input
              type="number"
              min={settings.minWithdrawal}
              max={Math.min(currentUser.walletBalance, settings.maxWithdrawal || 5000)}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 320 or 1000"
              className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none transition"
            />

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[320, 500, 1000, 2500, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  disabled={val > currentUser.walletBalance || (settings.maxWithdrawal ? val > settings.maxWithdrawal : false)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  ₹{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQuickAmount(Math.min(currentUser.walletBalance, settings.maxWithdrawal || 5000))}
                disabled={currentUser.walletBalance < settings.minWithdrawal}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition cursor-pointer"
              >
                Max Limit
              </button>
            </div>
          </div>

          {/* UPI ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.customerUpiId}
            </label>
            <div className="relative">
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@okhdfcbank / paytm"
                className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* UPI Linked Mobile */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.customerUpiMobile}
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                maxLength={10}
                value={upiMobile}
                onChange={(e) => setUpiMobile(e.target.value.replace(/\D/g, ''))}
                placeholder={currentUser.mobile}
                className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Live 5% TDS Calculation Card */}
          {Number(amount) > 0 && (
            <div className="bg-[#070F1E] p-3.5 rounded-xl border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>{language === 'hi' ? 'अनुरोधित राशि (Gross):' : 'Gross Requested Amount:'}</span>
                <span className="font-bold text-white font-mono">₹{Number(amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-rose-300">
                <span>{language === 'hi' ? '5% टीडीएस कटौती (TDS 5%):' : 'Govt. Compliance TDS (5%):'}</span>
                <span className="font-bold font-mono">-₹{Math.round((Number(amount) * (settings.tdsPercent || 5)) / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="font-bold text-emerald-400">{language === 'hi' ? 'आपके UPI में जमा होने वाली शुद्ध राशि:' : 'Net Credited into Your UPI:'}</span>
                <span className="font-black text-base text-emerald-400 font-mono">
                  ₹{(Number(amount) - Math.round((Number(amount) * (settings.tdsPercent || 5)) / 100)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <div className="p-3 bg-[#070F1E] rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-amber-300 font-semibold block mb-0.5">5% TDS Deduction Notice:</span>
            As per policy, 5% TDS is deducted on every withdrawal. The net amount will be credited to your verified UPI ID. If rejected by the bank, 100% of your funds are returned safely to your wallet.
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !amount || Number(amount) < settings.minWithdrawal || Number(amount) > currentUser.walletBalance}
            className={`w-full py-3 px-4 rounded-xl shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer font-black text-sm ${
              currentUser.role === 'admin'
                ? 'bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-500 text-slate-950 shadow-amber-500/20 hover:brightness-110'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/20 hover:brightness-110'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Processing...'
                : currentUser.role === 'admin'
                  ? (language === 'hi' ? 'एडमिन डायरेक्ट विड्रॉल करें (Instant Success)' : 'Confirm Direct Admin Withdrawal (Instant Success)')
                  : (language === 'hi' ? 'विड्रॉल अनुरोध सबमिट करें (Pending Admin Approval)' : 'Submit Withdrawal (Pending Admin Approval)')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
