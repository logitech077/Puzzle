import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Shield, Lock, Key, ArrowRight, ShieldCheck, 
  Sparkles, AlertCircle, CheckCircle2, User, Landmark
} from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    loginAdmin, 
    quickLoginAdmin, 
    language 
  } = useApp();

  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (activeModal !== 'admin-login') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = loginAdmin(adminId, adminPassword);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setActiveModal(null);
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F223D] border-2 border-[#D4AF37]/50 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Header - Executive Super Admin Theme */}
        <div className="bg-gradient-to-r from-[#0A192F] via-[#1A365D] to-[#0A192F] p-5 border-b border-[#D4AF37]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F59E0B] p-0.5 shadow-md shadow-[#D4AF37]/20">
              <div className="w-full h-full bg-[#0A192F] rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-lg text-white">
                  SUPER ADMIN PORTAL
                </h3>
                <span className="text-[10px] bg-[#D4AF37] text-slate-950 px-1.5 py-0.5 rounded font-black">
                  SECURE
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                {language === 'hi' ? 'केवल अधिकृत एडमिनिस्ट्रेटर लॉगिन' : 'Authorized Personnel Access Only'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Assurance Badge */}
        <div className="bg-[#070F1E] mx-5 mt-4 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>
            {language === 'hi' 
              ? 'कृपया अपना एडमिन यूजर आईडी एवं पासवर्ड मैन्युअल दर्ज करें।' 
              : 'End-to-end encrypted administrative gate. Please enter your credentials manually.'}
          </span>
        </div>

        {/* Admin Form */}
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

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Admin User ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter Admin ID"
                className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none transition font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-[#D4AF37]/25 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'एडमिन लॉगिन करें' : 'Authenticate Super Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Dedicated Super Admin Security Notice */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <p className="text-[11px] text-amber-300/80 font-mono flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'hi' ? 'केवल सुपर एडमिन क्रेडेंशियल (logitech01) स्वीकार्य' : 'Super Admin Credentials (logitech01) Only'}</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
