export type Language = 'en' | 'hi';

export type UserRole = 'admin' | 'member';

export type PlanId = 'free' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Plan {
  id: PlanId;
  name: string;
  nameHi: string;
  price: number;
  dailyEarning: number;
  durationDays: number;
  totalReturn: number;
  badge?: string;
  color: string;
  isPopular?: boolean;
}

export interface User {
  id: string; // e.g. "LT000101"
  name: string;
  mobile: string;
  password?: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string; // referral code of inviter
  planId: PlanId;
  planActivatedAt?: string;
  walletBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  referralEarnings: number;
  status: 'active' | 'blocked';
  createdAt: string;
  lastDailyCreditDate?: string;
  todayReceivedIncome?: number;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentTransaction {
  id: string; // e.g. "TXN-1002"
  userId: string;
  userName: string;
  userMobile: string;
  planId: PlanId;
  planName: string;
  amount: number;
  utr: string; // 12-digit UPI reference
  paymentMethod: 'UPI_QR' | 'PHONEPE' | 'GPAY' | 'PAYTM';
  screenshotUrl?: string;
  status: PaymentStatus;
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export type WithdrawalStatus = 'pending' | 'processing' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id: string; // e.g. "WTH-5001"
  userId: string;
  userName: string;
  userMobile: string;
  amount: number; // Gross requested amount
  tdsPercent: number; // e.g. 5%
  tdsAmount: number; // TDS deducted
  netAmount: number; // Net amount paid to UPI
  upiId: string;
  upiMobile: string;
  status: WithdrawalStatus;
  payoutReference?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export type LedgerType = 
  | 'DAILY_ROI' 
  | 'REFERRAL_BONUS' 
  | 'PLAN_PURCHASE' 
  | 'WITHDRAWAL_REQUEST' 
  | 'WITHDRAWAL_REFUND' 
  | 'MANUAL_CREDIT' 
  | 'MANUAL_DEBIT';

export interface LedgerEntry {
  id: string;
  userId: string;
  type: LedgerType;
  amount: number; // positive for credit, negative for debit
  description: string;
  descriptionHi: string;
  referenceId?: string;
  createdAt: string;
  balanceAfter: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetUserId?: string;
  details: string;
  timestamp: string;
}

export interface CompanySettings {
  companyName: string;
  upiId: string;
  phonePeNumber: string;
  payeeName: string;
  qrImageUrl: string;
  minWithdrawal: number;
  maxWithdrawal: number;
  tdsPercent: number; // e.g. 5% TDS deduction
  referralBonusPercent: number; // e.g. 10%
  dailyTopupHour: number; // 0 for 12:00 AM
  announcementEn: string;
  announcementHi: string;
}

export interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: string;
  readByAdmin: boolean;
  readByUser: boolean;
  category?: 'RECHARGE' | 'WITHDRAWAL' | 'PLAN' | 'GENERAL';
}
