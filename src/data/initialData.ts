import { Plan, User, PaymentTransaction, WithdrawalRequest, LedgerEntry, AuditLog, CompanySettings, SupportMessage } from '../types';

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'bronze',
    name: 'BRONZE STARTER',
    nameHi: 'ब्रॉन्ज स्टार्टर',
    price: 499,
    dailyEarning: 25,
    durationDays: 45,
    totalReturn: 1125,
    badge: 'Starter',
    color: 'from-amber-700 to-amber-900',
  },
  {
    id: 'silver',
    name: 'SILVER ADVANCE',
    nameHi: 'सिल्वर एडवांस',
    price: 999,
    dailyEarning: 55,
    durationDays: 45,
    totalReturn: 2475,
    badge: 'Popular',
    color: 'from-slate-400 to-slate-600',
    isPopular: true,
  },
  {
    id: 'gold',
    name: 'GOLD SUPREME',
    nameHi: 'गोल्ड सुप्रीम',
    price: 2499,
    dailyEarning: 150,
    durationDays: 45,
    totalReturn: 6750,
    badge: 'High Earning',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'platinum',
    name: 'PLATINUM ELITE',
    nameHi: 'प्लेटिनम एलीट',
    price: 4999,
    dailyEarning: 320,
    durationDays: 50,
    totalReturn: 16000,
    badge: 'Enterprise',
    color: 'from-cyan-500 to-blue-700',
  },
  {
    id: 'diamond',
    name: 'DIAMOND INFINITY',
    nameHi: 'डायमंड इन्फिनिटी',
    price: 9999,
    dailyEarning: 700,
    durationDays: 60,
    totalReturn: 42000,
    badge: 'Maximum ROI',
    color: 'from-emerald-400 to-teal-700',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'logitech01',
    name: 'Super Admin',
    mobile: '7470886292',
    password: 'Logitech@2026',
    role: 'admin',
    referralCode: 'LOGI-ADMIN',
    planId: 'diamond',
    planActivatedAt: '2026-11-01T00:00:00.000Z',
    walletBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
    referralEarnings: 0,
    status: 'active',
    createdAt: '2026-11-01T00:00:00.000Z',
    todayReceivedIncome: 0,
  }
];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

export const INITIAL_LEDGER: LedgerEntry[] = [];

export const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'LOGITECH ENTERPRISE & REWARDS PVT. LTD.',
  upiId: '7470886292@ybl',
  phonePeNumber: '+91 7470886292',
  payeeName: 'TECHNICAL FREELANCER',
  qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3D7470886292%40ybl%26pn%3DTECHNICAL%2520FREELANCER%26cu%3DINR',
  minWithdrawal: 320,
  maxWithdrawal: 5000,
  tdsPercent: 5,
  referralBonusPercent: 10,
  dailyTopupHour: 0,
  announcementEn: '🚀 Welcome to LOGITECH! Daily 12:00 AM returns active. Daily Withdrawal Limit: ₹320 - ₹5,000/day with 5% TDS.',
  announcementHi: '🚀 लॉजिटेक में आपका स्वागत है! रात 12:00 बजे का रिटर्न चालू है। दैनिक विड्रॉल सीमा: ₹320 - ₹5,000 प्रतिदिन (5% TDS)।',
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-LIVE-INIT',
    adminId: 'system',
    action: 'LIVE_MODE_INITIALIZED',
    details: 'System transitioned to LIVE Production Mode. Test customers purged and all starting balances set to ₹0.',
    timestamp: '2026-11-10T00:00:00.000Z',
  }
];

export const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [];

