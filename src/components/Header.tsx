import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, Wallet, Users, Award, FileText, LayoutDashboard, 
  Globe, LogIn, LogOut, UserPlus, Menu, X, CheckCircle2, 
  ChevronDown, Crown, MessageSquare, Headphones, Link2, Copy, Check
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    currentUser, 
    logout, 
    language, 
    setLanguage, 
    t, 
    settings, 
    setActiveModal, 
    quickLoginAdmin,
    isCloudSynced,
    supportMessages 
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-z7xswghmo7tnd4txpzmypy-910864599647.asia-east1.run.app';
  const userLoginUrl = `${origin}/?portal=user`;
  const adminLoginUrl = `${origin}/?portal=admin`;
  const registerUrl = `${origin}/?portal=register`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const announcement = language === 'hi' ? settings.announcementHi : settings.announcementEn;

  // Unread badge calculations
  const unreadCount = currentUser?.role === 'admin'
    ? supportMessages.filter(m => m.sender === 'user' && !m.readByAdmin).length
    : supportMessages.filter(m => (m.userId === (currentUser?.id || 'GUEST') || m.userId === 'U-ALL') && m.sender === 'admin' && !m.readByUser).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0A192F]/95 backdrop-blur-md border-b border-[#1E3A5F] shadow-lg">
      {/* Announcement Ticker */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-b border-amber-500/20 py-1.5 px-4 text-xs text-amber-200/90 text-center flex items-center justify-center gap-2 overflow-hidden">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-medium tracking-wide truncate max-w-4xl">
          {announcement}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#F59E0B] to-[#92400E] p-0.5 shadow-md shadow-[#D4AF37]/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0A192F] rounded-[10px] flex items-center justify-center border border-[#D4AF37]/40">
                <Crown className="w-6 h-6 text-[#D4AF37] animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg sm:text-2xl tracking-wider text-white">
                  LOGI<span className="text-[#D4AF37]">TECH</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/30 rounded">
                  Fintech
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isCloudSynced ? 'Firebase Live' : 'Firebase Ready'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 tracking-wider hidden sm:block">
                REFERRAL & REWARDS ENTERPRISE • 60FPS SMOOTH SPEED
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'dashboard'
                  ? 'bg-[#1E3A5F] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t.dashboard}
            </button>

            <button
              onClick={() => setCurrentTab('plans')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'plans'
                  ? 'bg-[#1E3A5F] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              {t.plans}
            </button>

            <button
              onClick={() => setCurrentTab('wallet')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'wallet'
                  ? 'bg-[#1E3A5F] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {t.wallet}
            </button>

            <button
              onClick={() => setCurrentTab('network')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'network'
                  ? 'bg-[#1E3A5F] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              {t.network}
            </button>

            <button
              onClick={() => setCurrentTab('declaration')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'declaration'
                  ? 'bg-[#1E3A5F] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              {t.declaration}
            </button>

            {/* 24/7 Live Support Chat Button */}
            <button
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  setCurrentTab('admin');
                } else {
                  setActiveModal('help-chat');
                }
              }}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/40 border border-emerald-500/30 cursor-pointer"
              title="24/7 Live Customer Help & Support Chat"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'सहायता चैट' : 'Support Chat'}</span>
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-bounce shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Admin Center Button */}
            <button
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  setCurrentTab('admin');
                } else {
                  setActiveModal('admin-login');
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 shadow-md'
                  : 'text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <Shield className="w-4 h-4 text-inherit" />
              {t.adminPanel}
            </button>
          </nav>

          {/* Right Area: Language Switch + Links Button + User Status / Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Links Modal Button */}
            <button
              onClick={() => setShowLinksModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition cursor-pointer"
              title="Separate Admin & User Login Links (अलग-अलग लॉगिन लिंक)"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'लॉगिन लिंक्स' : 'Direct Links'}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#070F1E] rounded-lg p-0.5 border border-[#1E3A5F]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded transition ${
                  language === 'en'
                    ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 text-xs font-bold rounded transition ${
                  language === 'hi'
                    ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* User Profile or Separate Login Triggers */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' ? (
                  <div className="flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1.5 rounded-xl">
                    <Shield className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-bold text-[#F3E5AB]">Admin (logitech01)</span>
                  </div>
                ) : (
                  <div 
                    onClick={() => setCurrentTab('dashboard')}
                    className="flex items-center gap-2 bg-[#0F223D] hover:bg-[#152e52] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-[#D4AF37]/40 cursor-pointer transition shadow-md group"
                    title={`User: ${currentUser.name} (ID: ${currentUser.id})`}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#D4AF37] to-cyan-400 p-[1.5px] shadow-sm shrink-0">
                      <div className="w-full h-full bg-[#071326] rounded-[6px] flex items-center justify-center">
                        <Crown className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate max-w-[80px] sm:max-w-[120px]">
                          {currentUser.name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-500/30 hidden xs:inline">
                          {currentUser.id}
                        </span>
                      </div>
                      <div className="text-xs font-extrabold text-amber-300 leading-tight mt-0.5">
                        ₹{currentUser.walletBalance.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={logout}
                  title={t.logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* 1. Dedicated Member Login */}
                <button
                  onClick={() => setActiveModal('user-login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 rounded-lg transition border border-cyan-500/30 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'hi' ? 'ग्राहक लॉगिन' : 'User Login'}</span>
                </button>

                {/* 2. Customer Registration */}
                <button
                  onClick={() => setActiveModal('user-register')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t.register}</span>
                </button>

                {/* 3. Dedicated Admin Portal Login */}
                <button
                  onClick={() => setActiveModal('admin-login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 hover:brightness-110 rounded-lg transition shadow-md shadow-[#D4AF37]/20 cursor-pointer"
                >
                  <Shield className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>{language === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A192F] border-b border-[#1E3A5F] px-4 pt-2 pb-6 space-y-2">
          {currentUser && (
            <div className="bg-[#0F223D] p-3 rounded-xl border border-[#D4AF37]/30 mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">User ID: <span className="text-white font-mono">{currentUser.id}</span></p>
                <p className="text-base font-bold text-white">{currentUser.name}</p>
                <p className="text-xs text-[#D4AF37] capitalize font-medium">{currentUser.planId} Plan</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Wallet</p>
                <p className="text-lg font-extrabold text-amber-300">₹{currentUser.walletBalance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {!currentUser && (
            <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-slate-800">
              <button
                onClick={() => {
                  setActiveModal('user-login');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ग्राहक लॉगिन' : 'User Login'}</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('admin-login');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              currentTab === 'dashboard' ? 'bg-[#1E3A5F] text-[#D4AF37]' : 'text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t.dashboard}
          </button>

          <button
            onClick={() => { setCurrentTab('plans'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              currentTab === 'plans' ? 'bg-[#1E3A5F] text-[#D4AF37]' : 'text-slate-300'
            }`}
          >
            <Award className="w-4 h-4" />
            {t.plans}
          </button>

          <button
            onClick={() => { setCurrentTab('wallet'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              currentTab === 'wallet' ? 'bg-[#1E3A5F] text-[#D4AF37]' : 'text-slate-300'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {t.wallet}
          </button>

          <button
            onClick={() => { setCurrentTab('network'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              currentTab === 'network' ? 'bg-[#1E3A5F] text-[#D4AF37]' : 'text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            {t.network}
          </button>

          <button
            onClick={() => { setCurrentTab('declaration'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              currentTab === 'declaration' ? 'bg-[#1E3A5F] text-[#D4AF37]' : 'text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t.declaration}
          </button>

          {/* 24/7 Support Chat button for mobile */}
          <button
            onClick={() => { 
              if (currentUser?.role === 'admin') {
                setCurrentTab('admin');
              } else {
                setActiveModal('help-chat');
              }
              setMobileMenuOpen(false); 
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'सहायता चैट (24/7 Live Support)' : 'Support Help & Live Chat'}</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { 
              if (currentUser?.role === 'admin') {
                setCurrentTab('admin'); 
              } else {
                setActiveModal('admin-login');
              }
              setMobileMenuOpen(false); 
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 cursor-pointer`}
          >
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            {t.adminPanel}
          </button>

          <button
            onClick={() => {
              setShowLinksModal(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <Link2 className="w-4 h-4" />
            <span>{language === 'hi' ? 'अलग-अलग लॉगिन लिंक कॉपी करें' : 'Copy Direct Login Links'}</span>
          </button>
        </div>
      )}

      {/* Dedicated Portal Direct Links Modal */}
      {showLinksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0F223D] border-2 border-[#D4AF37]/50 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {language === 'hi' ? 'अलग-अलग डायरेक्ट लॉगिन लिंक्स' : 'Direct Portal Links'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'एडमिन व सदस्य के लिए अलग-अलग डायरेक्ट लिंक्स' : 'Separate standalone URLs for Admin and Members'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLinksModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Member Login Link Card */}
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <LogIn className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'hi' ? '👤 ग्राहक लॉगिन लिंक (User Login)' : '👤 Member Login Portal'}</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                    ?portal=user
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={userLoginUrl}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(userLoginUrl, 'user')}
                    className="shrink-0 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'user' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Admin Login Link Card */}
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-amber-500/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Shield className="w-4 h-4 text-[#D4AF37]" />
                    <span>{language === 'hi' ? '🛡️ एडमिन लॉगिन लिंक (Admin Login)' : '🛡️ Super Admin Portal'}</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                    ?portal=admin
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={adminLoginUrl}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(adminLoginUrl, 'admin')}
                    className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 text-xs font-black rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink === 'admin' ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'admin' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* User Registration Link */}
              <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold">{language === 'hi' ? '📝 नया रजिस्ट्रेशन लिंक:' : '📝 User Registration Link:'}</span>
                  <span className="font-mono text-[10px] text-slate-500">?portal=register</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={registerUrl}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(registerUrl, 'register')}
                    className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink === 'register' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink === 'register' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLinksModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close / बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
