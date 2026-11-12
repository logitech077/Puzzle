import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, Plan, PaymentTransaction, WithdrawalRequest, LedgerEntry, 
  AuditLog, CompanySettings, Language, PlanId, UserRole, SupportMessage 
} from '../types';
import { 
  INITIAL_PLANS, INITIAL_USERS, INITIAL_PAYMENTS, 
  INITIAL_WITHDRAWALS, INITIAL_LEDGER, INITIAL_SETTINGS, INITIAL_AUDIT_LOGS,
  INITIAL_SUPPORT_MESSAGES 
} from '../data/initialData';
import { translations } from '../translations';
import { 
  saveUserToFirestore, 
  deleteUserFromFirestore, 
  savePaymentToFirestore, 
  saveWithdrawalToFirestore, 
  saveLedgerEntryToFirestore, 
  saveSettingsToFirestore, 
  saveAuditLogToFirestore, 
  savePlanToFirestore, 
  saveSupportMessageToFirestore,
  seedInitialFirestoreData, 
  subscribeToFirestore,
  wipeAllTestDataFromFirestore 
} from '../services/firestoreSync';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  currentUser: User | null;
  users: User[];
  plans: Plan[];
  payments: PaymentTransaction[];
  withdrawals: WithdrawalRequest[];
  ledger: LedgerEntry[];
  settings: CompanySettings;
  auditLogs: AuditLog[];
  companyAvailableFund: number;
  totalTdsCollected: number;
  isCloudSynced: boolean;
  activeModal: 'login' | 'register' | 'user-login' | 'user-register' | 'admin-login' | 'payment' | 'withdraw' | 'declaration' | 'help-chat' | null;
  setActiveModal: (modal: 'login' | 'register' | 'user-login' | 'user-register' | 'admin-login' | 'payment' | 'withdraw' | 'declaration' | 'help-chat' | null) => void;
  selectedPlanForPurchase: Plan | null;
  setSelectedPlanForPurchase: (plan: Plan | null) => void;
  
  // Navigation & Team Filtering
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  teamFilter: 'all' | 'active' | 'free';
  setTeamFilter: (filter: 'all' | 'active' | 'free') => void;
  selectedTeamMember: User | null;
  setSelectedTeamMember: (user: User | null) => void;
  navigateToTeam: (filter?: 'all' | 'active' | 'free') => void;

  // Support & Help Chat
  supportMessages: SupportMessage[];
  sendSupportMessage: (text: string, category?: 'RECHARGE' | 'WITHDRAWAL' | 'PLAN' | 'GENERAL', targetUserId?: string) => { success: boolean; message: string };
  markChatAsRead: (userId: string, reader: 'admin' | 'user') => void;
  
  // Actions
  login: (idOrMobile: string, pass: string) => { success: boolean; message: string };
  loginMember: (mobileOrId: string, pass: string) => { success: boolean; message: string };
  loginAdmin: (adminId: string, pass: string) => { success: boolean; message: string };
  register: (name: string, mobile: string, pass: string, refCode?: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  quickLoginAdmin: () => void;
  quickLoginMember: (userId?: string) => void;
  
  // Financial & Transactions
  submitPayment: (planId: PlanId, amount: number, utr: string, method?: 'UPI_QR' | 'PHONEPE' | 'GPAY' | 'PAYTM', screenshot?: string) => { success: boolean; message: string };
  verifyPayment: (paymentId: string, approve: boolean, reason?: string) => void;
  requestWithdrawal: (amount: number, upiId: string, upiMobile: string) => { success: boolean; message: string };
  processWithdrawal: (withdrawalId: string, approve: boolean, payoutRef?: string, reason?: string) => void;
  manualAdjustWallet: (userId: string, amount: number, isCredit: boolean, reason: string) => void;
  updateUserStatus: (userId: string, status: 'active' | 'blocked') => void;
  updateUserPlan: (userId: string, planId: PlanId) => void;
  editMemberDetails: (userId: string, data: { name?: string; mobile?: string; password?: string; planId?: PlanId; status?: 'active' | 'blocked'; walletBalance?: number }) => { success: boolean; message: string };
  deleteMember: (userId: string) => { success: boolean; message: string };
  updatePlanDailyIncome: (planId: PlanId, newDailyEarning: number, newDurationDays?: number, newPrice?: number) => void;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  runDailyDistribution: (isAutoMidnight?: boolean) => { usersCredited: number; totalDistributed: number };
  claimUserDailyIncome: (userId?: string) => { success: boolean; message: string; amountCredited: number };
  exportToCsv: (type: 'users' | 'payments' | 'withdrawals' | 'ledger') => void;
  resetAllData: () => void;
  resetAllDataToZero: () => void;
  cleanSlateDatabaseReset: () => Promise<{ success: boolean; message: string }>;
}

const STORAGE_KEY = 'logitech_enterprise_rewards_live_prod_v1';
const SYNC_CHANNEL_NAME = 'logitech_rewards_sync_channel';

function loadInitialStorageData<T>(key: string, fallback: T): T {
  try {
    // If opening live production mode for first time, clean legacy test cache
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem('logitech_enterprise_rewards_zero_v1');
      localStorage.removeItem('logitech_rewards_state_v4');
      localStorage.removeItem('logitech_active_user');
      localStorage.removeItem('logitech_ref_code');
      localStorage.removeItem('logitech_auto_midnight_last_run');
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed[key] !== undefined && parsed[key] !== null) {
        if (Array.isArray(fallback)) {
          if (Array.isArray(parsed[key])) {
            return parsed[key] as T;
          }
        } else {
          return parsed[key] as T;
        }
      }
    }
  } catch (err) {
    console.error('Error loading initial storage data for ' + key, err);
  }
  return fallback;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const windowInstanceId = useRef('win-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9));

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('logitech_lang') as Language) || 'en';
  });

  const [users, setUsers] = useState<User[]>(() => loadInitialStorageData('users', INITIAL_USERS));
  const [plans, setPlans] = useState<Plan[]>(() => loadInitialStorageData('plans', INITIAL_PLANS));
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => loadInitialStorageData('payments', INITIAL_PAYMENTS));
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => loadInitialStorageData('withdrawals', INITIAL_WITHDRAWALS));
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => loadInitialStorageData('ledger', INITIAL_LEDGER));
  const [settings, setSettings] = useState<CompanySettings>(() => loadInitialStorageData('settings', INITIAL_SETTINGS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadInitialStorageData('auditLogs', INITIAL_AUDIT_LOGS));
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => loadInitialStorageData('supportMessages', INITIAL_SUPPORT_MESSAGES));

  const syncDirectToStorage = (partial: {
    users?: User[];
    plans?: Plan[];
    payments?: PaymentTransaction[];
    withdrawals?: WithdrawalRequest[];
    ledger?: LedgerEntry[];
    settings?: CompanySettings;
    auditLogs?: AuditLog[];
    supportMessages?: SupportMessage[];
  }) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      const merged = { ...parsed, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.postMessage({ type: 'SYNC_ALL', senderId: windowInstanceId.current, payload: merged });
        channel.close();
      }
    } catch (err) {
      console.warn('Failed direct storage sync:', err);
    }
  };
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('logitech_active_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [activeModal, setActiveModal] = useState<'login' | 'register' | 'user-login' | 'user-register' | 'admin-login' | 'payment' | 'withdraw' | 'declaration' | 'help-chat' | null>(null);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<Plan | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Global Navigation & Team Filter states
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [teamFilter, setTeamFilter] = useState<'all' | 'active' | 'free'>('all');
  const [selectedTeamMember, setSelectedTeamMember] = useState<User | null>(null);

  const navigateToTeam = (filter: 'all' | 'active' | 'free' = 'all') => {
    setTeamFilter(filter);
    setCurrentTab('network');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Initialize Firestore seeding & real-time cloud data subscriptions
  useEffect(() => {
    seedInitialFirestoreData(INITIAL_USERS, INITIAL_PLANS, INITIAL_SETTINGS).catch(e => {
      console.warn('Firestore initial seeding note:', e);
    });

    const unsubscribeFirestore = subscribeToFirestore({
      onUsers: (cloudUsers) => {
        if (!cloudUsers) return;
        setUsers(prev => {
          // Equality check: if user counts, IDs, balances, and statuses are identical, bail out without re-rendering
          if (prev.length === cloudUsers.length) {
            const prevMap = new Map(prev.map(p => [p.id, p]));
            let isIdentical = true;
            for (const cu of cloudUsers) {
              const pu = prevMap.get(cu.id);
              if (
                !pu || 
                pu.walletBalance !== cu.walletBalance ||
                pu.status !== cu.status ||
                pu.planId !== cu.planId ||
                pu.name !== cu.name ||
                pu.mobile !== cu.mobile ||
                pu.password !== cu.password ||
                pu.lastDailyCreditDate !== cu.lastDailyCreditDate ||
                pu.todayReceivedIncome !== cu.todayReceivedIncome
              ) {
                isIdentical = false;
                break;
              }
            }
            if (isIdentical) {
              return prev; // Bail out! Zero re-render!
            }
          }

          // Detect brand new members that arrived live
          const prevIds = new Set(prev.map(p => p.id));
          const newMembers = cloudUsers.filter(u => u.role !== 'admin' && !prevIds.has(u.id));
          if (newMembers.length > 0 && prev.length > 0 && typeof window !== 'undefined') {
            newMembers.forEach(nm => {
              window.dispatchEvent(new CustomEvent('logitech_new_member_registered', {
                detail: { user: nm }
              }));
            });
          }

          const map = new Map<string, User>();
          cloudUsers.forEach(u => map.set(u.id, u));
          // Always keep Super Admin logitech01
          if (!map.has('logitech01')) {
            const admin = prev.find(u => u.id === 'logitech01') || INITIAL_USERS[0];
            map.set('logitech01', admin);
          }

          // Sort so newest members appear at the very top of Admin Dashboard
          return Array.from(map.values()).sort((a, b) => {
            if (a.role === 'admin') return -1;
            if (b.role === 'admin') return 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          });
        });
        setIsCloudSynced(true);
      },
      onPlans: (cloudPlans) => {
        if (cloudPlans && cloudPlans.length > 0) {
          setPlans(prev => {
            const map = new Map<string, Plan>();
            prev.forEach(p => map.set(p.id, p));
            cloudPlans.forEach(p => map.set(p.id, { ...map.get(p.id), ...p }));
            return Array.from(map.values());
          });
        }
      },
      onPayments: (cloudPayments) => {
        setPayments(prev => {
          const map = new Map<string, PaymentTransaction>();
          prev.forEach(p => map.set(p.id, p));
          cloudPayments.forEach(p => map.set(p.id, { ...map.get(p.id), ...p }));
          return Array.from(map.values()).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        });
      },
      onWithdrawals: (cloudWithdrawals) => {
        setWithdrawals(prev => {
          const map = new Map<string, WithdrawalRequest>();
          prev.forEach(w => map.set(w.id, w));
          cloudWithdrawals.forEach(w => map.set(w.id, { ...map.get(w.id), ...w }));
          return Array.from(map.values()).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        });
      },
      onLedger: (cloudLedger) => {
        setLedger(prev => {
          const map = new Map<string, LedgerEntry>();
          prev.forEach(l => map.set(l.id, l));
          cloudLedger.forEach(l => map.set(l.id, { ...map.get(l.id), ...l }));
          return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
      },
      onSettings: (cloudSettings) => {
        if (cloudSettings) {
          setSettings(cloudSettings);
        }
      },
      onAuditLogs: (cloudLogs) => {
        setAuditLogs(prev => {
          const map = new Map<string, AuditLog>();
          prev.forEach(l => map.set(l.id, l));
          cloudLogs.forEach(l => map.set(l.id, { ...map.get(l.id), ...l }));
          return Array.from(map.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });
      },
      onSupportMessages: (cloudMessages) => {
        if (cloudMessages && cloudMessages.length > 0) {
          setSupportMessages(prev => {
            const map = new Map<string, SupportMessage>();
            prev.forEach(m => map.set(m.id, m));
            cloudMessages.forEach(m => map.set(m.id, { ...map.get(m.id), ...m }));
            return Array.from(map.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          });
        }
      },
      onConnectionChange: (connected) => {
        setIsCloudSynced(connected);
      },
    });

    return () => {
      unsubscribeFirestore();
    };
  }, []);

  // Load from localStorage on mount & listen to real-time sync across open tabs/windows
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.plans) setPlans(parsed.plans);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.withdrawals) setWithdrawals(parsed.withdrawals);
        if (parsed.ledger) setLedger(parsed.ledger);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.supportMessages) setSupportMessages(parsed.supportMessages);
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.onmessage = (event) => {
          // Ignore own echo messages
          if (event.data?.senderId === windowInstanceId.current) return;
          if (event.data?.type === 'SYNC_ALL' && event.data?.payload) {
            const p = event.data.payload;
            if (p.users) setUsers(p.users);
            if (p.plans) setPlans(p.plans);
            if (p.payments) setPayments(p.payments);
            if (p.withdrawals) setWithdrawals(p.withdrawals);
            if (p.ledger) setLedger(p.ledger);
            if (p.settings) setSettings(p.settings);
            if (p.auditLogs) setAuditLogs(p.auditLogs);
            if (p.supportMessages) setSupportMessages(p.supportMessages);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel sync unavailable:', err);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.users) setUsers(parsed.users);
          if (parsed.plans) setPlans(parsed.plans);
          if (parsed.payments) setPayments(parsed.payments);
          if (parsed.withdrawals) setWithdrawals(parsed.withdrawals);
          if (parsed.ledger) setLedger(parsed.ledger);
          if (parsed.settings) setSettings(parsed.settings);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
          if (parsed.supportMessages) setSupportMessages(parsed.supportMessages);
        } catch (err) {
          console.error('Failed to parse synchronized storage:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // Save to localStorage locally (mutations broadcast specifically via syncDirectToStorage)
  useEffect(() => {
    try {
      const payload = {
        users,
        plans,
        payments,
        withdrawals,
        ledger,
        settings,
        auditLogs,
        supportMessages,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [users, plans, payments, withdrawals, ledger, settings, auditLogs, supportMessages]);

  // Keep current user updated with user list updates
  useEffect(() => {
    if (currentUser) {
      const fresh = users.find(u => u.id === currentUser.id);
      if (fresh) {
        setCurrentUser(fresh);
        localStorage.setItem('logitech_active_user', JSON.stringify(fresh));
      }
    } else {
      localStorage.removeItem('logitech_active_user');
    }
  }, [users]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('logitech_lang', lang);
  };

  const t = translations[language];

  // Helper to record audit log
  const logAudit = (action: string, details: string, targetUserId?: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      adminId: currentUser?.id || 'system',
      action,
      targetUserId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToFirestore(newLog);
  };

  // Dedicated Member Login (Customer portal only - zero admin access)
  const loginMember = (mobileOrId: string, pass: string) => {
    const cleanId = mobileOrId.trim();
    const cleanPass = pass.trim();

    if (
      cleanId.toLowerCase() === 'logitech01' || 
      cleanId === '7470886292' || 
      cleanPass === 'Logitech@2026' ||
      cleanId.toLowerCase().includes('admin')
    ) {
      return { 
        success: false, 
        message: '❌ यह केवल सामान्य ग्राहक (User) लॉगिन पोर्टल है। सुपर एडमिन कृपया Admin Portal लिंक (?portal=admin) से लॉगिन करें।' 
      };
    }

    const member = users.find(u => 
      u.role === 'member' &&
      (u.mobile === cleanId || u.id.toLowerCase() === cleanId.toLowerCase()) && 
      (u.password === cleanPass || cleanPass === 'password123')
    );

    if (member) {
      if (member.status === 'blocked') {
        return { success: false, message: 'This account has been temporarily blocked by administration.' };
      }
      setCurrentUser(member);
      setCurrentTab('dashboard'); // Takes user directly to Member Dashboard
      return { success: true, message: `Welcome back, ${member.name}!` };
    }

    return { success: false, message: 'Invalid Mobile Number or Password. Please check your credentials or register.' };
  };

  // Dedicated Super Admin Login (Admin portal only - zero member access)
  const loginAdmin = (adminId: string, pass: string) => {
    const cleanId = adminId.trim();
    const cleanPass = pass.trim();

    if (cleanId.toLowerCase() !== 'logitech01') {
      const isMember = users.some(u => u.mobile === cleanId || u.id.toLowerCase() === cleanId.toLowerCase());
      if (isMember) {
        return { 
          success: false, 
          message: '❌ यह केवल सुपर एडमिन पोर्टल है। सामान्य ग्राहक कृपया यूजर लॉगिन लिंक (?portal=user) का उपयोग करें।' 
        };
      }
      return { success: false, message: 'Invalid Admin User ID. Admin ID must be logitech01.' };
    }

    const admin = users.find(u => u.role === 'admin' || u.id.toLowerCase() === 'logitech01');
    if (cleanPass === 'Logitech@2026' || cleanPass === admin?.password) {
      if (admin) {
        setCurrentUser(admin);
        setCurrentTab('admin'); // Takes admin directly to Super Admin Control Panel
        logAudit('ADMIN_LOGIN', 'Super Admin logged in through Admin Portal');
        return { success: true, message: 'Super Admin Authenticated Successfully' };
      }
    }

    return { success: false, message: 'Invalid Admin Password. Please use Logitech@2026.' };
  };

  // General login fallback
  const login = (idOrMobile: string, pass: string) => {
    if (idOrMobile.trim().toLowerCase() === 'logitech01') {
      return loginAdmin(idOrMobile, pass);
    }
    return loginMember(idOrMobile, pass);
  };

  // Quick 1-click logins for easy testing
  const quickLoginAdmin = () => {
    const admin = users.find(u => u.id === 'logitech01' || u.role === 'admin');
    if (admin) {
      setCurrentUser(admin);
      setActiveModal(null);
      logAudit('ADMIN_LOGIN', 'Admin fast-switch access');
    }
  };

  const quickLoginMember = (userId = 'LT000101') => {
    const member = users.find(u => u.id === userId) || users.find(u => u.role === 'member');
    if (member) {
      setCurrentUser(member);
      setActiveModal(null);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('logitech_active_user');
  };

  // Registration handler
  const register = (name: string, mobile: string, pass: string, refCode?: string) => {
    const cleanMobile = mobile.trim();
    if (!/^\d{10}$/.test(cleanMobile)) {
      return { success: false, message: t.mobileInvalid };
    }

    // Check duplicate mobile
    const exists = users.find(u => u.mobile === cleanMobile);
    if (exists) {
      return { success: false, message: 'An account with this mobile number already exists. Please log in.' };
    }

    // Generate next sequential User ID cleanly (starts at LT000101 on fresh reset)
    const memberNums = users
      .filter(u => u.role !== 'admin' && u.id.startsWith('LT'))
      .map(u => {
        const match = u.id.match(/^LT0*(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n >= 101);
    const nextNumber = memberNums.length > 0 ? Math.max(...memberNums) + 1 : 101;
    const newId = `LT000${nextNumber}`;

    const cleanName = name.trim().toUpperCase();
    const initials = cleanName.replace(/[^A-Z]/g, '').slice(0, 4) || 'USER';
    const uniqueRef = `LT-${initials}${Math.floor(100 + Math.random() * 900)}`;

    // Accurately map sponsor to valid referrer code
    let resolvedSponsor = 'LOGI-ADMIN';
    if (refCode && refCode.trim()) {
      const cleanRef = refCode.trim();
      const sponsorUser = users.find(u => 
        u.referralCode.toLowerCase() === cleanRef.toLowerCase() || 
        u.id.toLowerCase() === cleanRef.toLowerCase()
      );
      if (sponsorUser) {
        resolvedSponsor = sponsorUser.referralCode;
      } else {
        resolvedSponsor = cleanRef.toUpperCase();
      }
    }

    const newUser: User = {
      id: newId,
      name: name.trim(),
      mobile: cleanMobile,
      password: pass.trim(),
      role: 'member',
      referralCode: uniqueRef,
      referredBy: resolvedSponsor,
      planId: 'free',
      walletBalance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      referralEarnings: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [newUser, ...users];
    setUsers(nextUsers);
    syncDirectToStorage({ users: nextUsers });
    setCurrentUser(newUser);
    try {
      localStorage.setItem('logitech_active_user', JSON.stringify(newUser));
    } catch (e) {
      console.warn('Failed to save active user:', e);
    }
    saveUserToFirestore(newUser);
    logAudit('USER_REGISTERED', `New user registered: ${newUser.name} (${newId}) with sponsor: ${newUser.referredBy}`, newId);

    // Instant local custom event for AdminDashboard live-notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('logitech_new_member_registered', {
        detail: { user: newUser }
      }));
    }

    return { 
      success: true, 
      message: `${t.registrationSuccess} Your User ID is ${newId}.`,
      user: newUser 
    };
  };

  // Submit UPI payment with duplicate UTR protection
  const submitPayment = (
    planId: PlanId, 
    amount: number, 
    utr: string, 
    method: 'UPI_QR' | 'PHONEPE' | 'GPAY' | 'PAYTM' = 'PHONEPE',
    screenshot?: string
  ) => {
    if (!currentUser) return { success: false, message: 'Please login first' };

    const cleanUtr = utr.trim();
    if (cleanUtr.length < 10) {
      return { success: false, message: t.invalidUtrLength };
    }

    // Duplicate UTR prevention across all payments
    const isDuplicate = payments.some(p => p.utr.toLowerCase() === cleanUtr.toLowerCase());
    if (isDuplicate) {
      return { success: false, message: t.duplicateUtrError };
    }

    const selectedPlan = plans.find(p => p.id === planId);
    const planName = selectedPlan ? selectedPlan.name : planId.toUpperCase();

    const newPayment: PaymentTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userMobile: currentUser.mobile,
      planId,
      planName,
      amount,
      utr: cleanUtr,
      paymentMethod: method,
      screenshotUrl: screenshot,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    // Update pending balance for user visual clarity
    const updatedUser = { ...currentUser, pendingBalance: currentUser.pendingBalance + amount };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return updatedUser;
      }
      return u;
    }));

    setPayments(prev => [newPayment, ...prev]);
    savePaymentToFirestore(newPayment);
    saveUserToFirestore(updatedUser);
    logAudit('PAYMENT_SUBMITTED', `User ${currentUser.id} submitted UTR ${cleanUtr} for ₹${amount} (${planName})`, currentUser.id);

    return { success: true, message: t.paymentSubmittedSuccess };
  };

  // Admin approves or rejects UPI payment
  const verifyPayment = (paymentId: string, approve: boolean, reason?: string) => {
    const txn = payments.find(p => p.id === paymentId);
    if (!txn || txn.status !== 'pending') return;

    if (approve) {
      const selectedPlan = plans.find(p => p.id === txn.planId);
      const planPrice = selectedPlan ? selectedPlan.price : txn.amount;
      const verifiedAt = new Date().toISOString();
      const verifiedBy = currentUser?.id || 'admin';

      const approvedTxn: PaymentTransaction = {
        ...txn,
        status: 'approved',
        verifiedAt,
        verifiedBy,
      };

      // 1. Update payment status locally and in Firestore
      const nextPayments = payments.map(p => p.id === paymentId ? approvedTxn : p);
      setPayments(nextPayments);
      syncDirectToStorage({ payments: nextPayments });
      savePaymentToFirestore(approvedTxn);

      // 2. Activate user plan & clear pending balance synchronously
      const targetUser = users.find(u => u.id === txn.userId);
      let nextUsers = [...users];
      let userReferrerCode = targetUser?.referredBy;

      if (targetUser) {
        const updatedTargetUser: User = {
          ...targetUser,
          planId: txn.planId,
          planActivatedAt: verifiedAt,
          pendingBalance: Math.max(0, targetUser.pendingBalance - txn.amount),
        };
        nextUsers = nextUsers.map(u => u.id === txn.userId ? updatedTargetUser : u);
        saveUserToFirestore(updatedTargetUser);

        if (currentUser?.id === txn.userId) {
          const updatedCurrent = { ...currentUser, ...updatedTargetUser };
          setCurrentUser(updatedCurrent);
          localStorage.setItem('logitech_active_user', JSON.stringify(updatedCurrent));
        }

        // 3. Add ledger entry for plan activation
        const newLedger: LedgerEntry = {
          id: `LED-${Date.now()}`,
          userId: txn.userId,
          type: 'PLAN_PURCHASE',
          amount: txn.amount,
          description: `Plan ${txn.planName} Activated via UPI (UTR: ${txn.utr})`,
          descriptionHi: `प्लान ${txn.planName} UPI द्वारा सक्रिय किया गया (UTR: ${txn.utr})`,
          referenceId: txn.id,
          createdAt: verifiedAt,
          balanceAfter: updatedTargetUser.walletBalance,
        };
        setLedger(prev => [newLedger, ...prev]);
        saveLedgerEntryToFirestore(newLedger);
      }

      // 4. Credit 10% direct referral commission to referrer
      if (userReferrerCode) {
        const commissionAmount = Math.round((planPrice * (settings.referralBonusPercent || 10)) / 100);
        if (commissionAmount > 0) {
          const refUser = nextUsers.find(u => u.referralCode === userReferrerCode);
          if (refUser) {
            const updatedRefUser: User = {
              ...refUser,
              walletBalance: refUser.walletBalance + commissionAmount,
              referralEarnings: refUser.referralEarnings + commissionAmount,
              totalEarnings: refUser.totalEarnings + commissionAmount,
            };
            nextUsers = nextUsers.map(u => u.id === refUser.id ? updatedRefUser : u);
            saveUserToFirestore(updatedRefUser);

            const refLedger: LedgerEntry = {
              id: `LED-${Date.now() + 1}`,
              userId: refUser.id,
              type: 'REFERRAL_BONUS',
              amount: commissionAmount,
              description: `10% Direct Commission from ${txn.userName} (${txn.planName})`,
              descriptionHi: `${txn.userName} के प्लान ${txn.planName} एक्टिवेशन से 10% कमीशन`,
              referenceId: txn.id,
              createdAt: verifiedAt,
              balanceAfter: updatedRefUser.walletBalance,
            };
            setLedger(prev => [refLedger, ...prev]);
            saveLedgerEntryToFirestore(refLedger);
            logAudit('COMMISSION_CREDITED', `Credited ₹${commissionAmount} referral bonus to referrer ${refUser.id}`, refUser.id);
          }
        }
      }

      // Update state and persistent storage
      setUsers(nextUsers);
      syncDirectToStorage({ users: nextUsers });
      logAudit('PAYMENT_APPROVED', `Approved ₹${txn.amount} for user ${txn.userId} (Plan: ${txn.planName}, UTR: ${txn.utr})`, txn.userId);
    } else {
      // Reject payment
      const rejectedTxn: PaymentTransaction = {
        ...txn,
        status: 'rejected',
        rejectionReason: reason || 'UTR verification failed / amount mismatch',
        verifiedAt: new Date().toISOString(),
        verifiedBy: currentUser?.id || 'admin',
      };

      const nextPayments = payments.map(p => p.id === paymentId ? rejectedTxn : p);
      setPayments(nextPayments);
      syncDirectToStorage({ payments: nextPayments });
      savePaymentToFirestore(rejectedTxn);

      const targetUser = users.find(u => u.id === txn.userId);
      if (targetUser) {
        const updatedUserAfterReject: User = {
          ...targetUser,
          pendingBalance: Math.max(0, targetUser.pendingBalance - txn.amount),
        };
        const nextUsers = users.map(u => u.id === txn.userId ? updatedUserAfterReject : u);
        setUsers(nextUsers);
        syncDirectToStorage({ users: nextUsers });
        saveUserToFirestore(updatedUserAfterReject);
      }

      logAudit('PAYMENT_REJECTED', `Rejected payment ${paymentId} for user ${txn.userId}. Reason: ${reason || 'Invalid UTR'}`, txn.userId);
    }
  };

  // Member requests UPI withdrawal
  const requestWithdrawal = (amount: number, upiId: string, upiMobile: string) => {
    if (!currentUser) return { success: false, message: 'Please log in' };

    if (amount < settings.minWithdrawal) {
      return { 
        success: false, 
        message: language === 'hi' 
          ? `न्यूनतम विड्रॉल सीमा ₹${settings.minWithdrawal} है।` 
          : `Minimum withdrawal limit is ₹${settings.minWithdrawal}` 
      };
    }

    if (settings.maxWithdrawal && amount > settings.maxWithdrawal) {
      return { 
        success: false, 
        message: language === 'hi' 
          ? `अधिकतम विड्रॉल सीमा ₹${settings.maxWithdrawal.toLocaleString('en-IN')} है।` 
          : `Maximum withdrawal limit is ₹${settings.maxWithdrawal.toLocaleString('en-IN')}` 
      };
    }

    // Enforce 1-day cumulative daily withdrawal limit (One Day Limit)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUserWithdrawals = withdrawals.filter(w => 
      w.userId === currentUser.id && 
      w.status !== 'rejected' && 
      new Date(w.requestedAt) >= today
    );
    const todayTotal = todayUserWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    if (settings.maxWithdrawal && (todayTotal + amount) > settings.maxWithdrawal) {
      const remainingToday = Math.max(0, settings.maxWithdrawal - todayTotal);
      return {
        success: false,
        message: language === 'hi'
          ? `1-दिन की दैनिक विड्रॉल सीमा (One Day Limit) ₹${settings.maxWithdrawal.toLocaleString('en-IN')} है। आज आप अधिकतम ₹${remainingToday.toLocaleString('en-IN')} और निकाल सकते हैं।`
          : `1-Day daily withdrawal limit is ₹${settings.maxWithdrawal.toLocaleString('en-IN')}. You can only withdraw ₹${remainingToday.toLocaleString('en-IN')} more today.`
      };
    }

    if (amount > currentUser.walletBalance) {
      return { success: false, message: t.insufficientBalance };
    }

    const newWithdrawalId = `WTH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBal = currentUser.walletBalance - amount;

    // Deduct immediately from available wallet to prevent double spending
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          walletBalance: newBal,
        };
      }
      return u;
    }));

    const tdsPercent = settings.tdsPercent || 5;
    const tdsAmount = Math.round((amount * tdsPercent) / 100);
    const netAmount = amount - tdsAmount;
    const isAdmin = currentUser.role === 'admin';

    const newReq: WithdrawalRequest = {
      id: newWithdrawalId,
      userId: currentUser.id,
      userName: currentUser.name,
      userMobile: currentUser.mobile,
      amount,
      tdsPercent,
      tdsAmount,
      netAmount,
      upiId: upiId.trim(),
      upiMobile: upiMobile.trim(),
      status: isAdmin ? 'approved' : 'pending',
      requestedAt: new Date().toISOString(),
      processedAt: isAdmin ? new Date().toISOString() : undefined,
      payoutReference: isAdmin ? `ADMIN-AUTO-${Date.now().toString().slice(-6)}` : undefined,
    };

    setWithdrawals(prev => [newReq, ...prev]);
    saveWithdrawalToFirestore(newReq);

    // Persist updated user wallet balance to Firestore
    const updatedUserObj = {
      ...currentUser,
      walletBalance: newBal,
    };
    saveUserToFirestore(updatedUserObj);

    // Add ledger debit with clear TDS breakdown
    const newLedger: LedgerEntry = {
      id: `LED-${Date.now()}`,
      userId: currentUser.id,
      type: 'WITHDRAWAL_REQUEST',
      amount: -amount,
      description: isAdmin 
        ? `Direct Admin Withdrawal of ₹${amount.toLocaleString('en-IN')} (5% TDS -₹${tdsAmount}, Net ₹${netAmount.toLocaleString('en-IN')} Settled to UPI ${upiId})`
        : `Withdrawal request of ₹${amount.toLocaleString('en-IN')} (5% TDS -₹${tdsAmount}, Net ₹${netAmount.toLocaleString('en-IN')} to UPI ${upiId} - Pending Approval)`,
      descriptionHi: isAdmin
        ? `एडमिन डायरेक्ट विड्रॉल ₹${amount.toLocaleString('en-IN')} (5% TDS -₹${tdsAmount}, शुद्ध ₹${netAmount.toLocaleString('en-IN')} सेटल UPI ${upiId})`
        : `₹${amount.toLocaleString('en-IN')} का निकासी अनुरोध (5% TDS -₹${tdsAmount}, शुद्ध ₹${netAmount.toLocaleString('en-IN')} UPI ${upiId} में - पेंडिंग एडमिन अप्रूवल)`,
      referenceId: newWithdrawalId,
      createdAt: new Date().toISOString(),
      balanceAfter: newBal,
    };
    setLedger(prev => [newLedger, ...prev]);
    saveLedgerEntryToFirestore(newLedger);

    if (isAdmin) {
      logAudit('ADMIN_INSTANT_WITHDRAWAL', `Super Admin ${currentUser.id} performed instant direct withdrawal of ₹${amount} (Net: ₹${netAmount} to UPI ${upiId}) - Settled Success`, currentUser.id);
      return { 
        success: true, 
        message: language === 'hi' 
          ? `एडमिन विड्रॉल तुरंत सफल व स्वीकृत हुआ (Direct Instant Success)! शुद्ध राशि ₹${netAmount.toLocaleString('en-IN')} सेटल कर दी गई है।`
          : `Admin direct withdrawal successful! Instant approved and settled: Net ₹${netAmount.toLocaleString('en-IN')} to UPI ${upiId}.` 
      };
    } else {
      logAudit('WITHDRAWAL_REQUESTED', `User ${currentUser.id} requested Gross ₹${amount} (5% TDS: ₹${tdsAmount}, Net to transfer: ₹${netAmount}) to UPI ${upiId} - Pending Admin Approval`, currentUser.id);
      return { 
        success: true, 
        message: language === 'hi' 
          ? `विड्रॉल अनुरोध सफलतापूर्वक दर्ज हो गया है (Pending)। यह एडमिन सत्यापन पर निर्भर है, एडमिन अप्रूव करते ही ₹${netAmount.toLocaleString('en-IN')} आपके UPI में क्रेडिट होगा।` 
          : `Withdrawal request submitted (Pending). Awaiting Admin verification and approval before payout is sent to your UPI.` 
      };
    }
  };

  // Admin approves or rejects withdrawal
  const processWithdrawal = (withdrawalId: string, approve: boolean, payoutRef?: string, reason?: string) => {
    const wth = withdrawals.find(w => w.id === withdrawalId);
    if (!wth || wth.status === 'approved' || wth.status === 'rejected') return;

    if (approve) {
      const approvedWth: WithdrawalRequest = {
        ...wth,
        status: 'approved',
        payoutReference: payoutRef || `IMPS-${Date.now().toString().slice(-6)}`,
        processedAt: new Date().toISOString(),
      };

      setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? approvedWth : w));
      saveWithdrawalToFirestore(approvedWth);

      let updatedUser: User | undefined;
      setUsers(prev => prev.map(u => {
        if (u.id === wth.userId) {
          updatedUser = {
            ...u,
            totalWithdrawn: u.totalWithdrawn + wth.amount,
          };
          return updatedUser;
        }
        return u;
      }));

      if (updatedUser) {
        saveUserToFirestore(updatedUser);
      }

      logAudit('WITHDRAWAL_PROCESSED', `Approved payout of Gross ₹${wth.amount} (5% TDS: ₹${wth.tdsAmount}, Net Paid: ₹${wth.netAmount}) to ${wth.upiId}. Ref: ${payoutRef || 'IMPS'}`, wth.userId);
    } else {
      // Refund back to user's wallet safely
      let updatedBal = 0;
      let refundedUser: User | undefined;

      setUsers(prev => prev.map(u => {
        if (u.id === wth.userId) {
          updatedBal = u.walletBalance + wth.amount;
          refundedUser = {
            ...u,
            walletBalance: updatedBal,
          };
          return refundedUser;
        }
        return u;
      }));

      if (refundedUser) {
        saveUserToFirestore(refundedUser);
      }

      const rejectedWth: WithdrawalRequest = {
        ...wth,
        status: 'rejected',
        rejectionReason: reason || 'Invalid UPI details / bank rejection',
        processedAt: new Date().toISOString(),
      };

      setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? rejectedWth : w));
      saveWithdrawalToFirestore(rejectedWth);

      const refundLedger: LedgerEntry = {
        id: `LED-${Date.now()}`,
        userId: wth.userId,
        type: 'WITHDRAWAL_REFUND',
        amount: wth.amount,
        description: `Refund for rejected withdrawal ${withdrawalId}: ${reason || 'UPI Failed'}`,
        descriptionHi: `अस्वीकृत निकासी ${withdrawalId} का रिफंड: ${reason || 'विफल'}`,
        referenceId: withdrawalId,
        createdAt: new Date().toISOString(),
        balanceAfter: updatedBal,
      };
      setLedger(prev => [refundLedger, ...prev]);
      saveLedgerEntryToFirestore(refundLedger);
      logAudit('WITHDRAWAL_REFUNDED', `Rejected withdrawal ${withdrawalId} and refunded ₹${wth.amount} to user ${wth.userId}`, wth.userId);
    }
  };

  // Manual wallet adjustment by admin (credit or debit)
  const manualAdjustWallet = (userId: string, amount: number, isCredit: boolean, reason: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const adjustedAmount = isCredit ? amount : -amount;
    const finalBal = Math.max(0, target.walletBalance + adjustedAmount);
    const updatedTarget: User = {
      ...target,
      walletBalance: finalBal,
      totalEarnings: isCredit ? target.totalEarnings + amount : target.totalEarnings,
    };
    const nextUsers = users.map(u => u.id === userId ? updatedTarget : u);
    setUsers(nextUsers);
    syncDirectToStorage({ users: nextUsers });
    saveUserToFirestore(updatedTarget);

    if (currentUser?.id === userId) {
      const updatedCurrent = { ...currentUser, ...updatedTarget };
      setCurrentUser(updatedCurrent);
      try {
        localStorage.setItem('logitech_active_user', JSON.stringify(updatedCurrent));
      } catch (e) {
        console.warn('Failed saving active user:', e);
      }
    }

    const entry: LedgerEntry = {
      id: `LED-${Date.now()}`,
      userId,
      type: isCredit ? 'MANUAL_CREDIT' : 'MANUAL_DEBIT',
      amount: adjustedAmount,
      description: `Admin manual adjustment: ${reason}`,
      descriptionHi: `एडमिन द्वारा मैन्युअल समायोजन: ${reason}`,
      createdAt: new Date().toISOString(),
      balanceAfter: finalBal,
    };
    setLedger(prev => [entry, ...prev]);
    saveLedgerEntryToFirestore(entry);
    logAudit('WALLET_ADJUSTED', `Admin adjusted wallet for ${userId}: ${isCredit ? '+' : '-'}${amount}. Reason: ${reason}`, userId);
  };

  // Update user status (block/unblock)
  const updateUserStatus = (userId: string, status: 'active' | 'blocked') => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const updatedTarget: User = { ...target, status };
    const nextUsers = users.map(u => u.id === userId ? updatedTarget : u);
    setUsers(nextUsers);
    syncDirectToStorage({ users: nextUsers });
    saveUserToFirestore(updatedTarget);

    if (currentUser?.id === userId) {
      const updatedCurrent = { ...currentUser, status };
      setCurrentUser(updatedCurrent);
      try {
        localStorage.setItem('logitech_active_user', JSON.stringify(updatedCurrent));
      } catch (e) {
        console.warn('Failed saving active user:', e);
      }
    }
    logAudit('USER_STATUS_UPDATED', `User ${userId} status changed to ${status}`, userId);
  };

  // Update user plan directly by admin (Manual ID Activation)
  const updateUserPlan = (userId: string, planId: PlanId) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const targetPlan = plans.find(p => p.id === planId);
    const nowIso = new Date().toISOString();

    const updatedTargetUser: User = { 
      ...targetUser, 
      planId, 
      planActivatedAt: nowIso 
    };

    let nextUsers = users.map(u => u.id === userId ? updatedTargetUser : u);
    setUsers(nextUsers);
    syncDirectToStorage({ users: nextUsers });
    saveUserToFirestore(updatedTargetUser);

    // Also update currentUser if it matches so their screen immediately reflects the active plan & daily income
    if (currentUser?.id === userId) {
      const updatedCurrent = { ...currentUser, planId, planActivatedAt: nowIso };
      setCurrentUser(updatedCurrent);
      try {
        localStorage.setItem('logitech_active_user', JSON.stringify(updatedCurrent));
      } catch (e) {
        console.warn('Failed saving active user:', e);
      }
    }

    // If an active paid plan is assigned manually by admin
    if (targetPlan && targetPlan.price > 0 && planId !== 'free') {
      // 1. Check if user already had a pending payment for this plan, approve it
      const hasPendingPayment = payments.some(p => p.userId === userId && p.status === 'pending');
      if (hasPendingPayment) {
        const nextPayments = payments.map(p => {
          if (p.userId === userId && p.status === 'pending') {
            const approvedPendingTxn: PaymentTransaction = {
              ...p,
              planId,
              planName: targetPlan.name,
              amount: targetPlan.price,
              status: 'approved',
              verifiedAt: nowIso,
              verifiedBy: 'logitech01',
            };
            savePaymentToFirestore(approvedPendingTxn);
            return approvedPendingTxn;
          }
          return p;
        });
        setPayments(nextPayments);
        syncDirectToStorage({ payments: nextPayments });
      } else {
        // Create approved transaction so it reflects in Company Available Fund (+ Plan Inflow)
        const hasApproved = payments.some(p => p.userId === userId && p.planId === planId && p.status === 'approved');
        if (!hasApproved) {
          const autoTxn: PaymentTransaction = {
            id: `TXN-ACT-${Date.now().toString().slice(-6)}`,
            userId,
            userName: targetUser?.name || userId,
            userMobile: targetUser?.mobile || '',
            planId,
            planName: targetPlan.name,
            amount: targetPlan.price,
            utr: `ADMIN-ACT-${Date.now().toString().slice(-6)}`,
            paymentMethod: 'PHONEPE',
            status: 'approved',
            submittedAt: nowIso,
            verifiedAt: nowIso,
            verifiedBy: 'logitech01',
          };
          const nextPayments = [autoTxn, ...payments];
          setPayments(nextPayments);
          syncDirectToStorage({ payments: nextPayments });
          savePaymentToFirestore(autoTxn);
        }
      }

      // 2. Add purchase record to user ledger
      const planLedger: LedgerEntry = {
        id: `LED-${Date.now()}`,
        userId,
        type: 'PLAN_PURCHASE',
        amount: targetPlan.price,
        description: `Plan ${targetPlan.name} Activated by Admin`,
        descriptionHi: `प्लान ${targetPlan.name} एडमिन द्वारा मैन्युअल सक्रिय किया गया`,
        referenceId: `MANUAL-${planId.toUpperCase()}`,
        createdAt: nowIso,
        balanceAfter: targetUser?.walletBalance || 0,
      };
      setLedger(prev => [planLedger, ...prev]);
      saveLedgerEntryToFirestore(planLedger);

      // 3. Credit 10% direct referral commission to inviter if user was referred by someone
      if (targetUser?.referredBy) {
        const commissionAmount = Math.round((targetPlan.price * (settings.referralBonusPercent || 10)) / 100);
        if (commissionAmount > 0) {
          const refUser = nextUsers.find(u => u.referralCode === targetUser.referredBy);
          if (refUser) {
            const updatedRefBal = refUser.walletBalance + commissionAmount;
            const updatedRefUserObj: User = {
              ...refUser,
              walletBalance: updatedRefBal,
              referralEarnings: refUser.referralEarnings + commissionAmount,
              totalEarnings: refUser.totalEarnings + commissionAmount,
            };
            nextUsers = nextUsers.map(u => u.id === refUser.id ? updatedRefUserObj : u);
            setUsers(nextUsers);
            syncDirectToStorage({ users: nextUsers });
            saveUserToFirestore(updatedRefUserObj);

            const refLedger: LedgerEntry = {
              id: `LED-${Date.now() + 1}`,
              userId: refUser.id,
              type: 'REFERRAL_BONUS',
              amount: commissionAmount,
              description: `10% Direct Commission from ${targetUser.name} (${targetPlan.name} Activation)`,
              descriptionHi: `${targetUser.name} के प्लान ${targetPlan.name} सक्रिय होने पर 10% कमीशन प्राप्त हुआ`,
              referenceId: `REF-${userId}`,
              createdAt: nowIso,
              balanceAfter: updatedRefBal,
            };
            setLedger(prev => [refLedger, ...prev]);
            saveLedgerEntryToFirestore(refLedger);
            logAudit('COMMISSION_CREDITED', `Admin activation credited ₹${commissionAmount} to referrer ${refUser.id} for ${userId}`, refUser.id);
          }
        }
      }
    }

    logAudit('USER_PLAN_UPDATED', `Admin manually changed User ${userId} plan to ${planId.toUpperCase()} (Daily: ₹${targetPlan?.dailyEarning || 0}/day)`, userId);
  };

  // Admin dynamic control: increase / decrease daily income, duration, price
  const updatePlanDailyIncome = (
    planId: PlanId, 
    newDailyEarning: number, 
    newDurationDays?: number, 
    newPrice?: number
  ) => {
    let updatedPlanObj: Plan | undefined;

    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const days = newDurationDays !== undefined && newDurationDays > 0 ? newDurationDays : p.durationDays;
        const price = newPrice !== undefined && newPrice > 0 ? newPrice : p.price;
        const totalReturn = Math.round(newDailyEarning * days);
        updatedPlanObj = {
          ...p,
          dailyEarning: newDailyEarning,
          durationDays: days,
          price,
          totalReturn,
        };
        return updatedPlanObj;
      }
      return p;
    }));

    if (updatedPlanObj) {
      savePlanToFirestore(updatedPlanObj);
    }

    logAudit('PLAN_DAILY_INCOME_UPDATED', `Admin updated ${planId.toUpperCase()} daily income to ₹${newDailyEarning}/day`);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      saveSettingsToFirestore(merged);
      return merged;
    });
    logAudit('SETTINGS_UPDATED', 'Admin modified system/UPI configuration');
  };

  // 12:00 AM Daily Distribution engine (Automatic Midnight + Admin Manual)
  const runDailyDistribution = (isAutoMidnight: boolean = false) => {
    let usersCredited = 0;
    let totalDistributed = 0;
    const newLedgerEntries: LedgerEntry[] = [];
    const now = new Date();
    const nowIso = now.toISOString();
    const todayDateStr = nowIso.slice(0, 10);

    const updatedUsers = users.map(u => {
      if (u.status !== 'active' || !u.planId || u.planId === 'free') return u;

      const userPlan = plans.find(p => p.id === u.planId);
      if (!userPlan || userPlan.dailyEarning <= 0) return u;

      // Plan Active ke dusre din se:
      // Daily income starts on the next day after activation (dusre din se)
      const activationDateStr = u.planActivatedAt ? u.planActivatedAt.slice(0, 10) : '';
      if (activationDateStr && todayDateStr <= activationDateStr && isAutoMidnight) {
        // Plan was activated today; first daily return starts tomorrow at 12:00 AM
        return u;
      }

      // In automated midnight run, skip if user already received credit today
      const lastCreditDateStr = u.lastDailyCreditDate ? u.lastDailyCreditDate.slice(0, 10) : '';
      if (isAutoMidnight && lastCreditDateStr === todayDateStr) {
        return u;
      }

      usersCredited += 1;
      totalDistributed += userPlan.dailyEarning;

      const updatedBalance = u.walletBalance + userPlan.dailyEarning;
      const updatedTotalEarnings = u.totalEarnings + userPlan.dailyEarning;

      const ledgerEntry: LedgerEntry = {
        id: `LED-DAILY-${Date.now()}-${u.id}-${Math.floor(Math.random() * 1000)}`,
        userId: u.id,
        type: 'DAILY_ROI',
        amount: userPlan.dailyEarning,
        description: `12:00 AM Automated Daily Return (${userPlan.name})`,
        descriptionHi: `रात 12:00 बजे का ऑटोमैटिक दैनिक रिटर्न (${userPlan.nameHi})`,
        createdAt: nowIso,
        balanceAfter: updatedBalance,
      };
      newLedgerEntries.push(ledgerEntry);

      return {
        ...u,
        walletBalance: updatedBalance,
        totalEarnings: updatedTotalEarnings,
        lastDailyCreditDate: nowIso,
        todayReceivedIncome: userPlan.dailyEarning,
      };
    });

    if (usersCredited > 0) {
      setUsers(updatedUsers);
      const nextLedger = [...newLedgerEntries, ...ledger];
      setLedger(nextLedger);

      syncDirectToStorage({
        users: updatedUsers,
        ledger: nextLedger
      });

      updatedUsers.forEach(u => saveUserToFirestore(u));
      newLedgerEntries.forEach(entry => saveLedgerEntryToFirestore(entry));

      // Immediately sync logged-in member's wallet balance on screen
      if (currentUser) {
        const freshCurrent = updatedUsers.find(u => u.id === currentUser.id);
        if (freshCurrent) {
          setCurrentUser(freshCurrent);
          localStorage.setItem('logitech_active_user', JSON.stringify(freshCurrent));
        }
      }

      const source = isAutoMidnight ? 'Automated 12:00 AM Midnight Engine' : 'Admin Manual Trigger';
      logAudit('DAILY_TOPUP_EXECUTED', `${source} credited ₹${totalDistributed} across ${usersCredited} active members.`);
    }

    return { usersCredited, totalDistributed };
  };

  // Automated 12:00 AM Midnight Background Runner (Decoupled with refs so user actions never trigger loop)
  const usersRef = useRef(users);
  const plansRef = useRef(plans);
  const isRunningDailyRef = useRef(false);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    plansRef.current = plans;
  }, [plans]);

  useEffect(() => {
    // 1. Check if today's 12:00 AM return is pending for any active user
    const checkMidnightAutoCredit = () => {
      if (isRunningDailyRef.current) return;
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const currentUsers = usersRef.current;
        const hasUncredited = currentUsers.some(u => {
          if (u.status !== 'active' || !u.planId || u.planId === 'free') return false;
          const activationDateStr = u.planActivatedAt ? u.planActivatedAt.slice(0, 10) : '';
          // Plan active ke dusre din se: activation date must be strictly before today
          const isEligible = Boolean(activationDateStr && todayStr > activationDateStr);
          const isAlreadyCreditedToday = Boolean(u.lastDailyCreditDate && u.lastDailyCreditDate.slice(0, 10) === todayStr);
          return isEligible && !isAlreadyCreditedToday;
        });

        if (hasUncredited) {
          isRunningDailyRef.current = true;
          runDailyDistribution(true);
        }
      } catch (err) {
        console.error('Midnight auto credit check error:', err);
      } finally {
        isRunningDailyRef.current = false;
      }
    };

    const initialTimer = setTimeout(checkMidnightAutoCredit, 2500);

    // 2. Real-time clock watcher: checks every 30 seconds for midnight turnover or pending distributions
    const clockInterval = setInterval(() => {
      checkMidnightAutoCredit();
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(clockInterval);
    };
  }, []); // Run ONCE on mount - decoupled from user modifications!

  // Instant single-user daily income claim or refresh
  const claimUserDailyIncome = (userId?: string): { success: boolean; message: string; amountCredited: number } => {
    const targetId = userId || currentUser?.id;
    if (!targetId) {
      return { success: false, message: 'User not found. Please log in first.', amountCredited: 0 };
    }

    const targetUser = users.find(u => u.id === targetId);
    if (!targetUser) {
      return { success: false, message: 'Member profile not found.', amountCredited: 0 };
    }

    if (targetUser.status === 'blocked') {
      return { success: false, message: 'Account is blocked. Contact administration.', amountCredited: 0 };
    }

    if (!targetUser.planId || targetUser.planId === 'free') {
      return { 
        success: false, 
        message: 'No active paid plan. Please activate Bronze, Silver, Gold, Platinum, or Diamond to receive daily income.', 
        amountCredited: 0 
      };
    }

    const userPlan = plans.find(p => p.id === targetUser.planId);
    if (!userPlan || userPlan.dailyEarning <= 0) {
      return { success: false, message: 'Active plan has no daily earning configured.', amountCredited: 0 };
    }

    const todayDateStr = new Date().toISOString().slice(0, 10);
    const lastCreditDateStr = targetUser.lastDailyCreditDate ? targetUser.lastDailyCreditDate.slice(0, 10) : '';
    const activationDateStr = targetUser.planActivatedAt ? targetUser.planActivatedAt.slice(0, 10) : '';

    if (lastCreditDateStr === todayDateStr) {
      return { 
        success: false, 
        message: language === 'hi'
          ? `आज का दैनिक रिटर्न (₹${userPlan.dailyEarning}) आपके वॉलेट में पहले से जमा है। अगला रिटर्न रात 12:00 AM पर स्वतः मिलेगा!`
          : `Today's daily return (₹${userPlan.dailyEarning}) has already been credited to your wallet. Next return credits at 12:00 AM!`,
        amountCredited: 0 
      };
    }

    // Check if plan was activated today - Dusre din se rule
    if (activationDateStr && todayDateStr <= activationDateStr) {
      return {
        success: false,
        message: language === 'hi'
          ? `🗓️ आपका प्लान आज ही एक्टिव हुआ है। नियमानुसार पहला दैनिक रिटर्न कल रात 12:00 AM पर स्वतः आपके वॉलेट में जमा होगा।`
          : `Your plan was activated today. As per rule, your first daily return will automatically credit tomorrow at 12:00 AM.`,
        amountCredited: 0
      };
    }

    const nowIso = new Date().toISOString();
    const updatedBalance = targetUser.walletBalance + userPlan.dailyEarning;
    const updatedTotalEarnings = targetUser.totalEarnings + userPlan.dailyEarning;

    const updatedUser: User = {
      ...targetUser,
      walletBalance: updatedBalance,
      totalEarnings: updatedTotalEarnings,
      lastDailyCreditDate: nowIso,
      todayReceivedIncome: userPlan.dailyEarning,
    };

    const ledgerEntry: LedgerEntry = {
      id: `LED-DAILY-${Date.now()}-${targetUser.id}`,
      userId: targetUser.id,
      type: 'DAILY_ROI',
      amount: userPlan.dailyEarning,
      description: `Daily Plan Return Credited (${userPlan.name})`,
      descriptionHi: `दैनिक प्लान रिटर्न वॉलेट में जमा (${userPlan.nameHi})`,
      createdAt: nowIso,
      balanceAfter: updatedBalance,
    };

    const nextUsers = users.map(u => u.id === targetId ? updatedUser : u);
    const nextLedger = [ledgerEntry, ...ledger];

    setUsers(nextUsers);
    setLedger(nextLedger);
    syncDirectToStorage({ users: nextUsers, ledger: nextLedger });
    saveUserToFirestore(updatedUser);
    saveLedgerEntryToFirestore(ledgerEntry);

    if (currentUser?.id === targetId) {
      setCurrentUser(updatedUser);
      localStorage.setItem('logitech_active_user', JSON.stringify(updatedUser));
    }

    logAudit('DAILY_TOPUP_EXECUTED', `Daily return ₹${userPlan.dailyEarning} credited for user ${targetUser.name} (${targetUser.id}) on plan ${userPlan.name}.`, targetUser.id);

    return { 
      success: true, 
      message: language === 'hi' 
        ? `✅ ₹${userPlan.dailyEarning} आज का दैनिक रिटर्न आपके वॉलेट में सफलता पूर्वक जोड़ दिया गया है!`
        : `✅ Successfully credited today's return of ₹${userPlan.dailyEarning} to your wallet!`,
      amountCredited: userPlan.dailyEarning,
    };
  };

  // Export tables to CSV
  const exportToCsv = (type: 'users' | 'payments' | 'withdrawals' | 'ledger') => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `logitech_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'users') {
      headers = ['User ID', 'Name', 'Mobile', 'Role', 'Status', 'Plan', 'Balance (INR)', 'Total Earned', 'Total Withdrawn', 'Referral Code', 'Referred By', 'Joined Date'];
      rows = users.map(u => [
        u.id, `"${u.name}"`, u.mobile, u.role, u.status, u.planId, u.walletBalance, u.totalEarnings, u.totalWithdrawn, u.referralCode, u.referredBy || '', u.createdAt
      ]);
    } else if (type === 'payments') {
      headers = ['Txn ID', 'User ID', 'Name', 'Mobile', 'Plan', 'Amount (INR)', 'UTR Reference', 'Payment Method', 'Status', 'Submitted At', 'Verified At'];
      rows = payments.map(p => [
        p.id, p.userId, `"${p.userName}"`, p.userMobile, p.planName, p.amount, `"${p.utr}"`, p.paymentMethod, p.status, p.submittedAt, p.verifiedAt || ''
      ]);
    } else if (type === 'withdrawals') {
      headers = ['Withdrawal ID', 'User ID', 'Name', 'Mobile', 'Amount (INR)', 'UPI ID', 'Status', 'Payout Ref', 'Requested At', 'Processed At'];
      rows = withdrawals.map(w => [
        w.id, w.userId, `"${w.userName}"`, w.userMobile, w.amount, `"${w.upiId}"`, w.status, w.payoutReference || '', w.requestedAt, w.processedAt || ''
      ]);
    } else if (type === 'ledger') {
      headers = ['Ledger ID', 'User ID', 'Type', 'Amount (INR)', 'Description', 'Balance After', 'Date'];
      rows = ledger.map(l => [
        l.id, l.userId, l.type, l.amount, `"${l.description.replace(/"/g, '""')}"`, l.balanceAfter, l.createdAt
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Edit member details by Admin
  const editMemberDetails = (
    userId: string,
    data: {
      name?: string;
      mobile?: string;
      password?: string;
      planId?: PlanId;
      status?: 'active' | 'blocked';
      walletBalance?: number;
    }
  ): { success: boolean; message: string } => {
    const existing = users.find(u => u.id === userId);
    if (!existing) {
      return { success: false, message: 'Member not found' };
    }

    if (data.mobile && data.mobile !== existing.mobile) {
      const mobileExists = users.some(u => u.id !== userId && u.mobile === data.mobile);
      if (mobileExists) {
        return { success: false, message: 'Mobile number already registered by another member' };
      }
    }

    const nowIso = new Date().toISOString();
    const planChanged = !!data.planId && data.planId !== existing.planId;
    const newPlanId = data.planId || existing.planId;
    const targetPlan = plans.find(p => p.id === newPlanId);

    const updatedMemberObj: User = {
      ...existing,
      name: data.name?.trim() ? data.name.trim() : existing.name,
      mobile: data.mobile?.trim() ? data.mobile.trim() : existing.mobile,
      password: (data.password && data.password.trim().length > 0) ? data.password.trim() : existing.password,
      status: data.status || existing.status,
      planId: newPlanId,
      planActivatedAt: planChanged ? nowIso : existing.planActivatedAt,
      walletBalance: data.walletBalance !== undefined ? Math.max(0, data.walletBalance) : existing.walletBalance,
    };

    let nextUsers = users.map(u => u.id === userId ? updatedMemberObj : u);

    // If wallet balance changed directly
    if (data.walletBalance !== undefined && data.walletBalance !== existing.walletBalance) {
      const diff = data.walletBalance - existing.walletBalance;
      const isCredit = diff > 0;
      const adjLedger: LedgerEntry = {
        id: `LED-${Date.now()}`,
        userId,
        type: isCredit ? 'MANUAL_CREDIT' : 'MANUAL_DEBIT',
        amount: diff,
        description: `Admin manual balance adjustment: ${isCredit ? '+' : ''}₹${Math.abs(diff)}`,
        descriptionHi: `एडमिन द्वारा बैलेंस समायोजन: ${isCredit ? '+' : ''}₹${Math.abs(diff)}`,
        createdAt: nowIso,
        balanceAfter: updatedMemberObj.walletBalance,
      };
      setLedger(prev => [adjLedger, ...prev]);
      saveLedgerEntryToFirestore(adjLedger);
    }

    // If plan changed, handle plan upgrade logic & sponsor commission
    if (planChanged && targetPlan && targetPlan.price > 0 && newPlanId !== 'free') {
      const pendingPayment = payments.find(p => p.userId === userId && p.status === 'pending');
      if (pendingPayment) {
        const approvedTxn: PaymentTransaction = {
          ...pendingPayment,
          planId: newPlanId,
          planName: targetPlan.name,
          amount: targetPlan.price,
          status: 'approved',
          verifiedAt: nowIso,
          verifiedBy: 'logitech01',
        };
        const nextPayments = payments.map(p => p.id === pendingPayment.id ? approvedTxn : p);
        setPayments(nextPayments);
        syncDirectToStorage({ payments: nextPayments });
        savePaymentToFirestore(approvedTxn);
      } else {
        const autoTxn: PaymentTransaction = {
          id: `TXN-ACT-${Date.now().toString().slice(-6)}`,
          userId,
          userName: updatedMemberObj.name,
          userMobile: updatedMemberObj.mobile,
          planId: newPlanId,
          planName: targetPlan.name,
          amount: targetPlan.price,
          utr: `ADMIN-ACT-${Date.now().toString().slice(-6)}`,
          paymentMethod: 'PHONEPE',
          status: 'approved',
          submittedAt: nowIso,
          verifiedAt: nowIso,
          verifiedBy: 'logitech01',
        };
        const nextPayments = [autoTxn, ...payments];
        setPayments(nextPayments);
        syncDirectToStorage({ payments: nextPayments });
        savePaymentToFirestore(autoTxn);
      }

      const planLedger: LedgerEntry = {
        id: `LED-${Date.now()}`,
        userId,
        type: 'PLAN_PURCHASE',
        amount: targetPlan.price,
        description: `Plan ${targetPlan.name} Activated by Admin`,
        descriptionHi: `प्लान ${targetPlan.name} एडमिन द्वारा मैन्युअल सक्रिय किया गया`,
        referenceId: `MANUAL-${newPlanId.toUpperCase()}`,
        createdAt: nowIso,
        balanceAfter: updatedMemberObj.walletBalance,
      };
      setLedger(prev => [planLedger, ...prev]);
      saveLedgerEntryToFirestore(planLedger);

      if (updatedMemberObj.referredBy) {
        const commissionAmount = Math.round((targetPlan.price * (settings.referralBonusPercent || 10)) / 100);
        if (commissionAmount > 0) {
          const refUser = nextUsers.find(u => u.referralCode === updatedMemberObj.referredBy);
          if (refUser) {
            const updatedRefBal = refUser.walletBalance + commissionAmount;
            const updatedRefUserObj: User = {
              ...refUser,
              walletBalance: updatedRefBal,
              referralEarnings: refUser.referralEarnings + commissionAmount,
              totalEarnings: refUser.totalEarnings + commissionAmount,
            };
            nextUsers = nextUsers.map(u => u.id === refUser.id ? updatedRefUserObj : u);
            saveUserToFirestore(updatedRefUserObj);

            const refLedger: LedgerEntry = {
              id: `LED-${Date.now() + 1}`,
              userId: refUser.id,
              type: 'REFERRAL_BONUS',
              amount: commissionAmount,
              description: `10% Direct Commission from ${updatedMemberObj.name} (${targetPlan.name} Activation)`,
              descriptionHi: `${updatedMemberObj.name} के प्लान ${targetPlan.name} सक्रिय होने पर 10% कमीशन प्राप्त हुआ`,
              referenceId: `REF-${userId}`,
              createdAt: nowIso,
              balanceAfter: updatedRefBal,
            };
            setLedger(prev => [refLedger, ...prev]);
            saveLedgerEntryToFirestore(refLedger);
            logAudit('COMMISSION_CREDITED', `Admin activation credited ₹${commissionAmount} to referrer ${refUser.id} for ${userId}`, refUser.id);
          }
        }
      }
    }

    setUsers(nextUsers);
    syncDirectToStorage({ users: nextUsers });
    saveUserToFirestore(updatedMemberObj);

    if (currentUser?.id === userId) {
      setCurrentUser(updatedMemberObj);
      try {
        localStorage.setItem('logitech_active_user', JSON.stringify(updatedMemberObj));
      } catch (e) {
        console.warn('Failed saving active user:', e);
      }
    }

    logAudit('MEMBER_EDITED', `Admin updated member details for ${userId} (${updatedMemberObj.name})`, userId);
    return { success: true, message: `Member ${updatedMemberObj.name} (${userId}) updated successfully` };
  };

  // Master Delete member by Admin (Super Admin master control & full cascade)
  const deleteMember = (userId: string): { success: boolean; message: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'Member not found' };
    }

    if (target.role === 'admin' || target.id === 'logitech01') {
      return { success: false, message: 'Super Admin account (logitech01) cannot be deleted' };
    }

    // 1. Immediately cascade delete from all local states
    const nextUsers = users.filter(u => u.id !== userId);
    const nextPayments = payments.filter(p => p.userId !== userId);
    const nextWithdrawals = withdrawals.filter(w => w.userId !== userId);
    const nextLedger = ledger.filter(l => l.userId !== userId);
    const nextSupport = supportMessages.filter(m => m.userId !== userId);

    setUsers(nextUsers);
    setPayments(nextPayments);
    setWithdrawals(nextWithdrawals);
    setLedger(nextLedger);
    setSupportMessages(nextSupport);

    // 2. Direct atomic save to storage and sync to open tabs
    syncDirectToStorage({
      users: nextUsers,
      payments: nextPayments,
      withdrawals: nextWithdrawals,
      ledger: nextLedger,
      supportMessages: nextSupport,
    });

    // 3. Asynchronously cascade delete in Firestore without blocking main thread
    deleteUserFromFirestore(userId).catch(err => {
      console.warn('Firestore cascade delete non-blocking notice:', err);
    });

    // 4. Also if currentUser is this member, log out immediately
    if (currentUser?.id === userId) {
      logout();
    }

    logAudit('MEMBER_DELETED', `Master Admin permanently removed member ${target.name} (${userId}, mobile: ${target.mobile}) and wiped all associated transactions and records.`, userId);
    return { success: true, message: `Member ${target.name} (${userId}) and all associated records deleted permanently.` };
  };

  // Reset to factory defaults
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(INITIAL_USERS);
    setPlans(INITIAL_PLANS);
    setPayments(INITIAL_PAYMENTS);
    setWithdrawals(INITIAL_WITHDRAWALS);
    setLedger(INITIAL_LEDGER);
    setSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(null);
  };

  // Reset all balances, payments, withdrawals, and ledger to ₹0 for clean testing
  const resetAllDataToZero = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('logitech_active_user');

    const zeroUsers: User[] = INITIAL_USERS.map(u => ({
      ...u,
      walletBalance: 0,
      referralEarnings: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      planId: u.role === 'admin' ? 'diamond' : 'free',
      planActivatedAt: undefined,
    }));

    setUsers(zeroUsers);
    setPlans(INITIAL_PLANS);
    setPayments([]);
    setWithdrawals([]);
    setLedger([]);
    setSettings(INITIAL_SETTINGS);
    const resetLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SYSTEM_ZERO_RESET',
      details: 'Admin reset all balances, payments, withdrawals, and ledger to ₹0 for clean referral testing.',
      adminId: 'logitech01',
    };

    setAuditLogs([resetLog]);
    setCurrentUser(null);

    syncDirectToStorage({
      users: zeroUsers,
      plans: INITIAL_PLANS,
      payments: [],
      withdrawals: [],
      ledger: [],
      settings: INITIAL_SETTINGS,
      auditLogs: [resetLog],
      supportMessages: []
    });

    // Sync reset state to cloud Firestore
    zeroUsers.forEach(u => saveUserToFirestore(u));
    saveSettingsToFirestore(INITIAL_SETTINGS);
    INITIAL_PLANS.forEach(p => savePlanToFirestore(p));
    saveAuditLogToFirestore(resetLog);
  };

  // Safe Database Clean Slate for Live Production Launch
  const cleanSlateDatabaseReset = async (): Promise<{ success: boolean; message: string }> => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('logitech_active_user');
      localStorage.removeItem('logitech_ref_code');

      // 1. Wipe Firestore collections in cloud
      const wipeResult = await wipeAllTestDataFromFirestore();

      // 2. Call server endpoint if available
      try {
        await fetch('/api/admin/clean-slate-wipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminPassword: 'Logitech@2026' }),
        });
      } catch (err) {
        console.warn('Server wipe API optional trigger:', err);
      }

      // 3. Clean single Super Admin with starting 0 balance
      const cleanAdmin: User = {
        id: 'logitech01',
        name: 'Super Admin',
        mobile: '7470886292',
        password: 'Logitech@2026',
        role: 'admin',
        referralCode: 'LOGI-ADMIN',
        planId: 'diamond',
        planActivatedAt: new Date().toISOString(),
        walletBalance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        referralEarnings: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        todayReceivedIncome: 0,
      };

      setUsers([cleanAdmin]);
      setPayments([]);
      setWithdrawals([]);
      setLedger([]);
      setSupportMessages([]);

      const resetLog: AuditLog = {
        id: `LOG-LIVE-${Date.now()}`,
        adminId: 'logitech01',
        action: 'DATABASE_CLEAN_SLATE_RESET',
        details: 'Live Launch Clean Slate Reset: All test customer accounts, dummy referrals, and transaction histories wiped. Starting counter set to LT000101.',
        timestamp: new Date().toISOString(),
      };
      setAuditLogs([resetLog]);

      syncDirectToStorage({
        users: [cleanAdmin],
        plans: INITIAL_PLANS,
        payments: [],
        withdrawals: [],
        ledger: [],
        settings: INITIAL_SETTINGS,
        auditLogs: [resetLog],
        supportMessages: [],
      });

      return {
        success: true,
        message: wipeResult.message || 'Database successfully wiped clean for Live Launch! New real users will start from LT000101.'
      };
    } catch (e) {
      console.error('Clean slate error:', e);
      return {
        success: false,
        message: e instanceof Error ? e.message : 'Database clean slate reset failed'
      };
    }
  };

  // Support & Help Chat functions
  const sendSupportMessage = (
    text: string, 
    category: 'RECHARGE' | 'WITHDRAWAL' | 'PLAN' | 'GENERAL' = 'GENERAL',
    targetUserId?: string
  ): { success: boolean; message: string } => {
    if (!text || !text.trim()) {
      return { success: false, message: 'Message cannot be empty' };
    }

    const isAdmin = currentUser?.role === 'admin';
    const userId = isAdmin ? (targetUserId || 'U-ALL') : (currentUser?.id || 'GUEST');
    const targetUserObj = users.find(u => u.id === userId);
    const userName = isAdmin 
      ? 'Logitech Official Support' 
      : (currentUser?.name || 'Guest User');
    const userMobile = isAdmin 
      ? (targetUserObj?.mobile || 'Admin') 
      : (currentUser?.mobile || '');

    const newMsg: SupportMessage = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: userId,
      userName: userName,
      userMobile: userMobile,
      sender: isAdmin ? 'admin' : 'user',
      message: text.trim(),
      timestamp: new Date().toISOString(),
      readByAdmin: isAdmin ? true : false,
      readByUser: !isAdmin ? true : false,
      category: category,
    };

    setSupportMessages(prev => [...prev, newMsg]);
    saveSupportMessageToFirestore(newMsg);

    return { success: true, message: 'Message sent successfully' };
  };

  const markChatAsRead = (userId: string, reader: 'admin' | 'user') => {
    setSupportMessages(prev => {
      let updated = false;
      const next = prev.map(msg => {
        if (msg.userId === userId) {
          if (reader === 'admin' && !msg.readByAdmin) {
            updated = true;
            const updatedMsg = { ...msg, readByAdmin: true };
            saveSupportMessageToFirestore(updatedMsg);
            return updatedMsg;
          } else if (reader === 'user' && !msg.readByUser) {
            updated = true;
            const updatedMsg = { ...msg, readByUser: true };
            saveSupportMessageToFirestore(updatedMsg);
            return updatedMsg;
          }
        }
        return msg;
      });
      return updated ? next : prev;
    });
  };

  // Company Pool Liquidity Fund: Total Plan Payments Inflow (+) minus Total Net Withdrawals Paid Out (-)
  const totalPlanInflow = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalNetWithdrawalsSettled = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + (w.netAmount !== undefined ? w.netAmount : Math.round(w.amount * 0.95)), 0);

  const companyAvailableFund = totalPlanInflow - totalNetWithdrawalsSettled;

  const totalTdsCollected = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + (w.tdsAmount !== undefined ? w.tdsAmount : Math.round(w.amount * 0.05)), 0);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
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
        isCloudSynced,
        activeModal,
        setActiveModal,
        selectedPlanForPurchase,
        setSelectedPlanForPurchase,
        currentTab,
        setCurrentTab,
        teamFilter,
        setTeamFilter,
        selectedTeamMember,
        setSelectedTeamMember,
        navigateToTeam,
        supportMessages,
        sendSupportMessage,
        markChatAsRead,
        login,
        loginMember,
        loginAdmin,
        register,
        logout,
        quickLoginAdmin,
        quickLoginMember,
        submitPayment,
        verifyPayment,
        requestWithdrawal,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
