import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { User, PlanId, PaymentTransaction, WithdrawalRequest, SupportMessage } from '../types';
import { 
  Shield, Users, Wallet, CreditCard, ArrowDownLeft, 
  Settings, History, Search, Filter, Download, Play, 
  CheckCircle2, XCircle, AlertCircle, Edit, Key, 
  Sparkles, Check, X, RefreshCw, Eye, Smartphone, 
  TrendingUp, BarChart3, Database, Zap, Trash2, Lock,
  UserCheck, UserX, AlertTriangle, ArrowRight, MessageSquare,
  Send, CheckCheck, Reply, Headphones, MessageCircle,
  Copy, ExternalLink, Link2, EyeOff
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    plans,
    payments,
    withdrawals,
    ledger,
    settings,
    auditLogs,
    companyAvailableFund,
    totalTdsCollected,
    verifyPayment,
    processWithdrawal,
    manualAdjustWallet,
    updateUserStatus,
    updateUserPlan,
    editMemberDetails,
    deleteMember,
    updatePlanDailyIncome,
    updateSettings,
    runDailyDistribution,
    claimUserDailyIncome,
    exportToCsv,
    resetAllData,
    resetAllDataToZero,
    cleanSlateDatabaseReset,
    supportMessages,
    sendSupportMessage,
    markChatAsRead,
    t,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'plansManager' | 'workingData' | 'payments' | 'withdrawals' | 'supportChat' | 'settings' | 'logs'>('overview');
  
  // Support Chat Center state
  const [selectedChatUserId, setSelectedChatUserId] = useState<string>('U1001');
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [adminReplyCategory, setAdminReplyCategory] = useState<'GENERAL' | 'RECHARGE' | 'WITHDRAWAL' | 'PLAN'>('GENERAL');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'recharge' | 'withdrawal'>('all');
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Working Data search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReferralCode, setFilterReferralCode] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  // Password visibility & clipboard state
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyPasswordToClipboard = (password: string, targetKey: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(password);
      setCopiedPasswordId(targetKey);
      setTimeout(() => setCopiedPasswordId(null), 2500);
    }
  };

  // Full Member Edit Modal States
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    mobile: string;
    password: string;
    planId: PlanId;
    status: 'active' | 'blocked';
    walletBalance: number;
  }>({
    name: '',
    mobile: '',
    password: '',
    planId: 'free',
    status: 'active',
    walletBalance: 0,
  });

  // Delete Member Confirmation State
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

  // Reset to Zero Confirmation State
  const [showZeroResetModal, setShowZeroResetModal] = useState(false);
  const [showCleanSlateModal, setShowCleanSlateModal] = useState(false);
  const [cleanSlateLoading, setCleanSlateLoading] = useState(false);

  // General Action Toast
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const openEditMemberModal = (user: User) => {
    setMemberToEdit(user);
    setShowModalPassword(false);
    setEditForm({
      name: user.name,
      mobile: user.mobile,
      password: '',
      planId: user.planId,
      status: user.status,
      walletBalance: user.walletBalance,
    });
  };

  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToEdit) return;
    const res = editMemberDetails(memberToEdit.id, {
      name: editForm.name,
      mobile: editForm.mobile,
      password: editForm.password.trim() ? editForm.password.trim() : undefined,
      planId: editForm.planId,
      status: editForm.status,
      walletBalance: Number(editForm.walletBalance),
    });
    if (res.success) {
      setActionToast({ type: 'success', message: `${res.message}: ${editForm.name}` });
      setMemberToEdit(null);
      setTimeout(() => setActionToast(null), 3500);
    } else {
      setActionToast({ type: 'error', message: res.message });
      setTimeout(() => setActionToast(null), 3500);
    }
  };

  const handleConfirmDeleteMember = () => {
    if (!memberToDelete) return;
    const target = memberToDelete;
    // Immediately close modal to eliminate UI lag
    setMemberToDelete(null);
    const res = deleteMember(target.id);
    if (res.success) {
      setActionToast({ type: 'success', message: res.message });
      setTimeout(() => setActionToast(null), 3500);
    } else {
      setActionToast({ type: 'error', message: res.message });
      setTimeout(() => setActionToast(null), 3500);
    }
  };

  const handleConfirmZeroReset = () => {
    resetAllDataToZero();
    setShowZeroResetModal(false);
    setActionToast({
      type: 'success',
      message: 'All customer balances and transactions successfully reset to ₹0. Live synced across all tabs.'
    });
    setTimeout(() => setActionToast(null), 5000);
  };

  const handleConfirmCleanSlate = async () => {
    setCleanSlateLoading(true);
    const res = await cleanSlateDatabaseReset();
    setCleanSlateLoading(false);
    setShowCleanSlateModal(false);
    setActionToast({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
    setTimeout(() => setActionToast(null), 7000);
  };

  // Real-Time Registration Alert Listener
  React.useEffect(() => {
    const handleNewRegistration = (e: Event) => {
      const customEvent = e as CustomEvent<{ user: User }>;
      const newUser = customEvent.detail?.user;
      if (newUser) {
        setActionToast({
          type: 'success',
          message: `🟢 LIVE NEW REGISTRATION: ${newUser.name} (${newUser.id}) registered via Sponsor: ${newUser.referredBy || 'Direct'}!`
        });
        setTimeout(() => setActionToast(null), 8000);
      }
    };

    window.addEventListener('logitech_new_member_registered', handleNewRegistration);
    return () => {
      window.removeEventListener('logitech_new_member_registered', handleNewRegistration);
    };
  }, []);

  // Dynamic Plan & Daily Income Editor State
  const [editablePlans, setEditablePlans] = useState(plans);
  const [planSaveNotification, setPlanSaveNotification] = useState<string | null>(null);

  // Sync editable plans if global plans change
  React.useEffect(() => {
    setEditablePlans(plans);
  }, [plans]);

  // Manual wallet adjust modal states
  const [adjustAmount, setAdjustAmount] = useState<number | ''>('');
  const [adjustIsCredit, setAdjustIsCredit] = useState(true);
  const [adjustReason, setAdjustReason] = useState('');

  // Settings form states
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Topup simulation feedback
  const [topupResult, setTopupResult] = useState<{ users: number; amount: number } | null>(null);

  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<{ type: 'payment' | 'withdrawal'; id: string } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Payment preview screenshot modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // KPIs with useMemo for instantaneous lag-free loading
  const totalUsersCount = useMemo(() => users.filter(u => u.role !== 'admin').length, [users]);
  const activeUsersCount = useMemo(() => users.filter(u => u.role !== 'admin' && u.planId !== 'free').length, [users]);
  const freeUsersCount = useMemo(() => users.filter(u => u.role !== 'admin' && u.planId === 'free').length, [users]);
  const totalWalletSum = useMemo(() => users.reduce((acc, u) => acc + u.walletBalance, 0), [users]);
  const approvedPayments = useMemo(() => payments.filter(p => p.status === 'approved'), [payments]);
  const totalSalesSum = useMemo(() => approvedPayments.reduce((acc, p) => acc + p.amount, 0), [approvedPayments]);
  const pendingPaymentsCount = useMemo(() => payments.filter(p => p.status === 'pending').length, [payments]);
  const pendingWithdrawalsCount = useMemo(() => withdrawals.filter(w => w.status === 'pending').length, [withdrawals]);
  const unreadChatCount = useMemo(() => supportMessages.filter(m => m.sender === 'user' && !m.readByAdmin).length, [supportMessages]);
  const totalChatCount = useMemo(() => supportMessages.length, [supportMessages]);

  // Distinct Free vs Active Paid Plans Revenue & Member Breakdown
  const planDetailedBreakdown = useMemo(() => {
    return plans.map(p => {
      const planUsers = users.filter(u => u.role !== 'admin' && u.planId === p.id);
      const count = planUsers.length;
      const totalAmount = count * p.price;
      return {
        ...p,
        userCount: count,
        totalAmount,
      };
    });
  }, [plans, users]);

  const activePaidPlans = useMemo(() => planDetailedBreakdown.filter(p => p.id !== 'free'), [planDetailedBreakdown]);
  const freePlanData = useMemo(() => planDetailedBreakdown.find(p => p.id === 'free') || { id: 'free', name: 'Free Tier', price: 0, userCount: freeUsersCount, totalAmount: 0 }, [planDetailedBreakdown, freeUsersCount]);
  const totalActivePaidPlanAmount = useMemo(() => activePaidPlans.reduce((sum, p) => sum + p.totalAmount, 0), [activePaidPlans]);

  const handleRunTopup = () => {
    const res = runDailyDistribution();
    setTopupResult({ users: res.usersCredited, amount: res.totalDistributed });
    setTimeout(() => setTopupResult(null), 5000);
  };

  const handleDailyIncomeDelta = (planId: PlanId, delta: number) => {
    setEditablePlans(prev => prev.map(p => {
      if (p.id === planId) {
        const newDaily = Math.max(1, p.dailyEarning + delta);
        return {
          ...p,
          dailyEarning: newDaily,
          totalReturn: Math.round(newDaily * p.durationDays)
        };
      }
      return p;
    }));
  };

  const handlePlanFieldChange = (planId: PlanId, field: 'dailyEarning' | 'durationDays' | 'price', value: number) => {
    setEditablePlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updated = { ...p, [field]: Math.max(1, value) };
        updated.totalReturn = Math.round(updated.dailyEarning * updated.durationDays);
        return updated;
      }
      return p;
    }));
  };

  const handleSavePlan = (planId: PlanId) => {
    const target = editablePlans.find(p => p.id === planId);
    if (!target) return;
    updatePlanDailyIncome(target.id, target.dailyEarning, target.durationDays, target.price);
    setPlanSaveNotification(`Plan ${target.name} updated: Daily Income ₹${target.dailyEarning}/day, Price ₹${target.price}, Duration ${target.durationDays} Days`);
    setTimeout(() => setPlanSaveNotification(null), 4000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleWalletAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit || !adjustAmount || Number(adjustAmount) <= 0) return;

    manualAdjustWallet(
      selectedUserForEdit.id,
      Number(adjustAmount),
      adjustIsCredit,
      adjustReason || (adjustIsCredit ? 'Admin manual bonus' : 'Admin manual adjustment')
    );

    setAdjustAmount('');
    setAdjustReason('');
    // refresh selected user
    const updated = users.find(u => u.id === selectedUserForEdit.id);
    if (updated) setSelectedUserForEdit(updated);
  };

  const confirmRejection = () => {
    if (!rejectingItem) return;
    if (rejectingItem.type === 'payment') {
      verifyPayment(rejectingItem.id, false, rejectionReasonInput || 'UTR Verification Failed');
    } else {
      processWithdrawal(rejectingItem.id, false, undefined, rejectionReasonInput || 'Invalid UPI / Bank Transfer Failed');
    }
    setRejectingItem(null);
    setRejectionReasonInput('');
  };

  // Support Chat Center aggregation
  const chatUsersList = React.useMemo(() => {
    const messageUserMap = new Map<string, { lastMsg: SupportMessage; unreadCount: number }>();
    supportMessages.forEach(msg => {
      const uId = msg.userId;
      const current = messageUserMap.get(uId);
      const isUnread = msg.sender === 'user' && !msg.readByAdmin;
      if (!current) {
        messageUserMap.set(uId, { lastMsg: msg, unreadCount: isUnread ? 1 : 0 });
      } else {
        const newer = new Date(msg.timestamp).getTime() > new Date(current.lastMsg.timestamp).getTime() ? msg : current.lastMsg;
        messageUserMap.set(uId, {
          lastMsg: newer,
          unreadCount: current.unreadCount + (isUnread ? 1 : 0),
        });
      }
    });

    const list: Array<{
      id: string;
      name: string;
      mobile: string;
      planId: string;
      walletBalance: number;
      lastMsg?: SupportMessage;
      unreadCount: number;
    }> = [];

    // Broadcast channel
    const broadcastInfo = messageUserMap.get('U-ALL');
    list.push({
      id: 'U-ALL',
      name: '📢 All Members (Broadcast Notice)',
      mobile: 'Global Broadcast Channel',
      planId: 'all',
      walletBalance: 0,
      lastMsg: broadcastInfo?.lastMsg,
      unreadCount: broadcastInfo?.unreadCount || 0,
    });

    // Users with existing message conversations
    messageUserMap.forEach((info, uId) => {
      if (uId === 'U-ALL') return;
      const registered = users.find(u => u.id === uId);
      list.push({
        id: uId,
        name: registered?.name || info.lastMsg.userName || 'Guest User',
        mobile: registered?.mobile || info.lastMsg.userMobile || 'N/A',
        planId: registered?.planId || 'free',
        walletBalance: registered?.walletBalance || 0,
        lastMsg: info.lastMsg,
        unreadCount: info.unreadCount,
      });
    });

    // Remaining registered users
    users.filter(u => u.role !== 'admin' && !messageUserMap.has(u.id)).forEach(u => {
      list.push({
        id: u.id,
        name: u.name,
        mobile: u.mobile,
        planId: u.planId,
        walletBalance: u.walletBalance,
        lastMsg: undefined,
        unreadCount: 0,
      });
    });

    // Filter by search
    let filtered = list.filter(item => {
      if (!chatSearchQuery.trim()) return true;
      const q = chatSearchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.mobile.includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });

    // Filter by category or unread
    if (chatFilter === 'unread') {
      filtered = filtered.filter(item => item.unreadCount > 0);
    } else if (chatFilter === 'recharge') {
      filtered = filtered.filter(item => item.lastMsg?.category === 'RECHARGE');
    } else if (chatFilter === 'withdrawal') {
      filtered = filtered.filter(item => item.lastMsg?.category === 'WITHDRAWAL');
    }

    return filtered;
  }, [supportMessages, users, chatSearchQuery, chatFilter]);

  const handleAdminSendReply = (textToSend?: string, categoryToSend?: 'GENERAL' | 'RECHARGE' | 'WITHDRAWAL' | 'PLAN') => {
    const text = textToSend || adminReplyInput;
    const cat = categoryToSend || adminReplyCategory;
    if (!text || !text.trim()) return;

    const res = sendSupportMessage(text.trim(), cat, selectedChatUserId);
    if (res.success) {
      setAdminReplyInput('');
      setActionToast({ type: 'success', message: `Reply sent to ${selectedChatUserId}: "${text.slice(0, 32)}..."` });
      setTimeout(() => setActionToast(null), 3000);
      if (selectedChatUserId) {
        markChatAsRead(selectedChatUserId, 'admin');
      }
    }
  };

  const quickAdminPresets = [
    { label: '⚡ Approve UTR', text: 'Aapka recharge UTR verify ho gaya hai. Plan safaltapoorvak activate kar diya gaya hai. Daily return ab shuru ho gaya hai.', cat: 'RECHARGE' as const },
    { label: '💸 Approve Payout', text: 'Aapka withdrawal request approve ho gaya hai. Payout 15-30 minutes me aapke bank/UPI account me credit ho jayega.', cat: 'WITHDRAWAL' as const },
    { label: '⚠️ Invalid UTR', text: 'Kripya apna sahi 12-digit UPI UTR number aur payment ka screenshot dobara upload karein verification ke liye.', cat: 'RECHARGE' as const },
    { label: '📈 Daily Return Info', text: 'Daily return har 24 ghante me aapke wallet balance me direct credit hota hai jise aap kabhi bhi withdraw kar sakte hain.', cat: 'PLAN' as const },
    { label: '🤝 Referral Bonus', text: 'Aapki direct team referral commission aapke wallet me instantly add kar di gayi hai. Team badhane ke liye apna referral link share karein.', cat: 'GENERAL' as const },
    { label: '👋 General Help', text: 'Namaskar! Logitech Fintech Support me aapka swagat hai. Kripya apna sawal ya pareshani yahan likhein, hum turant sahayata karenge.', cat: 'GENERAL' as const },
  ];

  // Filtered working data users with referral code & status search
  const activeUserCount = useMemo(() => users.filter(u => u.role !== 'admin' && u.status === 'active').length, [users]);
  const blockedUserCount = useMemo(() => users.filter(u => u.role !== 'admin' && u.status === 'blocked').length, [users]);
  const paidPlanCount = useMemo(() => users.filter(u => u.role !== 'admin' && u.planId !== 'free').length, [users]);
  const freePlanCount = useMemo(() => users.filter(u => u.role !== 'admin' && u.planId === 'free').length, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (u.role === 'admin') return false;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        u.id.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.mobile.includes(q) ||
        u.referralCode.toLowerCase().includes(q) ||
        (u.referredBy && u.referredBy.toLowerCase().includes(q))
      );

      const refQ = filterReferralCode.toLowerCase().trim();
      const matchesReferral = !refQ || (
        u.referralCode.toLowerCase().includes(refQ) ||
        (u.referredBy && u.referredBy.toLowerCase().includes(refQ))
      );

      const matchesPlan = 
        filterPlan === 'ALL' 
          ? true 
          : filterPlan === 'PAID' 
            ? u.planId !== 'free' 
            : filterPlan === 'FREE'
              ? u.planId === 'free'
              : u.planId === filterPlan;

      const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;

      return matchesSearch && matchesReferral && matchesPlan && matchesStatus;
    });
  }, [users, searchQuery, filterReferralCode, filterPlan, filterStatus]);

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header & Simulation Trigger */}
      <div className="bg-[#0F223D] border border-[#1E3A5F] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                {t.adminDashboardTitle}
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as Super Admin: <span className="font-mono text-[#D4AF37] font-bold">logitech01</span> • Full Master Privilege
              </p>
            </div>
          </div>
        </div>

        {/* Admin Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCleanSlateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
            title="Safe Database Wipe & Auto-Increment Reset for Live Launch"
          >
            <Database className="w-3.5 h-3.5 text-rose-400" />
            <span>Database Reset (Clean Slate Live)</span>
          </button>

          <button
            onClick={handleRunTopup}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{t.runDailyTopup}</span>
          </button>
        </div>
      </div>

      {/* Separate Direct Portal Login Links (User Login Link & Admin Login Link) */}
      <div className="bg-gradient-to-r from-[#0F223D] via-[#122847] to-[#0A192F] border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'अलग-अलग पोर्टल डायरेक्ट लॉगिन लिंक' : 'Separate Direct Portal Login Links'}</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                  Separate URLs
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {language === 'hi' ? 'मोबाइल पर अलग-अलग खोलने के लिए यूजर व एडमिन लिंक यहाँ से कॉपी करें:' : 'Direct links for User Portal and Admin Portal to open separately on mobile devices:'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
          {/* User Portal Link */}
          <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-xs font-bold text-cyan-300">{language === 'hi' ? '1. ग्राहक लॉगिन लिंक (User Login Link)' : '1. Customer Login Direct Link'}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                {typeof window !== 'undefined' ? `${window.location.origin}/?portal=user` : 'https://.../?portal=user'}
              </p>
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/?portal=user`;
                navigator.clipboard.writeText(url);
                setActionToast({ type: 'success', message: 'User Login Direct Link copied! Users will directly see the Member Login screen.' });
                setTimeout(() => setActionToast(null), 3500);
              }}
              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>
          </div>

          {/* Admin Portal Link */}
          <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-xs font-bold text-amber-300">{language === 'hi' ? '2. सुपर एडमिन लॉगिन लिंक (Admin Login Link)' : '2. Super Admin Login Direct Link'}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                {typeof window !== 'undefined' ? `${window.location.origin}/?portal=admin` : 'https://.../?portal=admin'}
              </p>
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/?portal=admin`;
                navigator.clipboard.writeText(url);
                setActionToast({ type: 'success', message: 'Admin Direct Link copied! Open on mobile to access Super Admin Master Desk.' });
                setTimeout(() => setActionToast(null), 3500);
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Toast Notification */}
      {actionToast && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border animate-in fade-in ${
          actionToast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {actionToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{actionToast.message}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top-up Notification Banner */}
      {topupResult && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              <strong>Success:</strong> Daily return distribution completed. Credited ₹{topupResult.amount.toLocaleString('en-IN')} across {topupResult.users} active members!
            </span>
          </div>
          <button onClick={() => setTopupResult(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Real-time Company Available Fund Pool */}
        <div className="bg-gradient-to-br from-[#0D2447] to-[#0A192F] p-4 rounded-xl border-2 border-[#D4AF37]/50 shadow-lg col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-wider">
              {language === 'en' ? 'Company Available Fund' : 'कंपनी उपलब्ध फंड'}
            </span>
            <Wallet className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37] mt-1 font-mono">
            ₹{companyAvailableFund.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-300 mt-1 flex items-center justify-between">
            <span>+ Plans Active: ₹{totalSalesSum.toLocaleString('en-IN')}</span>
            <span className="text-rose-300 font-semibold">- Paid Out</span>
          </div>
        </div>

        {/* 1. DISTINCT ACTIVE PAID PLAN AMOUNT & USERS CARD */}
        <div 
          onClick={() => {
            setFilterPlan('PAID');
            setActiveTab('workingData');
          }}
          className="bg-gradient-to-br from-[#062417] to-[#0D1E38] p-4 rounded-xl border-2 border-emerald-500/60 shadow-lg cursor-pointer transition group hover:brightness-110"
          title="Click to view all active paid members"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-300 font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {language === 'hi' ? 'सक्रिय पेड प्लान राशि' : 'Active Paid Plan Amount'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
            ₹{totalActivePaidPlanAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-200 mt-1 flex items-center justify-between">
            <span>{activeUsersCount} Paid Accounts</span>
            <span className="text-emerald-400 font-bold">Daily ROI Active →</span>
          </div>
        </div>

        {/* 2. DISTINCT FREE PLAN AMOUNT & USERS CARD */}
        <div 
          onClick={() => {
            setFilterPlan('free');
            setActiveTab('workingData');
          }}
          className="bg-[#0D1E38] hover:bg-[#122847] p-4 rounded-xl border-2 border-slate-600/60 shadow-md cursor-pointer transition group"
          title="Click to view all free members"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              {language === 'hi' ? 'फ्री प्लान राशि (₹0)' : 'Free Plan Amount (₹0)'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">
            ₹0
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{freeUsersCount} Free Accounts</span>
            <span className="text-cyan-300 font-semibold">View Free Members →</span>
          </div>
        </div>

        {/* 5% TDS Collected Pool */}
        <div className="bg-[#0D1E38] p-4 rounded-xl border border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-bold uppercase">
              {language === 'en' ? '5% TDS Collected' : 'कुल 5% टीडीएस कटौती'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">5%</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 mt-1 font-mono">
            ₹{totalTdsCollected.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Govt. Tax Retained</span>
        </div>

        {/* Total Plan Inflows */}
        <div className="bg-[#0D1E38] p-4 rounded-xl border border-[#1E3A5F]">
          <span className="text-[10px] text-slate-400 font-bold uppercase">{t.totalSales}</span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-1 font-mono">
            ₹{totalSalesSum.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-amber-400">Total Approved Plans</span>
        </div>

        {/* User Balances / Escrow Liability */}
        <div className="bg-[#0D1E38] p-4 rounded-xl border border-[#1E3A5F]">
          <span className="text-[10px] text-slate-400 font-bold uppercase">{t.systemWalletBalance}</span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-200 mt-1 font-mono">
            ₹{totalWalletSum.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Members Wallet Sum</span>
        </div>

        {/* Active Members */}
        <div 
          onClick={() => {
            setFilterPlan('PAID');
            setActiveTab('workingData');
          }}
          className="bg-[#0D1E38] hover:bg-[#062417] hover:border-emerald-500/60 p-4 rounded-xl border border-[#1E3A5F] cursor-pointer transition group shadow-md"
          title="Click to view all active paid members"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-bold uppercase">{t.activeUsers}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {activeUsersCount} <span className="text-xs text-slate-400 font-normal">/ {totalUsersCount}</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 mt-0.5">
            <span>Click to view active members →</span>
          </span>
        </div>

        {/* Pending Plan Approvals */}
        <div 
          onClick={() => setActiveTab('payments')}
          className="bg-[#0D1E38] hover:bg-amber-950/40 hover:border-amber-500/60 p-4 rounded-xl border border-amber-500/30 cursor-pointer transition group shadow-md"
          title="Click to review pending recharges"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-300 font-bold uppercase">{t.pendingPaymentsCount}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1 font-mono">{pendingPaymentsCount}</div>
          <span className="text-[10px] text-amber-300 font-semibold">Awaiting UTR Approval →</span>
        </div>

        {/* Pending Withdrawals */}
        <div 
          onClick={() => setActiveTab('withdrawals')}
          className="bg-[#0D1E38] hover:bg-rose-950/40 hover:border-rose-500/60 p-4 rounded-xl border border-rose-500/30 cursor-pointer transition group shadow-md"
          title="Click to process pending withdrawals"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-300 font-bold uppercase">{t.pendingWithdrawalsCount}</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1 font-mono">{pendingWithdrawalsCount}</div>
          <span className="text-[10px] text-rose-300 font-semibold">Pending UPI Payouts →</span>
        </div>

        {/* Total Accounts */}
        <div 
          onClick={() => {
            setFilterPlan('ALL');
            setActiveTab('workingData');
          }}
          className="bg-[#0D1E38] hover:bg-[#0c1c36] hover:border-cyan-500/60 p-4 rounded-xl border border-[#1E3A5F] cursor-pointer transition group shadow-md"
          title="Click to view all working member records"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-300 font-bold uppercase">{t.totalUsers}</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono">{totalUsersCount}</div>
          <span className="text-[10px] text-cyan-300 font-semibold">Click to view all members →</span>
        </div>

        {/* Support Chat KPI */}
        <div 
          onClick={() => {
            setActiveTab('supportChat');
            if (selectedChatUserId) markChatAsRead(selectedChatUserId, 'admin');
          }}
          className="bg-[#0D1E38] hover:bg-emerald-950/40 hover:border-emerald-500/60 p-4 rounded-xl border border-emerald-500/40 cursor-pointer transition group shadow-md"
          title="Click to open Customer Support Chat Center (Page 3)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-300 font-bold uppercase">
              {language === 'hi' ? 'ग्राहक सहायता चैट' : 'Support Chat (Page 3)'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 font-mono flex items-center gap-2">
            <span>{totalChatCount}</span>
            {unreadChatCount > 0 && (
              <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-sans font-bold animate-pulse">
                {unreadChatCount} new
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-300 font-semibold">
            {unreadChatCount > 0 ? `${unreadChatCount} unread user queries →` : 'All chats up to date →'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1E3A5F] overflow-x-auto gap-2 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#0F223D]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {t.tabOverview}
        </button>

        <button
          onClick={() => setActiveTab('plansManager')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'plansManager'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#0F223D]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          <span>{language === 'hi' ? 'दैनिक इनकम व प्लान्स (बढ़ाएं/घटाएं)' : 'Daily Income & Plans Manager'}</span>
        </button>

        {/* Tab Page 3: Support Chat Center */}
        <button
          onClick={() => {
            setActiveTab('supportChat');
            if (selectedChatUserId) {
              markChatAsRead(selectedChatUserId, 'admin');
            }
          }}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'supportChat'
              ? 'border-emerald-400 text-emerald-300 bg-[#0F223D]'
              : 'border-transparent text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>{language === 'hi' ? 'पेज 3: सपोर्ट चैट केंद्र' : 'Page 3: Support Chat Center'}</span>
          {unreadChatCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-500 text-white text-[11px] font-black rounded-full animate-bounce shadow">
              {unreadChatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('workingData')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'workingData'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#0F223D]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {t.tabWorkingData} ({totalUsersCount})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'payments'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#0F223D]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.tabPayments}</span>
          {pendingPaymentsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full">
              {pendingPaymentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#0F223D]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.tabWithdrawals}</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-extrabold rounded-full">
              {pendingWithdrawalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#0F223D]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {t.tabSettings}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#0F223D]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {t.tabAuditLogs}
        </button>
      </div>

      {/* Tab 1: Overview Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* URGENT PENDING RECHARGE REQUESTS ALERT & APPROVAL TABLE */}
          {pendingPaymentsCount > 0 && (
            <div className="bg-gradient-to-r from-amber-950/70 via-[#10223D] to-amber-950/70 border-2 border-amber-500/70 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                      <span>{language === 'hi' ? 'नए रिचार्ज व प्लान अनुरोध (सत्यापन पेंडिंग)' : 'Pending Recharge & Plan Buy Requests'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black animate-pulse">
                        {pendingPaymentsCount} PENDING
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      {language === 'hi'
                        ? 'ग्राहकों द्वारा भेजे गए UTR की जांच करके तुरंत "Approve & Activate" पर क्लिक करें। यूजर का प्लान व दैनिक आय तुरंत शुरू हो जाएगी।'
                        : 'Review submitted UTRs and click "Approve & Activate" to instantly start customer daily income.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>{t.tabPayments}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Approval Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Mobile</th>
                      <th className="py-2.5 px-3">Requested Plan</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">UTR Reference</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Receipt</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payments.filter(p => p.status === 'pending').map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white block">{p.userName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.userId}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {p.userMobile}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-extrabold text-amber-300">{p.planName}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-white">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-300 tracking-wider">
                          {p.utr}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-semibold">
                          {p.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3">
                          {p.screenshotUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(p.screenshotUrl!)}
                              className="px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-bold hover:bg-cyan-500/25 cursor-pointer"
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No file</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                verifyPayment(p.id, true);
                                setActionToast({
                                  type: 'success',
                                  message: `Plan ${p.planName} activated for ${p.userName} (${p.userId}). Daily income enabled!`
                                });
                                setTimeout(() => setActionToast(null), 4000);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg transition shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              ✓ Approve & Activate (चालू करें)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingItem({ type: 'payment', id: p.id })}
                              className="px-2.5 py-1 bg-rose-600/70 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DISTINCT FREE PLAN VS ACTIVE PAID PLAN AMOUNT COMPARISON SECTION */}
          <div className="bg-[#0F223D] border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <span>{language === 'hi' ? 'फ्री प्लान बनाम एक्टिव पेड प्लान राशि विवरण' : 'Free Plan vs Active Paid Plan Revenue Breakdown'}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Separate Breakdown
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'hi'
                      ? 'सक्रिय (Paid) प्लान्स और निःशुल्क (Free) आईडी की अलग-अलग कुल राशि और मेंबर संख्या:'
                      : 'Separate distinct tracking of Paid active revenue generators vs Free inactive accounts:'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilterPlan('PAID');
                    setActiveTab('workingData');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                >
                  View Paid ({activeUsersCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterPlan('free');
                    setActiveTab('workingData');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  View Free ({freeUsersCount})
                </button>
              </div>
            </div>

            {/* Side-by-Side Cards: Active Paid vs Free Plan */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column (8 cols): Active Paid Plans Detail */}
              <div className="md:col-span-8 bg-[#070F1E] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider">
                      {language === 'hi' ? '1. सक्रिय पेड प्लान्स (Paid Plans Breakdown)' : '1. Active Paid Membership Tiers'}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Paid Revenue</span>
                    <span className="font-mono font-black text-lg sm:text-xl text-emerald-400">
                      ₹{totalActivePaidPlanAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Plan by Plan Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {activePaidPlans.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setFilterPlan(p.id);
                        setActiveTab('workingData');
                      }}
                      className="p-3 bg-[#0F223D] hover:bg-[#152e52] border border-slate-800 hover:border-emerald-500/50 rounded-xl transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-white group-hover:text-amber-300 transition">
                          {p.name}
                        </span>
                        <span className="font-mono font-bold text-amber-400">₹{p.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Members:</span>
                        <span className="font-bold text-white font-mono">{p.userCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1.5 mt-1 border-t border-slate-800/80">
                        <span className="text-emerald-400 font-semibold">Total Amount:</span>
                        <span className="font-black text-emerald-300 font-mono">₹{p.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#0D2418] rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="text-emerald-200 font-medium">
                    Total Active Plan Accounts Generating Daily ROI:
                  </span>
                  <span className="font-bold font-mono text-emerald-300 text-sm">
                    {activeUsersCount} Members • ₹{totalActivePaidPlanAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Right Column (4 cols): Free Tier Detail */}
              <div className="md:col-span-4 bg-[#070F1E] border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
                        {language === 'hi' ? '2. फ्री प्लान (Free Tier)' : '2. Free Member Tier'}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                      Inactive ID
                    </span>
                  </div>

                  <div className="bg-[#0F223D] p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Package Price:</span>
                      <span className="font-bold font-mono text-white">₹0</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Daily Return:</span>
                      <span className="font-bold font-mono text-slate-400">₹0 / day</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Free Registered Users:</span>
                      <span className="font-bold font-mono text-amber-300">{freeUsersCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="font-bold text-slate-400">Total Free Amount:</span>
                      <span className="font-black font-mono text-white text-base">₹0</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {language === 'hi' 
                      ? 'फ्री मेंबर्स ने अभी तक कोई प्लान नहीं खरीदा है। एडमिन वर्किंग डेटा में जाकर इनकी ID सीधे एक्टिवेट कर सकता है।' 
                      : 'Free members have not purchased an investment plan yet. You can activate their ID directly from Working Data.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFilterPlan('free');
                    setActiveTab('workingData');
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Activate Free Members ({freeUsersCount})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Distribution Visual */}
            <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                  Membership Plan Distribution
                </h3>
                <span className="text-xs text-slate-400">Total: {totalUsersCount} Members</span>
              </div>

              <div className="space-y-3">
                {plans.map((p) => {
                  const count = users.filter(u => u.planId === p.id).length;
                  const percent = totalUsersCount > 0 ? Math.round((count / totalUsersCount) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-300">{p.name} (₹{p.price})</span>
                        <span className="font-mono text-amber-300 font-bold">{count} members ({percent}%)</span>
                      </div>
                      <div className="w-full bg-[#070F1E] h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percent, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick System Status & Backups */}
            <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] p-5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  System & Database Health
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300 mt-4">
                  <div className="flex items-center justify-between p-2.5 bg-[#070F1E] rounded-xl border border-slate-800">
                    <span>Duplicate UTR Shield:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE & ENFORCED
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#070F1E] rounded-xl border border-slate-800">
                    <span>12:00 AM Payout Automation:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SCHEDULED DAILY
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#070F1E] rounded-xl border border-slate-800">
                    <span>Official Payee UPI:</span>
                    <span className="font-mono text-amber-300 font-bold">{settings.upiId}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 mt-4">
                <button
                  onClick={() => exportToCsv('users')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All Users
                </button>
                <button
                  onClick={() => exportToCsv('payments')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Payments
                </button>
                <button
                  onClick={resetAllData}
                  className="ml-auto text-xs text-rose-400 hover:text-rose-300 underline"
                  title="Reset to initial test data"
                >
                  Reset Demo State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Daily Income & Plan Manager */}
      {activeTab === 'plansManager' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  Dynamic Daily Earnings & Plan Package Controller
                </div>
                <h3 className="font-extrabold text-xl text-white font-display">
                  {language === 'hi' ? 'प्लान दैनिक कमाई एवं रिटर्न नियंत्रण' : 'Manage Daily Incomes & Plan ROI'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'hi' 
                    ? 'यहाँ से आप किसी भी प्लान की दैनिक कमाई (₹/दिन) को बढ़ा या घटा सकते हैं। रात 12:00 बजे इसी दर से सभी सदस्यों को वॉलेट में कमाई मिलेगी।' 
                    : 'Increase or decrease the daily payout (₹/day) for each plan. Nightly 12:00 AM distribution pays this updated rate to all members.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunTopup}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 font-bold text-xs rounded-xl shadow hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Test Top-up With New Rates</span>
                </button>
              </div>
            </div>

            {planSaveNotification && (
              <div className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{planSaveNotification}</span>
                </div>
                <button onClick={() => setPlanSaveNotification(null)} className="text-emerald-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Cards for each of the 5 Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {editablePlans.map((plan) => {
              const activeMembersCount = users.filter(u => u.planId === plan.id).length;
              const roiPercent = Math.round((plan.totalReturn / plan.price) * 100);

              return (
                <div 
                  key={plan.id}
                  className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] hover:border-[#D4AF37]/50 p-5 shadow-xl flex flex-col justify-between space-y-4 transition"
                >
                  <div>
                    {/* Top Row: Plan Name & Active Subscribers */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                          {plan.badge || 'Tier'}
                        </span>
                        <h4 className="font-extrabold text-base text-white mt-1">
                          {language === 'hi' ? plan.nameHi : plan.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Subscribers</span>
                        <span className="text-sm font-extrabold text-cyan-300">{activeMembersCount} Users</span>
                      </div>
                    </div>

                    {/* DAILY INCOME ADJUSTMENT SECTION (बढ़ाएं / घटाएं) */}
                    <div className="mt-4 bg-[#070F1E] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'hi' ? 'दैनिक कमाई (₹/दिन):' : 'Daily Income (₹/day):'}</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">12:00 AM Payout</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-amber-300">₹</span>
                        <input
                          type="number"
                          min={1}
                          value={plan.dailyEarning}
                          onChange={(e) => handlePlanFieldChange(plan.id, 'dailyEarning', Number(e.target.value))}
                          className="flex-1 bg-slate-900 border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-lg font-black text-white font-mono"
                        />
                      </div>

                      {/* Quick Increase / Decrease Buttons (+/-) */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 mr-1 font-semibold">Quick Adjust:</span>
                        <button
                          type="button"
                          onClick={() => handleDailyIncomeDelta(plan.id, -50)}
                          className="px-2 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          -₹50
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDailyIncomeDelta(plan.id, -10)}
                          className="px-2 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          -₹10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDailyIncomeDelta(plan.id, -5)}
                          className="px-2 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          -₹5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDailyIncomeDelta(plan.id, 5)}
                          className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          +₹5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDailyIncomeDelta(plan.id, 10)}
                          className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          +₹10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDailyIncomeDelta(plan.id, 50)}
                          className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          +₹50
                        </button>
                      </div>
                    </div>

                    {/* Secondary Plan Settings: Price & Duration */}
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Plan Price (₹)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={plan.price}
                          onChange={(e) => handlePlanFieldChange(plan.id, 'price', Number(e.target.value))}
                          className="w-full bg-[#070F1E] border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Duration (Days)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={plan.durationDays}
                          onChange={(e) => handlePlanFieldChange(plan.id, 'durationDays', Number(e.target.value))}
                          className="w-full bg-[#070F1E] border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-bold font-mono"
                        />
                      </div>
                    </div>

                    {/* Summary metrics */}
                    <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Total Return</span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          ₹{plan.totalReturn.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Total Return ROI</span>
                        <span className="text-xs font-bold text-amber-300">
                          {roiPercent}% ROI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Save Button for this plan */}
                  <button
                    type="button"
                    onClick={() => handleSavePlan(plan.id)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Save {plan.name} Daily Income</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: "ALL WORKING DATA" CENTRAL MANAGEMENT PAGE */}
      {activeTab === 'workingData' && (
        <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] overflow-hidden shadow-xl space-y-4">
          {/* Search & Filter Component with Referral Code Search & Status Buttons */}
          <div className="p-4 sm:p-5 border-b border-[#1E3A5F] space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search by Name, Mobile, ID */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'hi' ? 'नाम, मोबाइल, या आईडी से खोजें...' : 'Search by Name, Mobile, User ID...'}
                  className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dedicated Referral Code Search & Filter */}
              <div className="relative flex-1 max-w-xs">
                <Users className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterReferralCode}
                  onChange={(e) => setFilterReferralCode(e.target.value)}
                  placeholder={language === 'hi' ? 'रेफरल कोड से खोजें (उदा: LOGI-ADMIN)...' : 'Filter by Referral Code (e.g. LOGI-ADMIN)...'}
                  className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-cyan-400 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
                {filterReferralCode && (
                  <button 
                    onClick={() => setFilterReferralCode('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Plan dropdown & Export */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="bg-[#070F1E] border border-[#1E3A5F] text-slate-200 px-3 py-2 rounded-xl focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="ALL">All Plans (सभी प्लान्स)</option>
                  <option value="PAID">Active Paid Plans (सक्रिय - {paidPlanCount})</option>
                  <option value="FREE">Free Inactive (फ्री - {freePlanCount})</option>
                  <option value="bronze">Bronze (₹499)</option>
                  <option value="silver">Silver (₹999)</option>
                  <option value="gold">Gold (₹2,499)</option>
                  <option value="platinum">Platinum (₹4,999)</option>
                  <option value="diamond">Diamond (₹9,999)</option>
                </select>

                <button
                  onClick={() => exportToCsv('users')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportCsv}</span>
                </button>
              </div>
            </div>

            {/* Quick Status Pills & Matching Count */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language === 'hi' ? 'अकाउंट स्टेटस:' : 'Account Status:'}</span>
                </span>
                
                <button
                  type="button"
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    filterStatus === 'ALL'
                      ? 'bg-[#1E3A5F] text-white border border-[#D4AF37]/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {language === 'hi' ? 'सभी' : 'All'} ({users.filter(u => u.role !== 'admin').length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    filterStatus === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{language === 'hi' ? 'सक्रिय (Active)' : 'Active'}</span> ({activeUserCount})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus('blocked')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    filterStatus === 'blocked'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{language === 'hi' ? 'ब्लॉक (Blocked)' : 'Blocked'}</span> ({blockedUserCount})
                </button>

                {(searchQuery || filterReferralCode || filterPlan !== 'ALL' || filterStatus !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterReferralCode('');
                      setFilterPlan('ALL');
                      setFilterStatus('ALL');
                    }}
                    className="ml-2 text-rose-400 hover:text-rose-300 font-semibold underline text-xs cursor-pointer"
                  >
                    {language === 'hi' ? 'फ़िल्टर हटाएं (Reset)' : 'Clear Filters'}
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {language === 'hi' ? 'दिखाए जा रहे सदस्य:' : 'Showing members:'}{' '}
                <span className="text-[#D4AF37] font-bold">{filteredUsers.length}</span> / {users.filter(u => u.role !== 'admin').length}
              </div>
            </div>
          </div>

          {/* MOBILE CARD VIEW (Touch-Optimized for Smooth Mobile Run) */}
          <div className="block md:hidden p-4 space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No matching customer accounts found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#070F1E] rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md"
                >
                  {/* Card Header: User ID, Name, Mobile, Status */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-[#D4AF37]">
                          {user.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                          user.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white mt-0.5">
                        {user.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        📱 {user.mobile}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-mono text-[10px]">
                          🤝 Sponsor: {user.referredBy || 'LOGI-ADMIN'}
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono">
                          🕒 {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + new Date(user.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      {/* Password reveal & copy in mobile */}
                      <div className="mt-1.5 flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="font-semibold text-slate-300">Pass:</span>
                          <span className="font-mono font-bold text-white tracking-wider select-all">
                            {revealedPasswords[user.id] ? (user.password || 'password123') : '••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(user.id)}
                            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition cursor-pointer"
                            title={revealedPasswords[user.id] ? 'Hide password' : 'View password'}
                          >
                            {revealedPasswords[user.id] ? <EyeOff className="w-3 h-3 text-cyan-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyPasswordToClipboard(user.password || 'password123', user.id)}
                            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-[#D4AF37] rounded transition cursor-pointer"
                            title="Copy password"
                          >
                            {copiedPasswordId === user.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block uppercase">Balance</span>
                      <span className="font-mono font-black text-base text-emerald-400">
                        ₹{user.walletBalance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Pending Recharge Request Alert & Quick Activation for Mobile */}
                  {(() => {
                    const pendingReq = payments.find(p => p.userId === user.id && p.status === 'pending');
                    if (pendingReq) {
                      return (
                        <div className="p-3 bg-amber-500/20 border-2 border-amber-500/60 rounded-xl space-y-1.5 animate-pulse">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                            <span>⚡ रिचार्ज अनुरोध: {pendingReq.planName}</span>
                            <span className="font-mono text-white text-sm">₹{pendingReq.amount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                            <span>UTR: {pendingReq.utr}</span>
                            <span className="text-amber-400">PENDING</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              verifyPayment(pendingReq.id, true);
                              setActionToast({
                                type: 'success',
                                message: `Plan ${pendingReq.planName} activated for ${user.name} (${user.id})!`
                              });
                              setTimeout(() => setActionToast(null), 4000);
                            }}
                            className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve & Activate (आईडी चालू करें)</span>
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Plan Activation Selector Row */}
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Active Plan & Daily ROI:</span>
                      {user.planId === 'free' ? (
                        <span className="text-amber-400 font-bold text-[10px] animate-pulse">
                          ● Plan Inactive
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold text-[10px]">
                          ✓ Plan Active
                        </span>
                      )}
                    </div>
                    <select
                      value={user.planId}
                      onChange={(e) => {
                        const newPlan = e.target.value as PlanId;
                        updateUserPlan(user.id, newPlan);
                        setActionToast({
                          type: 'success',
                          message: `Plan ${newPlan.toUpperCase()} activated & permanently locked for ${user.name} (${user.id})!`
                        });
                        setTimeout(() => setActionToast(null), 3500);
                      }}
                      className={`w-full text-xs font-bold py-2 px-3 rounded-xl cursor-pointer transition focus:outline-none border ${
                        user.planId === 'free'
                          ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                          : 'bg-[#070F1E] text-emerald-400 border-emerald-500/50'
                      }`}
                    >
                      <option value="free">FREE (Inactive - ₹0/day)</option>
                      <option value="bronze">BRONZE (₹499 - ₹25/day)</option>
                      <option value="silver">SILVER (₹999 - ₹55/day)</option>
                      <option value="gold">GOLD (₹2,499 - ₹150/day)</option>
                      <option value="platinum">PLATINUM (₹4,999 - ₹330/day)</option>
                      <option value="diamond">DIAMOND (₹9,999 - ₹700/day)</option>
                    </select>
                  </div>

                  {/* Metrics & Referral */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Earnings:</span>
                      <span className="font-mono font-bold text-slate-200">
                        ₹{user.totalEarnings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Referral Code:</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {user.referralCode}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => openEditMemberModal(user)}
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setSelectedUserForEdit(user)}
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Wallet</span>
                    </button>
                    <button
                      onClick={() => setMemberToDelete(user)}
                      disabled={user.role === 'admin'}
                      className={`flex items-center justify-center gap-1 py-2 px-2 font-bold text-xs rounded-xl transition cursor-pointer ${
                        user.role === 'admin'
                          ? 'opacity-40 cursor-not-allowed bg-slate-800/40 text-slate-500'
                          : 'bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE VIEW (For Large Screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-slate-400 font-semibold border-b border-[#1E3A5F]">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Password (पासवर्ड)</th>
                  <th className="py-3 px-4">Sponsor / Upline (रेफरर)</th>
                  <th className="py-3 px-4">Plan (Direct Activate)</th>
                  <th className="py-3 px-4 text-right">Wallet Balance</th>
                  <th className="py-3 px-4 text-right">Total Earned</th>
                  <th className="py-3 px-4">Joined & Ref Code</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500">
                      No matching customer accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">
                        {user.id}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div>{user.name}</div>
                        {(() => {
                          const pendingReq = payments.find(p => p.userId === user.id && p.status === 'pending');
                          if (pendingReq) {
                            return (
                              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-bold animate-pulse">
                                <span>⚡ Recharge: {pendingReq.planName} (₹{pendingReq.amount.toLocaleString('en-IN')}) • UTR: {pendingReq.utr}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    verifyPayment(pendingReq.id, true);
                                    setActionToast({
                                      type: 'success',
                                      message: `Plan ${pendingReq.planName} activated for ${user.name}!`
                                    });
                                    setTimeout(() => setActionToast(null), 3500);
                                  }}
                                  className="ml-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-black cursor-pointer shadow"
                                >
                                  Activate Now (आईडी चालू करें)
                                </button>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {user.mobile}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div className="inline-flex items-center gap-1 bg-[#070F1E] px-2 py-1 rounded-lg border border-slate-800">
                          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="font-bold tracking-wider text-xs min-w-[70px] select-all">
                            {revealedPasswords[user.id] ? (user.password || 'password123') : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(user.id)}
                            className="p-1 text-slate-400 hover:text-cyan-400 rounded transition cursor-pointer"
                            title={revealedPasswords[user.id] ? 'Hide password' : 'View password'}
                          >
                            {revealedPasswords[user.id] ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyPasswordToClipboard(user.password || 'password123', user.id)}
                            className="p-1 text-slate-400 hover:text-[#D4AF37] rounded transition cursor-pointer"
                            title="Copy password"
                          >
                            {copiedPasswordId === user.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const sponsor = users.find(s => s.referralCode === user.referredBy || s.id === user.referredBy);
                          return (
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-cyan-300">
                                {user.referredBy || 'LOGI-ADMIN'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {sponsor ? sponsor.name : (user.referredBy === 'LOGI-ADMIN' ? 'Company Direct' : 'Direct Referral')}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={user.planId}
                            onChange={(e) => {
                              const newPlan = e.target.value as PlanId;
                              updateUserPlan(user.id, newPlan);
                              setActionToast({
                                type: 'success',
                                message: `Plan ${newPlan.toUpperCase()} activated & permanently locked for ${user.name} (${user.id})!`
                              });
                              setTimeout(() => setActionToast(null), 3500);
                            }}
                            className={`text-xs font-bold py-1 px-2.5 rounded-lg cursor-pointer transition focus:outline-none border ${
                              user.planId === 'free'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/60'
                                : 'bg-[#070F1E] text-emerald-400 border-emerald-500/50 hover:border-emerald-400'
                            }`}
                            title="Admin manual plan activation / change"
                          >
                            <option value="free">FREE (Inactive)</option>
                            <option value="bronze">BRONZE (₹499)</option>
                            <option value="silver">SILVER (₹999)</option>
                            <option value="gold">GOLD (₹2,499)</option>
                            <option value="platinum">PLATINUM (₹4,999)</option>
                            <option value="diamond">DIAMOND (₹9,999)</option>
                          </select>
                          {user.planId === 'free' && (
                            <span className="text-[10px] text-amber-400 font-semibold animate-pulse whitespace-nowrap">
                              ● Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        ₹{user.walletBalance.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        ₹{user.totalEarnings.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {(() => {
                          const createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
                          const isNew = (Date.now() - createdDate.getTime()) < 30 * 60 * 1000;
                          return (
                            <div className="flex flex-col">
                              <span className="font-mono text-slate-300 text-[11px]">
                                {createdDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="font-mono text-slate-500 text-[10px] flex items-center gap-1">
                                {createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                {isNew && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Ref: {user.referralCode}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          user.status === 'active' 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {user.planId !== 'free' && (
                            <button
                              onClick={() => {
                                const res = claimUserDailyIncome(user.id);
                                setActionToast({
                                  type: res.success ? 'success' : 'error',
                                  message: res.message
                                });
                                setTimeout(() => setActionToast(null), 4000);
                              }}
                              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 rounded-lg transition cursor-pointer"
                              title={`Credit Daily Return (${plans.find(p => p.id === user.planId)?.name || ''} - ₹${plans.find(p => p.id === user.planId)?.dailyEarning || 0}) to this user`}
                            >
                              <Zap className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditMemberModal(user)}
                            className="p-1.5 bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 text-slate-200 rounded-lg transition cursor-pointer"
                            title="Edit Member (Name, Mobile, Password, Plan, Status)"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedUserForEdit(user)}
                            className="p-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 rounded-lg transition cursor-pointer"
                            title="Adjust Wallet Balance"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(user)}
                            disabled={user.role === 'admin'}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              user.role === 'admin'
                                ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600'
                                : 'bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white'
                            }`}
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Verification */}
      {activeTab === 'payments' && (
        <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-[#1E3A5F] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                UPI Payment Verifications & UTR Validation
              </h3>
              <p className="text-xs text-slate-400">
                Approving automatically activates customer membership plan and pays 10% direct commission to inviter.
              </p>
            </div>
            <button
              onClick={() => exportToCsv('payments')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Payments</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-slate-400 font-semibold border-b border-[#1E3A5F]">
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Plan Requested</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Submitted 12-Digit UTR</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No payment submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 font-semibold">
                        {p.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{p.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.userId} • {p.userMobile}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-300">{p.planName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-extrabold text-sm text-white">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300 tracking-wider">
                        {p.utr}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(p.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          p.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : p.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-300 animate-pulse'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => verifyPayment(p.id, true)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingItem({ type: 'payment', id: p.id })}
                              className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-lg transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Withdrawals Management */}
      {activeTab === 'withdrawals' && (
        <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-[#1E3A5F] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                Member UPI Withdrawal Requests
              </h3>
              <p className="text-xs text-slate-400">
                Process customer withdrawals to their specified UPI ID / Mobile. Rejections automatically refund available balances.
              </p>
            </div>
            <button
              onClick={() => exportToCsv('withdrawals')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Withdrawals</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-slate-400 font-semibold border-b border-[#1E3A5F]">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Gross Req</th>
                  <th className="py-3 px-4">5% TDS</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Receiving UPI ID</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No withdrawal requests at this time.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => {
                    const gross = w.amount;
                    const tds = w.tdsAmount ?? Math.round(gross * 0.05);
                    const net = w.netAmount ?? (gross - tds);

                    return (
                      <tr key={w.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-slate-400 font-semibold">
                          {w.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{w.userName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{w.userId}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-xs text-slate-200">
                          ₹{gross.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-xs text-amber-400">
                          -₹{tds.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono font-extrabold text-sm text-emerald-400">
                          ₹{net.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                          {w.upiId}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {w.upiMobile}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(w.requestedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            w.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : w.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {w.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => processWithdrawal(w.id, true, `PAYOUT-${Date.now().toString().slice(-6)}`)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition cursor-pointer shadow-sm shadow-emerald-500/30 whitespace-nowrap"
                                title={`Disburse Net ₹${net} to ${w.upiId}`}
                              >
                                Pay Net ₹{net.toLocaleString('en-IN')}
                              </button>
                              <button
                                onClick={() => setRejectingItem({ type: 'withdrawal', id: w.id })}
                                className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-lg transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">{w.payoutReference || 'Processed'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Settings Management */}
      {activeTab === 'settings' && (
        <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] p-5 sm:p-6 shadow-xl max-w-3xl">
          <h3 className="font-bold text-base text-white mb-1">
            System & UPI Configuration
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Configure the official receiving UPI ID, PhonePe number, payee title, and minimum payout threshold.
          </p>

          {settingsSaved && (
            <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Official Payee Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.payeeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, payeeName: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Official UPI ID
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.upiId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-amber-300 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  PhonePe Number
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.phonePeNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phonePeNumber: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Minimum Withdrawal Limit (₹)
                </label>
                <input
                  type="number"
                  min={10}
                  required
                  value={settingsForm.minWithdrawal}
                  onChange={(e) => setSettingsForm({ ...settingsForm, minWithdrawal: Number(e.target.value) })}
                  className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white font-bold"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  {[100, 320, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, minWithdrawal: val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        settingsForm.minWithdrawal === val 
                          ? 'bg-[#D4AF37] text-slate-950 font-bold' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  1-Day Maximum Withdrawal Limit (₹)
                </label>
                <input
                  type="number"
                  min={100}
                  required
                  value={settingsForm.maxWithdrawal || 5000}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxWithdrawal: Number(e.target.value) })}
                  className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white font-bold"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  {[3200, 5000, 10000, 25000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, maxWithdrawal: val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        settingsForm.maxWithdrawal === val 
                          ? 'bg-[#D4AF37] text-slate-950 font-bold' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      ₹{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  TDS Deduction Rate (% on Payouts)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    required
                    value={settingsForm.tdsPercent ?? 5}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tdsPercent: Number(e.target.value) })}
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-emerald-400 font-bold"
                  />
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  {[0, 5, 10, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, tdsPercent: val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        (settingsForm.tdsPercent ?? 5) === val 
                          ? 'bg-emerald-500 text-slate-950 font-bold' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {val}% {val === 5 ? '(Govt Std)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Announcement Ticker (English)
              </label>
              <input
                type="text"
                value={settingsForm.announcementEn}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementEn: e.target.value })}
                className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Announcement Ticker (हिंदी)
              </label>
              <input
                type="text"
                value={settingsForm.announcementHi}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementHi: e.target.value })}
                className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow hover:brightness-110 active:scale-95 transition"
              >
                {t.saveChanges}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#0F223D] rounded-2xl border border-[#1E3A5F] overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-[#1E3A5F]">
            <h3 className="font-bold text-base text-white">
              System Audit Trail & Admin Action Logs
            </h3>
            <p className="text-xs text-slate-400">
              Immutable logging of administrative interventions, plan approvals, and monetary movements.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-slate-400 font-semibold border-b border-[#1E3A5F]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Target User</th>
                  <th className="py-3 px-4">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-300">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300">
                      {log.targetUserId || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {log.adminId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Customer Support Chat Center */}
      {activeTab === 'supportChat' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0F223D] via-[#102C4E] to-[#0A192F] p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
                <MessageSquare className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    {language === 'hi' ? 'पेज 3: ग्राहक सहायता एवं लाइव चैट केंद्र' : 'Page 3: Customer Support & Live Chat Desk'}
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Firebase Firestore Realtime
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Direct bidirectional chat with all registered members. Resolve recharge UTR, withdrawal status, and plan queries instantly without page reload.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-[#070F1E] border border-slate-700/80 text-xs">
                <span className="text-slate-400 block text-[10px]">Unread Queries</span>
                <span className={`font-mono font-extrabold ${unreadChatCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {unreadChatCount} unread
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#070F1E] border border-slate-700/80 text-xs">
                <span className="text-slate-400 block text-[10px]">Total Messages</span>
                <span className="font-mono font-extrabold text-amber-300">
                  {totalChatCount}
                </span>
              </div>
            </div>
          </div>

          {/* Main Chat Grid (Left: User List, Right: Message Thread) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Panel: Conversation User List */}
            <div className="lg:col-span-4 bg-[#0F223D] border border-[#1E3A5F] rounded-2xl flex flex-col h-[700px] overflow-hidden shadow-xl">
              {/* Search & Filter Header */}
              <div className="p-3 border-b border-[#1E3A5F] bg-[#0A192F]/80 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    placeholder="Search member name, ID, mobile..."
                    className="w-full bg-[#070F1E] border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  {chatSearchQuery && (
                    <button
                      onClick={() => setChatSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  {(['all', 'unread', 'recharge', 'withdrawal'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setChatFilter(tab)}
                      className={`px-2.5 py-1 rounded-lg font-bold capitalize transition shrink-0 ${
                        chatFilter === tab
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'bg-[#070F1E] text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {tab === 'all' ? 'All' : tab === 'unread' ? `Unread (${unreadChatCount})` : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* User List scrollable container */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1.5 space-y-1">
                {chatUsersList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No conversations found matching filters.
                  </div>
                ) : (
                  chatUsersList.map(u => {
                    const isSelected = selectedChatUserId === u.id;
                    const hasUnread = u.unreadCount > 0;
                    const isBroadcast = u.id === 'U-ALL';

                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSelectedChatUserId(u.id);
                          if (u.id !== 'U-ALL') {
                            markChatAsRead(u.id, 'admin');
                          }
                        }}
                        className={`p-3 rounded-xl cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-[#152e52] border border-emerald-500/50 shadow-md'
                            : 'hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          isBroadcast
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : isSelected
                              ? 'bg-emerald-500 text-slate-950 font-black shadow'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {isBroadcast ? '📢' : u.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-white truncate">
                              {u.name}
                            </span>
                            {u.lastMsg && (
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(u.lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                            <span className="font-mono text-cyan-300 font-semibold">{u.id}</span>
                            <span>•</span>
                            <span className="truncate">{u.mobile}</span>
                            {u.planId && u.planId !== 'all' && (
                              <span className="px-1 py-0.2 rounded bg-slate-800 text-amber-300 text-[9px] uppercase font-bold border border-slate-700">
                                {u.planId}
                              </span>
                            )}
                          </div>

                          {/* Last message preview */}
                          {u.lastMsg ? (
                            <p className="text-[11px] text-slate-300 truncate mt-1">
                              <span className={u.lastMsg.sender === 'admin' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                                {u.lastMsg.sender === 'admin' ? 'You: ' : ''}
                              </span>
                              {u.lastMsg.message}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-500 italic mt-1">No messages yet. Click to start chat.</p>
                          )}
                        </div>

                        {hasUnread && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse shrink-0">
                            {u.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Selected Conversation Thread */}
            {(() => {
              const selectedUserObj = users.find(u => u.id === selectedChatUserId);
              const conversationMessages = supportMessages.filter(
                m => m.userId === selectedChatUserId || (selectedChatUserId === 'U-ALL' && m.userId === 'U-ALL')
              );
              const isBroadcast = selectedChatUserId === 'U-ALL';

              return (
                <div className="lg:col-span-8 bg-[#0F223D] border border-[#1E3A5F] rounded-2xl flex flex-col h-[700px] overflow-hidden shadow-xl">
                  {/* Chat User Header Card */}
                  <div className="p-3.5 sm:p-4 border-b border-[#1E3A5F] bg-[#0A192F]/90 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isBroadcast
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {isBroadcast ? '📢' : (selectedUserObj?.name || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-white">
                            {isBroadcast ? 'All Members Global Broadcast Notice' : (selectedUserObj?.name || selectedChatUserId)}
                          </h4>
                          {!isBroadcast && selectedUserObj && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                              {selectedUserObj.planId} Plan
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                          <span className="font-mono text-cyan-300">ID: {selectedChatUserId}</span>
                          {!isBroadcast && selectedUserObj && (
                            <>
                              <span>•</span>
                              <span>Mobile: <strong className="text-white font-mono">{selectedUserObj.mobile}</strong></span>
                              <span>•</span>
                              <span>Balance: <strong className="text-emerald-400 font-mono">₹{selectedUserObj.walletBalance.toLocaleString('en-IN')}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Admin Actions for this customer */}
                    <div className="flex items-center gap-1.5">
                      {!isBroadcast && selectedUserObj && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditMemberModal(selectedUserObj)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
                            title="Edit customer account details"
                          >
                            <Edit className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="hidden sm:inline">Edit Member</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedUserForEdit(selectedUserObj)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center gap-1 transition"
                            title="Credit or Debit wallet balance"
                          >
                            <Wallet className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden sm:inline">Wallet Adjust</span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => markChatAsRead(selectedChatUserId, 'admin')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center gap-1 transition"
                        title="Mark conversation as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Mark Read</span>
                      </button>
                    </div>
                  </div>

                  {/* Message History Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#070F1E] to-[#0A192F]">
                    {conversationMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <h5 className="font-bold text-white text-sm">No messages yet with {selectedUserObj?.name || selectedChatUserId}</h5>
                        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                          You can send a welcome message, update on recharge UTR, or notify regarding withdrawals using the input or quick preset replies below.
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
                          {quickAdminPresets.slice(0, 3).map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAdminSendReply(p.text, p.cat)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs border border-slate-700 hover:border-emerald-500/50 transition"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      conversationMessages.map(msg => {
                        const isUserMsg = msg.sender === 'user';
                        const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                          <div 
                            key={msg.id}
                            className={`flex flex-col ${isUserMsg ? 'items-start' : 'items-end'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                              {isUserMsg ? (
                                <>
                                  <span className="font-bold text-cyan-300">
                                    Customer: {msg.userName} ({msg.userMobile || msg.userId})
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="font-bold text-emerald-300">Logitech Support Admin</span>
                                </>
                              )}
                              <span className="text-[10px] text-slate-500">• {timeFormatted}</span>
                              {msg.category && (
                                <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                                  msg.category === 'RECHARGE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                  msg.category === 'WITHDRAWAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                  msg.category === 'PLAN' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                  'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {msg.category}
                                </span>
                              )}
                            </div>

                            <div 
                              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-md leading-relaxed whitespace-pre-wrap break-words ${
                                isUserMsg
                                  ? 'bg-[#0E1D33] border border-cyan-500/30 text-white rounded-tl-none shadow-cyan-500/5'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-slate-950 font-medium rounded-tr-none shadow-emerald-500/10'
                              }`}
                            >
                              <span className={isUserMsg ? 'text-slate-100' : 'text-slate-950 font-semibold'}>
                                {msg.message}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-500">
                              {!isUserMsg && (
                                msg.readByUser ? (
                                  <span className="text-emerald-400 flex items-center gap-0.5">
                                    <CheckCheck className="w-3 h-3" /> Seen by customer
                                  </span>
                                ) : (
                                  <span>Sent to customer</span>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Quick Preset Replies Toolbar */}
                  <div className="px-3 py-2 bg-[#0A192F] border-t border-[#1E3A5F] overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Quick:
                    </span>
                    {quickAdminPresets.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAdminSendReply(p.text, p.cat)}
                        className="px-2.5 py-1 rounded-lg bg-[#0F223D] hover:bg-[#152e52] text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500/50 text-[11px] whitespace-nowrap transition flex items-center gap-1 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Live Reply Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAdminSendReply();
                    }}
                    className="p-3 bg-[#070F1E] border-t border-[#1E3A5F] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-slate-400">Reply Category:</span>
                        {(['GENERAL', 'RECHARGE', 'WITHDRAWAL', 'PLAN'] as const).map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setAdminReplyCategory(cat)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                              adminReplyCategory === cat
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <span className="text-[10px] text-slate-500">
                        Recipient: <strong className="text-emerald-400">{selectedChatUserId}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={adminReplyInput}
                        onChange={(e) => setAdminReplyInput(e.target.value)}
                        placeholder={`Type reply to ${selectedUserObj?.name || selectedChatUserId}... (ग्राहक को रिप्लाई लिखें)`}
                        className="flex-1 bg-[#0F223D] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                      <button
                        type="submit"
                        disabled={!adminReplyInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer shrink-0"
                      >
                        <span>Send Reply</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* User Edit / Manage Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0F223D] border border-[#1E3A5F] rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">
                  Manage Customer: {selectedUserForEdit.name}
                </h3>
                <p className="text-xs text-slate-400">
                  ID: <span className="font-mono text-[#D4AF37]">{selectedUserForEdit.id}</span> • Mobile: {selectedUserForEdit.mobile}
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current State Summary */}
            <div className="grid grid-cols-3 gap-2.5 text-xs bg-[#070F1E] p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Balance</span>
                <span className="font-bold text-amber-300 text-sm">₹{selectedUserForEdit.walletBalance.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Plan</span>
                <span className="font-bold text-white uppercase">{selectedUserForEdit.planId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span className={`font-bold capitalize ${selectedUserForEdit.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedUserForEdit.status}
                </span>
              </div>
            </div>

            {/* Change Plan Directly */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Change Membership Plan
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedUserForEdit.planId}
                  onChange={(e) => {
                    const newPlan = e.target.value as PlanId;
                    updateUserPlan(selectedUserForEdit.id, newPlan);
                    setSelectedUserForEdit({ ...selectedUserForEdit, planId: newPlan });
                  }}
                  className="flex-1 bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="free">Free Member</option>
                  <option value="bronze">Bronze (₹499)</option>
                  <option value="silver">Silver (₹999)</option>
                  <option value="gold">Gold (₹2499)</option>
                  <option value="platinum">Platinum (₹4999)</option>
                  <option value="diamond">Diamond (₹9999)</option>
                </select>
                <button
                  onClick={() => {
                    const newStatus = selectedUserForEdit.status === 'active' ? 'blocked' : 'active';
                    updateUserStatus(selectedUserForEdit.id, newStatus);
                    setSelectedUserForEdit({ ...selectedUserForEdit, status: newStatus });
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition ${
                    selectedUserForEdit.status === 'active'
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {selectedUserForEdit.status === 'active' ? 'Block Account' : 'Unblock Account'}
                </button>
              </div>
            </div>

            {/* Manual Wallet Credit / Debit */}
            <form onSubmit={handleWalletAdjustSubmit} className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 block">
                Manual Wallet Adjustment (Instant Ledger Credit / Debit)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustIsCredit(true)}
                  className={`py-1.5 rounded-lg font-bold border transition ${
                    adjustIsCredit 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                      : 'bg-[#070F1E] border-slate-800 text-slate-400'
                  }`}
                >
                  + Credit to Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustIsCredit(false)}
                  className={`py-1.5 rounded-lg font-bold border transition ${
                    !adjustIsCredit 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                      : 'bg-[#070F1E] border-slate-800 text-slate-400'
                  }`}
                >
                  - Debit from Wallet
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="Amount (₹)"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white font-bold"
                />
                <input
                  type="text"
                  placeholder="Reason / Note"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!adjustAmount}
                className="w-full bg-[#D4AF37] hover:bg-[#E5B834] text-slate-950 font-bold py-2 rounded-xl transition"
              >
                Apply Balance Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#0F223D] border border-rose-500/40 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">
              Confirm Rejection: {rejectingItem.id}
            </h3>
            <p className="text-xs text-slate-400">
              Please enter the reason for rejecting this {rejectingItem.type}. This will be shown to the customer.
            </p>
            <input
              type="text"
              required
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Invalid UTR / Name Mismatch"
              className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectingItem(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL MEMBER EDIT MODAL (Name, Mobile, Password Reset, Plan, Status, Balance) */}
      {memberToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0F223D] border border-[#1E3A5F] rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white font-display">
                    {language === 'hi' ? 'सदस्य विवरण बदलें' : 'Edit Member Account'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-[#D4AF37] font-bold">{memberToEdit.id}</span> • Ref: {memberToEdit.referralCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMemberToEdit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberEdit} className="space-y-4 text-xs">
              {/* Full Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'hi' ? 'ग्राहक का नाम' : 'Customer Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl px-3 py-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editForm.mobile}
                    onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-[#D4AF37] rounded-xl px-3 py-2.5 text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Current Password Display & Visibility Card */}
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'hi' ? 'ग्राहक का वर्तमान पासवर्ड' : 'Current Account Password'}:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(prev => !prev)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                    >
                      {showModalPassword ? <EyeOff className="w-3 h-3 text-cyan-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
                      <span>{showModalPassword ? (language === 'hi' ? 'छिपाएं' : 'Hide') : (language === 'hi' ? 'देखें' : 'View')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyPasswordToClipboard(memberToEdit.password || 'password123', 'modal-pass')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 text-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                    >
                      {copiedPasswordId === 'modal-pass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPasswordId === 'modal-pass' ? (language === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (language === 'hi' ? 'कॉपी करें' : 'Copy')}</span>
                    </button>
                  </div>
                </div>
                <div className="bg-[#0F223D] px-3.5 py-2.5 rounded-xl border border-slate-700/70 font-mono text-sm font-bold text-white tracking-widest flex items-center justify-between select-all">
                  <span>{showModalPassword ? (memberToEdit.password || 'password123') : '••••••••••••'}</span>
                  <span className="text-[10px] text-slate-400 font-sans tracking-normal font-normal">
                    {showModalPassword ? '🔓 Visible' : '🔒 Protected'}
                  </span>
                </div>
              </div>

              {/* New Password Reset Input */}
              <div className="bg-[#070F1E] p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <label className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'hi' ? 'नया पासवर्ड सेट करें (New Password)' : 'Set New Password (Leave blank to keep current)'}</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'यहाँ नया पासवर्ड टाइप करें' : 'Type new password here'}
                  value={editForm.password}
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-[#0F223D] border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono text-xs"
                />
              </div>

              {/* Membership Plan Selector (Admin Direct Activation) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'hi' ? 'मेंबरशिप प्लान (Direct ID Activation)' : 'Membership Plan (Direct ID Activation)'}
                </label>
                <select
                  value={editForm.planId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, planId: e.target.value as PlanId }))}
                  className="w-full bg-[#070F1E] border border-[#1E3A5F] focus:border-emerald-400 rounded-xl px-3 py-2.5 text-white font-bold"
                >
                  <option value="free">FREE (Inactive Tier - ₹0/day)</option>
                  <option value="bronze">BRONZE (₹499 - Daily ₹25/day)</option>
                  <option value="silver">SILVER (₹999 - Daily ₹55/day)</option>
                  <option value="gold">GOLD (₹2,499 - Daily ₹150/day)</option>
                  <option value="platinum">PLATINUM (₹4,999 - Daily ₹330/day)</option>
                  <option value="diamond">DIAMOND (₹9,999 - Daily ₹700/day)</option>
                </select>
                <p className="text-[10px] text-emerald-400 mt-1">
                  ✓ Changing plan directly activates member daily returns and credits 10% direct sponsor bonus.
                </p>
              </div>

              {/* Status & Wallet Balance Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Account Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as 'active' | 'blocked' }))}
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="active">Active (Normal Access)</option>
                    <option value="blocked">Blocked (Suspended)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Wallet Balance (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.walletBalance}
                    onChange={(e) => setEditForm(prev => ({ ...prev, walletBalance: Number(e.target.value) }))}
                    className="w-full bg-[#070F1E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMemberToEdit(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-black rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  {language === 'hi' ? 'बदलाव सुरक्षित करें' : 'Save Member Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MEMBER CONFIRMATION MODAL */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0F223D] border border-rose-500/50 rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-rose-400 pb-2 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {language === 'hi' ? 'सदस्य को हटाएं (Delete Member)' : 'Delete Member Account?'}
                </h3>
                <p className="text-xs text-rose-300">
                  {language === 'hi' ? 'यह क्रिया वापस नहीं ली जा सकती' : 'This action is irreversible'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete customer <strong className="text-white">{memberToDelete.name}</strong> (<span className="font-mono text-[#D4AF37]">{memberToDelete.id}</span>)?
            </p>

            <div className="bg-[#070F1E] p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-400">
              <div>Mobile: <span className="text-slate-200 font-mono font-bold">{memberToDelete.mobile}</span></div>
              <div>Plan: <span className="text-white uppercase font-bold">{memberToDelete.planId}</span></div>
              <div>Wallet Balance: <span className="text-emerald-400 font-mono font-bold">₹{memberToDelete.walletBalance.toLocaleString('en-IN')}</span></div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteMember}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE LAUNCH DATABASE CLEAN SLATE CONFIRMATION MODAL */}
      {showCleanSlateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0F223D] border border-rose-500/50 rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-rose-400 pb-2 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Database Clean Slate (Live Launch)
                </h3>
                <p className="text-xs text-rose-300">
                  Wipe all test accounts & start fresh from LT000101
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This operation transitions your platform from <strong>Testing Mode to 100% Live Production</strong> by purging all dummy users, fake referrals, and test transactions from both cloud Firestore and browser memory:
            </p>

            <div className="bg-[#070F1E] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 font-sans">
              <div className="text-emerald-400 font-bold">✓ Erases all test user accounts & dummy team members</div>
              <div className="text-emerald-400 font-bold">✓ Wipes all test payments, withdrawals & ledger logs</div>
              <div className="text-emerald-400 font-bold">✓ Resets User ID sequence to start cleanly at <span className="font-mono text-[#D4AF37]">LT000101</span></div>
              <div className="text-emerald-400 font-bold">✓ Preserves Super Admin (<span className="font-mono text-[#D4AF37]">logitech01</span>) with fresh starting ₹0 balance</div>
              <div className="text-emerald-400 font-bold">✓ Real-time synced across all tabs & remote Firestore database</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={cleanSlateLoading}
                onClick={() => setShowCleanSlateModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={cleanSlateLoading}
                onClick={handleConfirmCleanSlate}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/50 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cleanSlateLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Wiping Database...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Confirm Live Clean Slate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
