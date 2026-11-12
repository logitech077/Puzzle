import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Lock, Phone, User, ArrowRight, CheckCircle2, 
  AlertCircle, UserCheck, Shield, Sparkles 
} from 'lucide-react';

export const UserAuthModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    loginMember, 
    register, 
    quickLoginMember, 
    users,
    t, 
    language 
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Member Login state
  const [mobileOrId, setMobileOrId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Member Register state
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isRefFixed, setIsRefFixed] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  useEffect(() => {
    if (activeModal === 'user-register' || activeModal === 'register') {
      setTab('register');
    } else if (activeModal === 'user-login' || activeModal === 'login') {
      setTab('login');
    }

    try {
      const params = new URLSearchParams(window.location.search);
      let ref = params.get('ref') || '';
      if (ref) {
        localStorage.setItem('logitech_ref_code', ref.trim());
      } else {
        ref = localStorage.getItem('logitech_ref_code') || '';
      }

      if (ref) {
        setReferralCode(ref.toUpperCase());
        setIsRefFixed(true);
      }
    } catch {
      // ignore
    }
  }, [activeModal]);

  const isOpen = activeModal === 'user-login' || activeModal === 'user-register' || activeModal === 'login' || activeModal === 'register';

  if (!isOpen) return null;

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const res = loginMember(mobileOrId, password);
    if (res.success) {
      setLoginSuccess(res.message);
      setTimeout(() => {
        setActiveModal(null);
      }, 500);
    } else {
      setLoginError(res.message);
    }
  };

  const handleMemberRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword !== confirmPassword) {
      setRegError(t.passwordsMismatch);
      return;
    }

    const res = register(name, mobile, regPassword, referralCode);
    if (res.success) {
      setRegSuccess(res.message);
      setTimeout(() => {
        setActiveModal(null);
      }, 1000);
    } else {
      setRegError(res.message);
    }
  };

  const fillDemoMember = () => {
    setTab('login');
    setMobileOrId('9876543210');
    setPassword('password123');
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F223D] border border-[#1E3A5F] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Customer Header */}
        <div className="bg-gradient-to-r from-[#0A192F] via-[#132A4A] to-[#0A192F] p-5 border-b border-[#1E3A5F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {language === 'hi' ? 'ग्राहक पोर्टल' : 'Member / Customer Portal'}
              </h3>
              <p className="text-xs text-slate-400">
                {tab === 'login' 
                  ? (language === 'hi' ? 'ग्राहक लॉगिन (मोबाइल नंबर से)' : 'Customer Sign In with Mobile') 
                  : (language === 'hi' ? 'नया ग्राहक खाता बनाएं' : 'New Member Registration')}
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

        {/* Tab Switcher: Login / Register only */}
        <div className="flex border-b border-[#1E3A5F] bg-[#0A192F]/60">
          <button
            type="button"
            onClick={() => { setTab('login'); setLoginError(''); }}
            className={`flex-1 py-3 text-sm font-bold text-center transition cursor-pointer ${
              tab === 'login'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#0F223D]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hi' ? 'ग्राहक लॉगिन' : 'Customer Login'}
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setRegError(''); }}
            className={`flex-1 py-3 text-sm font-bold text-center transition cursor-pointer ${
              tab === 'register'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#0F223D]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hi' ? 'नया रजिस्ट्रेशन' : 'New Registration'}
          </button>
        </div>

        <div className="p-5">
          {tab === 'login' ? (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}
              {loginSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'hi' ? '10-अंकों का मोबाइल नंबर या यूजर आईडी' : '10-Digit Mobile Number or User ID'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={mobileOrId}
                    onChange={(e) => setMobileOrId(e.target.value)}
                    placeholder="9876543210 or LT000101"
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'hi' ? 'लॉग इन करें' : 'Log In to Member Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Switch to Register Tab if not registered */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => { setTab('register'); setRegError(''); }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 mx-auto font-semibold cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'नया खाता बनाना है? यहाँ फ्री रजिस्ट्रेशन करें' : "Don't have an account? Click to Register"}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMemberRegister} className="space-y-3.5">
              {regError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}
              {regSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.fullName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ramesh Sharma"
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.mobileNumber}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t.password}
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t.confirmPassword}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {language === 'hi' ? 'रेफरल कोड (Referral Code)' : 'Referral Code'}
                  </label>
                  {isRefFixed && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      {language === 'hi' ? 'ऑटो-फिक्स (Auto-Fixed)' : 'Auto-Locked to Sponsor'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly={isRefFixed}
                    onChange={(e) => !isRefFixed && setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LOGI-ADMIN or LT-RAMESH"
                    className={`w-full border rounded-xl px-4 py-2 text-sm font-mono font-bold uppercase transition focus:outline-none ${
                      isRefFixed
                        ? 'bg-[#081F15] border-emerald-500/70 text-emerald-300 cursor-not-allowed select-none shadow-sm shadow-emerald-500/20'
                        : 'bg-[#070F1E] border-[#1E3A5F] focus:border-cyan-400 text-white placeholder-slate-500'
                    }`}
                  />
                  {isRefFixed && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {(() => {
                  const sponsor = users.find(u => 
                    u.referralCode.toUpperCase() === referralCode.trim().toUpperCase() ||
                    u.id.toUpperCase() === referralCode.trim().toUpperCase()
                  );
                  if (sponsor) {
                    return (
                      <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-500/30">
                        <span>✓</span>
                        <span>
                          {language === 'hi' 
                            ? `वेरिफाइड स्पॉन्सर: ${sponsor.name} (${sponsor.referralCode}) • 10% डायरेक्ट कम्युनिटी रिवॉर्ड लागू।` 
                            : `Verified Sponsor: ${sponsor.name} (${sponsor.referralCode}) • 10% direct commission linked.`}
                        </span>
                      </p>
                    );
                  }
                  if (isRefFixed) {
                    return (
                      <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                        <span>✓</span>
                        <span>
                          {language === 'hi' 
                            ? `स्पॉन्सर रेफरल कोड (${referralCode}) लॉक है। आप इस टीम में सीधे जुड़ेंगे।`
                            : `Referral code is locked. You will join this sponsor's official team.`}
                        </span>
                      </p>
                    );
                  }
                  return (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {language === 'hi' ? 'यदि कोई रेफरल कोड हो तो दर्ज करें (वैकल्पिक)' : 'Enter your inviter referral code (optional)'}
                    </p>
                  );
                })()}
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'hi' ? 'रजिस्टर करें' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
