import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MemberDashboard } from './components/MemberDashboard';
import { PlansSection } from './components/PlansSection';
import { WalletSection } from './components/WalletSection';
import { TeamNetworkSection } from './components/TeamNetworkSection';
import { AdminDashboard } from './components/AdminDashboard';
import { UserAuthModal } from './components/UserAuthModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { PaymentModal } from './components/PaymentModal';
import { WithdrawModal } from './components/WithdrawModal';
import { CompanyDeclarationModal } from './components/CompanyDeclarationModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { HelpChatModal } from './components/HelpChatModal';
import { WelcomeSplashModal } from './components/WelcomeSplashModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { Shield, Crown, FileText, UserCheck, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    currentUser, 
    activeModal,
    setActiveModal, 
    t, 
    language,
    settings, 
    logout,
    currentTab,
    setCurrentTab,
    selectedTeamMember,
    setSelectedTeamMember,
    supportMessages
  } = useApp();
  const [detectedRefCode, setDetectedRefCode] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showExitToast, setShowExitToast] = useState(false);

  // Refs for native back button behavior without stale closures
  const activeModalRef = React.useRef(activeModal);
  const currentTabRef = React.useRef(currentTab);
  const selectedTeamMemberRef = React.useRef(selectedTeamMember);
  const lastBackPressTimeRef = React.useRef<number>(0);
  const exitToastTimerRef = React.useRef<any>(null);

  React.useEffect(() => {
    activeModalRef.current = activeModal;
  }, [activeModal]);

  React.useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  React.useEffect(() => {
    selectedTeamMemberRef.current = selectedTeamMember;
  }, [selectedTeamMember]);

  // Native App-Like Back Button Handling (Mobile Back / Browser Back)
  React.useEffect(() => {
    // Push an initial history entry to catch the back button
    window.history.pushState({ app: 'logitech' }, '');

    const handlePopState = (e: PopStateEvent) => {
      // 1. If any modal is open, close the modal first
      if (activeModalRef.current !== null) {
        setActiveModal(null);
        window.history.pushState({ app: 'logitech' }, '');
        return;
      }

      // 2. If team member detail modal is open, close it
      if (selectedTeamMemberRef.current !== null) {
        setSelectedTeamMember(null);
        window.history.pushState({ app: 'logitech' }, '');
        return;
      }

      // 3. If user is on any other tab (plans, wallet, network, declaration, admin), go back to home page (dashboard)
      if (currentTabRef.current !== 'dashboard') {
        setCurrentTab('dashboard');
        window.history.pushState({ app: 'logitech' }, '');
        return;
      }

      // 4. If already on home dashboard with no open modals:
      // Require double back-press within 2 seconds to exit app
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2000) {
        // Double back pressed within 2s -> Allow app exit
        setShowExitToast(false);
        // Do not push state; allow browser to go back
      } else {
        lastBackPressTimeRef.current = now;
        setShowExitToast(true);
        if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
        exitToastTimerRef.current = setTimeout(() => {
          setShowExitToast(false);
        }, 2000);
        // Push state again so this first back-press stays inside the app
        window.history.pushState({ app: 'logitech' }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
    };
  }, [setActiveModal, setSelectedTeamMember, setCurrentTab]);

  const unreadChatBadgeCount = currentUser?.role === 'admin'
    ? supportMessages.filter(m => m.sender === 'user' && !m.readByAdmin).length
    : supportMessages.filter(m => (m.userId === (currentUser?.id || 'GUEST') || m.userId === 'U-ALL') && m.sender === 'admin' && !m.readByUser).length;

  // Auto-detect referral code and dedicated portal links (?portal=admin / ?portal=user)
  React.useEffect(() => {
    try {
      const search = window.location.search;
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      let ref = '';

      if (search) {
        const params = new URLSearchParams(search);
        ref = params.get('ref') || params.get('r') || '';
        
        // Handle dedicated portal query parameter (strictly isolated)
        const portal = (params.get('portal') || params.get('login') || '').toLowerCase();
        if (portal === 'admin') {
          if (currentUser && currentUser.role !== 'admin') {
            logout();
          }
          if (!currentUser || currentUser.role !== 'admin') {
            setActiveModal('admin-login');
          }
        } else if (portal === 'user' || portal === 'member') {
          if (currentUser?.role === 'admin') {
            logout();
          }
          if (!currentUser || currentUser.role === 'admin') {
            setActiveModal('user-login');
          }
        } else if (portal === 'register') {
          if (currentUser?.role === 'admin') {
            logout();
          }
          if (!currentUser || currentUser.role === 'admin') {
            setActiveModal('user-register');
          }
        }
      }

      if (hash) {
        const lowerHash = hash.toLowerCase();
        if (lowerHash === '#admin') {
          if (currentUser && currentUser.role !== 'admin') logout();
          if (!currentUser || currentUser.role !== 'admin') setActiveModal('admin-login');
        } else if (lowerHash === '#user' || lowerHash === '#login') {
          if (currentUser?.role === 'admin') logout();
          if (!currentUser || currentUser.role === 'admin') setActiveModal('user-login');
        } else if (lowerHash === '#register') {
          if (currentUser?.role === 'admin') logout();
          if (!currentUser || currentUser.role === 'admin') setActiveModal('user-register');
        }
      }

      if (!ref && hash.includes('ref=')) {
        const hashQuery = hash.substring(hash.indexOf('?'));
        const hashParams = new URLSearchParams(hashQuery.length > 1 ? hashQuery : hash.substring(hash.indexOf('ref=')));
        ref = hashParams.get('ref') || '';
      }
      if (!ref && (pathname.startsWith('/ref/') || pathname.startsWith('/ref='))) {
        ref = pathname.replace(/^\/ref[=/]/, '');
      }

      if (ref) {
        const cleanRef = decodeURIComponent(ref).trim().toUpperCase();
        setDetectedRefCode(cleanRef);
        localStorage.setItem('logitech_ref_code', cleanRef);

        if (!currentUser) {
          setActiveModal('user-register');
        }
      }
    } catch {
      // ignore
    }
  }, [currentUser, setActiveModal]);

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col font-sans">
      {/* Welcome Splash Overlay with Logitech Crown Logo and Personal Name */}
      <WelcomeSplashModal detectedRefCode={detectedRefCode} />
      {/* Referral Link Detection Banner */}
      {detectedRefCode && !bannerDismissed && (
        <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border-b border-amber-500/40 px-4 py-2 text-xs flex items-center justify-between gap-3 shadow-lg z-40 backdrop-blur-md">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-[#F3E5AB]">
              🔗 Active Referral Sponsor:
            </span>
            <span className="font-mono font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-500/40">
              {detectedRefCode}
            </span>
            <span className="text-slate-300 hidden sm:inline">
              (10% Direct Commission will be linked to this sponsor)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <button
                onClick={() => {
                  logout();
                  setActiveModal('user-register');
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-lg text-[11px] shadow transition cursor-pointer"
              >
                Register New User
              </button>
            ) : (
              <button
                onClick={() => setActiveModal('user-register')}
                className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-3 py-1 rounded-lg text-[11px] shadow transition cursor-pointer"
              >
                Open Register Form
              </button>
            )}
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <MemberDashboard setCurrentTab={setCurrentTab} />
          )
        )}

        {currentTab === 'plans' && <PlansSection />}

        {currentTab === 'wallet' && <WalletSection />}

        {currentTab === 'network' && <TeamNetworkSection />}

        {currentTab === 'declaration' && (
          <div className="py-10 max-w-4xl mx-auto px-4">
            <div className="bg-[#0F223D] p-8 rounded-3xl border border-[#1E3A5F] shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-extrabold text-white font-display">
                    Official Company Declaration & Legal Terms
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {settings.companyName} • CIN: U72900DL2024PTC419820
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal('declaration')}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5B834] text-slate-950 font-bold text-xs rounded-xl transition"
                >
                  View Official Certificate
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Corporate Transparency:</strong> LOGITECH Enterprise Rewards operates a decentralized digital reward network. Every member activating an investment tier is eligible for nightly 12:00 AM distribution credited directly to their system wallet.
                </p>
                <p>
                  <strong>2. Payment Integrity & UPI Security:</strong> Every transaction reference number (UTR) is verified for authenticity. Duplicate submissions are strictly prohibited by our database integrity layer.
                </p>
                <p>
                  <strong>3. Withdrawal Protections:</strong> Withdrawal requests are processed to customer UPI IDs without double deductions. In case of network rejection, balance is restored 100% to available funds.
                </p>
              </div>

              {/* Financial Risk Notice (Short & English Only - Last Page Certificate) */}
              <div className="pt-4 border-t border-slate-800">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
                      ⚠️ Financial Risk Disclaimer
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.2 rounded font-semibold border border-amber-500/40">
                      Self Risk Advisory
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Participation and financial commitments are strictly at your own self-risk. Users must perform independent due diligence before depositing or allocating funds. LOGITECH Enterprise is solely a digital community referral and reward platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-[#050B16] border-t border-[#1E3A5F] py-8 px-4 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-extrabold text-white text-sm">
              LOGI<span className="text-[#D4AF37]">TECH</span>
            </span>
            <span className="text-[10px] text-slate-500">© 2026 LOGITECH REFERRAL & REWARDS. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400">
            <a
              href="/logitech_enterprise_rewards.zip"
              download="logitech_enterprise_rewards.zip"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-500/40 transition shadow cursor-pointer"
              title="Download Complete Source Code Project ZIP Archive"
            >
              <span>⬇️ Download Project (.ZIP)</span>
            </a>
            <span>•</span>
            <button
              onClick={() => setActiveModal('user-login')}
              className="text-cyan-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Member Login
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModal('admin-login')}
              className="text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              Super Admin Portal
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModal('declaration')}
              className="hover:text-white transition cursor-pointer"
            >
              Company Certificate
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('plans')}
              className="hover:text-white transition cursor-pointer"
            >
              Plans
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals - Dedicated Member Login & Super Admin Portal */}
      <UserAuthModal />
      <AdminAuthModal />
      <PaymentModal />
      <WithdrawModal />
      <CompanyDeclarationModal />
      <MemberDetailModal 
        member={selectedTeamMember} 
        onClose={() => setSelectedTeamMember(null)} 
      />
      <HelpChatModal />
      <AiAssistantModal />

      {/* Floating 24/7 Customer Help & Support Chat Trigger */}
      <button
        onClick={() => {
          if (currentUser?.role === 'admin') {
            setCurrentTab('admin');
          } else {
            setActiveModal('help-chat');
          }
        }}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center gap-2.5 font-black text-xs sm:text-sm border-2 border-emerald-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        title="24/7 Live Customer Help & Support Chat (एडमिन सहायता चैट)"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5 fill-slate-950 text-slate-950" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
        </div>
        <span className="hidden sm:inline font-extrabold tracking-wide">
          {currentUser?.role === 'admin' ? 'Admin Chat Desk (Page 3)' : 'Live Help & Support'}
        </span>
        {unreadChatBadgeCount > 0 && (
          <span className="bg-rose-600 text-white text-[11px] px-1.5 py-0.2 rounded-full font-black animate-bounce shadow">
            {unreadChatBadgeCount}
          </span>
        )}
      </button>

      {/* Native App-Like Exit Prompt Toast (डबल बैक प्रेस एग्जिट टोस्ट) */}
      {showExitToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F223D]/95 text-white border-2 border-amber-500/80 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
            <ArrowLeft className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-extrabold text-[#F3E5AB]">
              {language === 'hi' ? 'ऐप से बाहर निकलने के लिए दोबारा बैक दबाएं' : 'Press back again to exit'}
            </p>
            <p className="text-[10px] text-slate-400">
              {language === 'hi' ? 'पहले बैक पर होम पेज खुला है' : 'First back navigates to Home'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
