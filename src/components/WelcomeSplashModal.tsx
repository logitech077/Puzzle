import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Sparkles, ShieldCheck, ArrowRight, X, User as UserIcon, CheckCircle2, Zap } from 'lucide-react';

interface WelcomeSplashModalProps {
  detectedRefCode?: string | null;
  forceOpen?: boolean;
  onClose?: () => void;
}

export const WelcomeSplashModal: React.FC<WelcomeSplashModalProps> = ({ 
  detectedRefCode,
  forceOpen,
  onClose
}) => {
  const { currentUser, language, setActiveModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    // If a direct portal link was opened (e.g. ?portal=admin or ?portal=user), do not show welcome splash
    try {
      const search = window.location.search;
      if (search) {
        const params = new URLSearchParams(search);
        const portal = (params.get('portal') || params.get('login') || '').toLowerCase();
        if ((portal === 'admin' || portal === 'user' || portal === 'register' || portal === 'member') && !forceOpen) {
          setIsOpen(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Check if welcome modal was already shown in this tab session
    const hasSeenWelcome = sessionStorage.getItem('logitech_welcome_seen');
    if (forceOpen || !hasSeenWelcome) {
      setIsOpen(true);
      sessionStorage.setItem('logitech_welcome_seen', 'true');
      setTimeLeft(5);
    }
  }, [forceOpen]);

  // Auto countdown for 5 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#D4AF37]/25 via-emerald-500/15 to-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0F223D] via-[#0A192F] to-[#070F1E] border-2 border-[#D4AF37]/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#D4AF37]/20 text-center space-y-6 overflow-hidden">
        {/* Top Shimmer Banner */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition cursor-pointer"
          title="Close / बंद करें"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Company Logo */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37] via-[#F59E0B] to-[#92400E] rounded-3xl blur-md opacity-70 animate-pulse" />
          <div className="relative w-full h-full bg-[#070F1E] border-2 border-[#D4AF37] rounded-3xl flex items-center justify-center shadow-xl p-3">
            <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-[#D4AF37] animate-bounce" style={{ animationDuration: '2.5s' }} />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        {/* Brand Name & Welcome Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Official Enterprise Fintech Network
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-display">
            LOGI<span className="text-[#D4AF37]">TECH</span> REWARDS
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            {language === 'hi' 
              ? 'लॉगिटेक एंटरप्राइज में आपका हार्दिक स्वागत है!' 
              : 'Welcome to Logitech Enterprise Referral & Rewards Platform!'}
          </p>
        </div>

        {/* Dynamic Personalized Card */}
        {currentUser ? (
          <div className="bg-[#070F1E]/90 border border-[#D4AF37]/50 rounded-2xl p-4 text-left shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                {language === 'hi' ? 'लॉग-इन सदस्य' : 'Logged In Member'}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                {currentUser.role === 'admin' ? 'Super Admin' : `${currentUser.planId} Tier`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-black text-amber-300 text-sm">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-base text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  ID: <span className="text-cyan-300 font-bold">{currentUser.id}</span> • {currentUser.mobile}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{language === 'hi' ? 'वॉलेट बैलेंस:' : 'Wallet Balance:'}</span>
              <span className="font-extrabold text-base text-emerald-400 font-mono">
                ₹{currentUser.walletBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ) : detectedRefCode ? (
          <div className="bg-[#070F1E]/90 border border-cyan-500/50 rounded-2xl p-4 text-left shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                🔗 {language === 'hi' ? 'रेफरल आमंत्रण' : 'Referral Invitation'}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                Code: {detectedRefCode}
              </span>
            </div>
            <p className="text-xs text-slate-200">
              {language === 'hi'
                ? `आपको स्पॉन्सर ${detectedRefCode} द्वारा आमंत्रित किया गया है। अभी रजिस्टर करें और 10% स्पॉन्सर कमीशन व दैनिक कमाई शुरू करें!`
                : `You were invited by Sponsor ${detectedRefCode}. Register now to earn automated daily profits & instant payouts!`}
            </p>
          </div>
        ) : (
          <div className="bg-[#070F1E]/90 border border-[#1E3A5F] rounded-2xl p-4 text-xs text-slate-300 space-y-1 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Automated Daily Income • Instant UPI Withdrawals • 10% Direct Bonus</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              India's trusted 24/7 financial reward and referral growth system.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-[#D4AF37]/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{language === 'hi' ? 'लॉगिटेक पोर्टल में प्रवेश करें' : 'Enter Logitech Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!currentUser && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  handleClose();
                  setActiveModal('user-login');
                }}
                className="py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {language === 'hi' ? 'ग्राहक लॉगिन' : 'Customer Login'}
              </button>
              <button
                onClick={() => {
                  handleClose();
                  setActiveModal('admin-login');
                }}
                className="py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {language === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}
              </button>
            </div>
          )}
        </div>

        {/* Auto dismiss timer indicator */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <span>Auto-closing in {timeLeft}s</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-ping" />
        </div>
      </div>
    </div>
  );
};
