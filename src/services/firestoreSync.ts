import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch,
  query,
  where,
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { 
  User, 
  Plan, 
  PaymentTransaction, 
  WithdrawalRequest, 
  LedgerEntry, 
  AuditLog, 
  CompanySettings,
  SupportMessage 
} from '../types';

/**
 * Strips undefined properties because Firestore throws when saving undefined.
 */
export function cleanData<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, cleanData(user), { merge: true });
  } catch (error) {
    console.error('Failed to save user to Firestore:', error);
    // Non-fatal warning to allow offline or fallback operation
  }
}

/**
 * Cascade deletes user and all associated payments, withdrawals, ledger entries, and support chats.
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Delete user document
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);

    // 2. Query and delete user's payments
    try {
      const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('userId', '==', userId)));
      paymentsSnap.forEach(d => batch.delete(d.ref));
    } catch (e) {
      console.warn('Cascade delete payments notice:', e);
    }

    // 3. Query and delete user's withdrawals
    try {
      const withSnap = await getDocs(query(collection(db, 'withdrawals'), where('userId', '==', userId)));
      withSnap.forEach(d => batch.delete(d.ref));
    } catch (e) {
      console.warn('Cascade delete withdrawals notice:', e);
    }

    // 4. Query and delete user's ledger entries
    try {
      const ledgerSnap = await getDocs(query(collection(db, 'ledger'), where('userId', '==', userId)));
      ledgerSnap.forEach(d => batch.delete(d.ref));
    } catch (e) {
      console.warn('Cascade delete ledger notice:', e);
    }

    // 5. Query and delete user's support chats
    try {
      const chatSnap = await getDocs(query(collection(db, 'support_chats'), where('userId', '==', userId)));
      chatSnap.forEach(d => batch.delete(d.ref));
    } catch (e) {
      console.warn('Cascade delete chat notice:', e);
    }

    await batch.commit();
    console.log(`[Firestore] User ${userId} and all related records cascade deleted successfully.`);
  } catch (error) {
    console.error('Failed to cascade delete user from Firestore:', error);
    // Fallback: try direct document delete if batch query fails
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err2) {
      console.error('Fallback deleteDoc error:', err2);
    }
  }
}

export async function savePaymentToFirestore(payment: PaymentTransaction): Promise<void> {
  try {
    const paymentRef = doc(db, 'payments', payment.id);
    await setDoc(paymentRef, cleanData(payment), { merge: true });
  } catch (error) {
    console.error('Failed to save payment to Firestore:', error);
  }
}

export async function saveWithdrawalToFirestore(withdrawal: WithdrawalRequest): Promise<void> {
  try {
    const withdrawalRef = doc(db, 'withdrawals', withdrawal.id);
    await setDoc(withdrawalRef, cleanData(withdrawal), { merge: true });
  } catch (error) {
    console.error('Failed to save withdrawal to Firestore:', error);
  }
}

export async function saveLedgerEntryToFirestore(entry: LedgerEntry): Promise<void> {
  try {
    const ledgerRef = doc(db, 'ledger', entry.id);
    await setDoc(ledgerRef, cleanData(entry), { merge: true });
  } catch (error) {
    console.error('Failed to save ledger to Firestore:', error);
  }
}

export async function saveSettingsToFirestore(settings: CompanySettings): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, cleanData(settings), { merge: true });
  } catch (error) {
    console.error('Failed to save settings to Firestore:', error);
  }
}

export async function saveAuditLogToFirestore(log: AuditLog): Promise<void> {
  try {
    const logRef = doc(db, 'audit_logs', log.id);
    await setDoc(logRef, cleanData(log), { merge: true });
  } catch (error) {
    console.error('Failed to save audit log to Firestore:', error);
  }
}

export async function savePlanToFirestore(plan: Plan): Promise<void> {
  try {
    const planRef = doc(db, 'plans', plan.id);
    await setDoc(planRef, cleanData(plan), { merge: true });
  } catch (error) {
    console.error('Failed to save plan to Firestore:', error);
  }
}

export async function saveSupportMessageToFirestore(message: SupportMessage): Promise<void> {
  try {
    const msgRef = doc(db, 'support_chats', message.id);
    await setDoc(msgRef, cleanData(message), { merge: true });
  } catch (error) {
    console.error('Failed to save support message to Firestore:', error);
  }
}

/**
 * Seeds initial collections if Firestore is empty.
 */
export async function seedInitialFirestoreData(
  initialUsers: User[],
  initialPlans: Plan[],
  initialSettings: CompanySettings
): Promise<void> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (usersSnapshot.empty) {
      console.log('Seeding initial users to Firestore...');
      const batch = writeBatch(db);
      initialUsers.forEach(u => {
        batch.set(doc(db, 'users', u.id), cleanData(u));
      });
      await batch.commit();
    }

    const plansSnapshot = await getDocs(collection(db, 'plans'));
    if (plansSnapshot.empty) {
      console.log('Seeding initial plans to Firestore...');
      const batch = writeBatch(db);
      initialPlans.forEach(p => {
        batch.set(doc(db, 'plans', p.id), cleanData(p));
      });
      await batch.commit();
    }

    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, cleanData(initialSettings), { merge: true });
  } catch (error) {
    console.warn('Initial Firestore seeding check note:', error);
  }
}

/**
 * Real-time subscriptions to all Firestore collections.
 */
export function subscribeToFirestore(callbacks: {
  onUsers: (users: User[]) => void;
  onPlans: (plans: Plan[]) => void;
  onPayments: (payments: PaymentTransaction[]) => void;
  onWithdrawals: (withdrawals: WithdrawalRequest[]) => void;
  onLedger: (ledger: LedgerEntry[]) => void;
  onSettings: (settings: CompanySettings) => void;
  onAuditLogs: (logs: AuditLog[]) => void;
  onSupportMessages?: (messages: SupportMessage[]) => void;
  onConnectionChange?: (connected: boolean) => void;
}): () => void {
  const unsubscribers: Unsubscribe[] = [];

  try {
    // 1. Users
    const unUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list: User[] = [];
        snapshot.forEach(d => list.push(d.data() as User));
        callbacks.onUsers(list);
        callbacks.onConnectionChange?.(true);
      },
      (err) => {
        console.warn('Firestore users subscription listener error:', err);
        callbacks.onConnectionChange?.(false);
      }
    );
    unsubscribers.push(unUsers);

    // 2. Plans
    const unPlans = onSnapshot(
      collection(db, 'plans'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Plan[] = [];
          snapshot.forEach(d => list.push(d.data() as Plan));
          callbacks.onPlans(list);
        }
      },
      (err) => console.warn('Firestore plans subscription error:', err)
    );
    unsubscribers.push(unPlans);

    // 3. Payments
    const unPayments = onSnapshot(
      collection(db, 'payments'),
      (snapshot) => {
        const list: PaymentTransaction[] = [];
        snapshot.forEach(d => list.push(d.data() as PaymentTransaction));
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        callbacks.onPayments(list);
      },
      (err) => console.warn('Firestore payments subscription error:', err)
    );
    unsubscribers.push(unPayments);

    // 4. Withdrawals
    const unWithdrawals = onSnapshot(
      collection(db, 'withdrawals'),
      (snapshot) => {
        const list: WithdrawalRequest[] = [];
        snapshot.forEach(d => list.push(d.data() as WithdrawalRequest));
        list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        callbacks.onWithdrawals(list);
      },
      (err) => console.warn('Firestore withdrawals subscription error:', err)
    );
    unsubscribers.push(unWithdrawals);

    // 5. Ledger
    const unLedger = onSnapshot(
      collection(db, 'ledger'),
      (snapshot) => {
        const list: LedgerEntry[] = [];
        snapshot.forEach(d => list.push(d.data() as LedgerEntry));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callbacks.onLedger(list);
      },
      (err) => console.warn('Firestore ledger subscription error:', err)
    );
    unsubscribers.push(unLedger);

    // 6. Settings
    const unSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          callbacks.onSettings(docSnap.data() as CompanySettings);
        }
      },
      (err) => console.warn('Firestore settings subscription error:', err)
    );
    unsubscribers.push(unSettings);

    // 7. Audit Logs
    const unAuditLogs = onSnapshot(
      collection(db, 'audit_logs'),
      (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach(d => list.push(d.data() as AuditLog));
        callbacks.onAuditLogs(list);
      },
      (err) => console.warn('Firestore audit logs subscription error:', err)
    );
    unsubscribers.push(unAuditLogs);

    // 8. Support Chats
    const unSupportChats = onSnapshot(
      collection(db, 'support_chats'),
      (snapshot) => {
        const list: SupportMessage[] = [];
        snapshot.forEach(d => list.push(d.data() as SupportMessage));
        list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        callbacks.onSupportMessages?.(list);
      },
      (err) => console.warn('Firestore support chats subscription error:', err)
    );
    unsubscribers.push(unSupportChats);

  } catch (error) {
    console.warn('Failed to initialize Firestore subscriptions:', error);
  }

  return () => {
    unsubscribers.forEach(un => {
      try {
        un();
      } catch (e) {
        // ignore cleanup error
      }
    });
  };
}

/**
 * Safely wipes all test user accounts, dummy team members, referral logs,
 * transaction histories, withdrawals, and ledger entries for Live Launch.
 * Preserves Super Admin ('logitech01') with fresh starting 0 balance.
 * Resets user counter to 100 so new real signups start cleanly at LT000101.
 */
export async function wipeAllTestDataFromFirestore(): Promise<{
  success: boolean;
  deletedUsers: number;
  deletedPayments: number;
  deletedWithdrawals: number;
  deletedLedger: number;
  message: string;
}> {
  try {
    let deletedUsers = 0;
    let deletedPayments = 0;
    let deletedWithdrawals = 0;
    let deletedLedger = 0;

    // 1. Wipe non-admin users from Firestore
    const usersSnap = await getDocs(collection(db, 'users'));
    const userBatch = writeBatch(db);
    usersSnap.forEach((userDoc) => {
      if (userDoc.id !== 'logitech01') {
        userBatch.delete(userDoc.ref);
        deletedUsers++;
      }
    });
    // Reset Super Admin balance to 0
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

    // 2. Wipe all payments
    const paymentsSnap = await getDocs(collection(db, 'payments'));
    if (!paymentsSnap.empty) {
      const payBatch = writeBatch(db);
      paymentsSnap.forEach(d => {
        payBatch.delete(d.ref);
        deletedPayments++;
      });
      await payBatch.commit();
    }

    // 3. Wipe all withdrawals
    const withSnap = await getDocs(collection(db, 'withdrawals'));
    if (!withSnap.empty) {
      const withBatch = writeBatch(db);
      withSnap.forEach(d => {
        withBatch.delete(d.ref);
        deletedWithdrawals++;
      });
      await withBatch.commit();
    }

    // 4. Wipe all ledger entries
    const ledgerSnap = await getDocs(collection(db, 'ledger'));
    if (!ledgerSnap.empty) {
      const ledgerBatch = writeBatch(db);
      ledgerSnap.forEach(d => {
        ledgerBatch.delete(d.ref);
        deletedLedger++;
      });
      await ledgerBatch.commit();
    }

    // 5. Wipe support chats
    const chatSnap = await getDocs(collection(db, 'support_chats'));
    if (!chatSnap.empty) {
      const chatBatch = writeBatch(db);
      chatSnap.forEach(d => chatBatch.delete(d.ref));
      await chatBatch.commit();
    }

    // 6. Reset sequential user counter
    const counterRef = doc(db, 'system_counters', 'users');
    await setDoc(counterRef, {
      nextNumber: 101,
      lastResetAt: new Date().toISOString(),
      status: 'LIVE_READY'
    });

    // 7. Write clean slate audit log
    const resetLog: AuditLog = {
      id: `LOG-LIVE-${Date.now()}`,
      adminId: 'logitech01',
      action: 'DATABASE_CLEAN_SLATE_RESET',
      details: `Live launch database wipe executed. Purged ${deletedUsers} test users, ${deletedPayments} payments, ${deletedWithdrawals} withdrawals, ${deletedLedger} ledger entries. Super Admin reset to ₹0. Counter reset to LT000101.`,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'audit_logs', resetLog.id), cleanData(resetLog));

    return {
      success: true,
      deletedUsers,
      deletedPayments,
      deletedWithdrawals,
      deletedLedger,
      message: `Database cleaned successfully. Reset ${deletedUsers} users. Next user will start from LT000101.`
    };
  } catch (error) {
    console.error('Failed to wipe test data from Firestore:', error);
    return {
      success: false,
      deletedUsers: 0,
      deletedPayments: 0,
      deletedWithdrawals: 0,
      deletedLedger: 0,
      message: error instanceof Error ? error.message : 'Database wipe failed'
    };
  }
}

