import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  writeBatch 
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin/Client on Server
const fbApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(fbApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(fbApp);

// Initialize Gemini SDK with User-Agent header as required by skill
let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} catch (err) {
  console.warn('Gemini initialization note:', err);
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// -------------------------------------------------------------
// 1. AI FINTECH ASSISTANT API (/api/ai/assistant)
// -------------------------------------------------------------
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, userRole, language, context } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `
You are the official smart AI Fintech Copilot for "LOGITECH ENTERPRISE & REWARDS PVT. LTD."
Language: Respond in Hindi, Hinglish, or English depending on user choice (default to Hindi/Hinglish if requested in Hindi).
Target User: ${userRole === 'admin' ? 'Super Administrator' : 'Platform Customer / Member'}.

Platform Details:
- Plans:
  * Bronze: ₹499 -> Daily Return ₹25/day (45 Days, Total Return ₹1,125)
  * Silver: ₹999 -> Daily Return ₹55/day (45 Days, Total Return ₹2,475)
  * Gold: ₹2,499 -> Daily Return ₹150/day (45 Days, Total Return ₹6,750)
  * Platinum: ₹4,999 -> Daily Return ₹320/day (50 Days, Total Return ₹16,000)
  * Diamond: ₹9,999 -> Daily Return ₹700/day (60 Days, Total Return ₹42,000)
- Daily ROI Rules:
  * Credited every midnight at 12:00 AM automatically.
  * Plan activation ke dusre din se (Starts on the next day after activation).
- Referral Program:
  * 10% instant direct commission to sponsor whenever an invited downline activates any paid tier.
  * Referral code format: LT-NAME123 or direct user ID.
- Withdrawals:
  * Minimum: ₹320. Maximum: ₹5,000/day.
  * 5% TDS deducted transparently for compliance.
  * Paid directly to member's UPI ID / PhonePe / GPay.
- Recharges:
  * User sends UPI payment and submits 12-digit UTR reference.
  * Admin verifies and activates within minutes.

Current Context Data:
${context ? JSON.stringify(context) : 'No live context provided'}

Guidelines:
- Provide accurate, reassuring, polite, and scannable answers.
- Use bullet points and emoji highlights.
- If admin asks about pending users or daily topup, explain the exact 1-click action buttons available in the dashboard.
`;

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });

        if (response.text) {
          return res.json({
            reply: response.text,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini generateContent transient error, falling back gracefully:', geminiErr);
        // Proceed to fallback response below
      }
    }
      // Fallback response if GEMINI_API_KEY is not yet attached
      const q = prompt.toLowerCase();
      let reply = 'Namaskar! LOGITECH Enterprise AI Assistant me aapka swagat hai.\n\n';
      if (q.includes('plan') || q.includes('return') || q.includes('earning') || q.includes('daily')) {
        reply += '📊 **LOGITECH Plans & Daily Earnings:**\n' +
          '• **Bronze (₹499):** ₹25/day for 45 days (Total: ₹1,125)\n' +
          '• **Silver (₹999):** ₹55/day for 45 days (Total: ₹2,475)\n' +
          '• **Gold (₹2,499):** ₹150/day for 45 days (Total: ₹6,750)\n' +
          '• **Platinum (₹4,999):** ₹320/day for 50 days (Total: ₹16,000)\n' +
          '• **Diamond (₹9,999):** ₹700/day for 60 days (Total: ₹42,000)\n\n' +
          '⏰ Daily income har raat 12:00 AM par wallet me automatic credit hoti hai (plan active hone ke agle din se).';
      } else if (q.includes('referral') || q.includes('sponsor') || q.includes('invite') || q.includes('commission')) {
        reply += '🤝 **Referral Commission:**\n' +
          '• Jab bhi aapke referral link se judne wala member koi paid plan activate karta hai, aapko **10% direct instant commission** turant aapke wallet me milta hai.\n' +
          '• Referral link Team Network page se copy karke WhatsApp par share kar sakte hain!';
      } else if (q.includes('withdraw') || q.includes('tds') || q.includes('bank') || q.includes('upi')) {
        reply += '💳 **Withdrawal Rules:**\n' +
          '• Minimum withdrawal: ₹320 | Maximum: ₹5,000 per request.\n' +
          '• 5% TDS deduction transparently apply hota hai.\n' +
          '• Payout direct aapke submit kiye gaye UPI ID me transfer hota hai.';
      } else {
        reply += 'Aap mujhse LOGITECH ke plans, daily 12:00 AM earnings, 10% referral system, ya UPI recharge aur withdrawal ke bare me puch sakte hain!';
      }
      return res.json({ reply });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    res.status(500).json({
      error: 'Failed to generate AI response',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// -------------------------------------------------------------
// 2. AUTOMATED DAILY ROI / 24H CRON JOB (/api/cron/daily-roi)
// -------------------------------------------------------------
export async function executeServerDailyDistribution(): Promise<{
  usersCredited: number;
  totalDistributed: number;
  timestamp: string;
}> {
  let usersCredited = 0;
  let totalDistributed = 0;
  const now = new Date();
  const nowIso = now.toISOString();
  const todayDateStr = nowIso.slice(0, 10);

  try {
    // 1. Fetch plans
    const plansSnap = await getDocs(collection(db, 'plans'));
    const plansMap = new Map<string, { dailyEarning: number; name: string }>();
    plansSnap.forEach(d => {
      const data = d.data();
      plansMap.set(d.id, { dailyEarning: data.dailyEarning || 0, name: data.name || d.id });
    });

    // 2. Fetch users
    const usersSnap = await getDocs(collection(db, 'users'));
    const userBatch = writeBatch(db);
    const ledgerBatch = writeBatch(db);
    let batchOperations = 0;

    usersSnap.forEach(userDoc => {
      const u = userDoc.data();
      if (u.role === 'admin' || u.status !== 'active' || !u.planId || u.planId === 'free') {
        return;
      }

      const planInfo = plansMap.get(u.planId);
      if (!planInfo || planInfo.dailyEarning <= 0) return;

      // Next-day activation rule:
      const activationDateStr = u.planActivatedAt ? u.planActivatedAt.slice(0, 10) : '';
      if (activationDateStr && todayDateStr <= activationDateStr) {
        // Activated today; starts tomorrow
        return;
      }

      // Already credited today?
      const lastCreditDateStr = u.lastDailyCreditDate ? u.lastDailyCreditDate.slice(0, 10) : '';
      if (lastCreditDateStr === todayDateStr) {
        return;
      }

      usersCredited++;
      totalDistributed += planInfo.dailyEarning;

      const newBal = (u.walletBalance || 0) + planInfo.dailyEarning;
      const newTotalEarnings = (u.totalEarnings || 0) + planInfo.dailyEarning;

      userBatch.set(userDoc.ref, {
        walletBalance: newBal,
        totalEarnings: newTotalEarnings,
        lastDailyCreditDate: nowIso,
        todayReceivedIncome: planInfo.dailyEarning,
      }, { merge: true });

      const ledgerId = `LED-DAILY-${Date.now()}-${u.id}-${Math.floor(Math.random() * 1000)}`;
      const ledgerRef = doc(db, 'ledger', ledgerId);
      ledgerBatch.set(ledgerRef, {
        id: ledgerId,
        userId: u.id,
        type: 'DAILY_ROI',
        amount: planInfo.dailyEarning,
        description: `Automated Server Midnight Daily Return (${planInfo.name})`,
        descriptionHi: `सर्वर ऑटोमैटिक दैनिक रिटर्न जमा (${planInfo.name})`,
        createdAt: nowIso,
        balanceAfter: newBal,
      });

      batchOperations++;
    });

    if (usersCredited > 0) {
      await userBatch.commit();
      await ledgerBatch.commit();

      const logId = `LOG-CRON-${Date.now()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        adminId: 'system-cron',
        action: 'DAILY_TOPUP_EXECUTED',
        details: `Automated 24h Server Cron distributed ₹${totalDistributed} to ${usersCredited} active members.`,
        timestamp: nowIso,
      });
      console.log(`[Cron] Distributed ₹${totalDistributed} to ${usersCredited} users at ${nowIso}`);
    }
  } catch (err) {
    console.error('[Cron] Server daily distribution error:', err);
  }

  return { usersCredited, totalDistributed, timestamp: nowIso };
}

// Background Cron watchdog: runs every 60 seconds
let lastCronRunDate = '';
setInterval(async () => {
  const currentDateStr = new Date().toISOString().slice(0, 10);
  if (lastCronRunDate !== currentDateStr) {
    // New day reached: guard immediately so it checks strictly once per calendar day
    lastCronRunDate = currentDateStr;
    console.log(`[Cron] Checking 24h Daily ROI turnover for ${currentDateStr}...`);
    try {
      const res = await executeServerDailyDistribution();
      console.log(`[Cron] Daily ROI check finished for ${currentDateStr}: credited ${res.usersCredited} users.`);
    } catch (cronErr) {
      console.error('[Cron] Error during scheduled distribution:', cronErr);
    }
  }
}, 60000);

app.post('/api/cron/daily-roi', async (_req: Request, res: Response) => {
  const result = await executeServerDailyDistribution();
  res.json({
    success: true,
    message: `Server 24h cron executed: Credited ${result.usersCredited} users with ₹${result.totalDistributed}`,
    ...result,
  });
});

// -------------------------------------------------------------
// 3. DATABASE CLEAN SLATE WIPE API (/api/admin/clean-slate-wipe)
// -------------------------------------------------------------
app.post('/api/admin/clean-slate-wipe', async (req: Request, res: Response) => {
  try {
    const { adminPassword } = req.body;
    if (adminPassword !== 'Logitech@2026') {
      return res.status(403).json({ error: 'Unauthorized: Invalid Admin Password' });
    }

    let deletedUsers = 0;
    let deletedPayments = 0;
    let deletedWithdrawals = 0;
    let deletedLedger = 0;

    // 1. Wipe non-admin users
    const usersSnap = await getDocs(collection(db, 'users'));
    const userBatch = writeBatch(db);
    usersSnap.forEach((userDoc) => {
      if (userDoc.id !== 'logitech01') {
        userBatch.delete(userDoc.ref);
        deletedUsers++;
      }
    });

    // Reset Super Admin to clean ₹0 balance
    const adminRef = doc(db, 'users', 'logitech01');
    userBatch.set(adminRef, {
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
    }, { merge: true });
    await userBatch.commit();

    // 2. Wipe payments
    const paymentsSnap = await getDocs(collection(db, 'payments'));
    if (!paymentsSnap.empty) {
      const payBatch = writeBatch(db);
      paymentsSnap.forEach(d => {
        payBatch.delete(d.ref);
        deletedPayments++;
      });
      await payBatch.commit();
    }

    // 3. Wipe withdrawals
    const withSnap = await getDocs(collection(db, 'withdrawals'));
    if (!withSnap.empty) {
      const withBatch = writeBatch(db);
      withSnap.forEach(d => {
        withBatch.delete(d.ref);
        deletedWithdrawals++;
      });
      await withBatch.commit();
    }

    // 4. Wipe ledger
    const ledgerSnap = await getDocs(collection(db, 'ledger'));
    if (!ledgerSnap.empty) {
      const ledgerBatch = writeBatch(db);
      ledgerSnap.forEach(d => {
        ledgerBatch.delete(d.ref);
        deletedLedger++;
      });
      await ledgerBatch.commit();
    }

    // 5. Reset user counter
    await setDoc(doc(db, 'system_counters', 'users'), {
      nextNumber: 101,
      lastResetAt: new Date().toISOString(),
      status: 'LIVE_PRODUCTION'
    });

    // 6. Write audit log
    const resetLog = {
      id: `LOG-LIVE-${Date.now()}`,
      adminId: 'logitech01',
      action: 'DATABASE_CLEAN_SLATE_RESET',
      details: `Database Clean Slate executed via API. Purged ${deletedUsers} test users, ${deletedPayments} payments, ${deletedWithdrawals} withdrawals, ${deletedLedger} ledger entries. Super Admin reset to ₹0. Counter reset to LT000101.`,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'audit_logs', resetLog.id), resetLog);

    return res.json({
      success: true,
      deletedUsers,
      deletedPayments,
      deletedWithdrawals,
      deletedLedger,
      message: `Database Clean Slate Completed. Next user starts at LT000101.`
    });
  } catch (error) {
    console.error('Clean Slate API Error:', error);
    res.status(500).json({
      error: 'Failed to execute clean slate wipe',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// 4. VITE DEV SERVER / STATIC PRODUCTION MOUNT
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      server: {
        middlewareMode: true,
        watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LOGITECH Enterprise Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Server failed to start:', err);
});
