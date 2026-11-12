/**
 * LOGITECH Enterprise & Rewards - Production Live Clean Slate Database Reset Script
 * 
 * Usage:
 *   npx tsx scripts/clean_database_slate.ts
 * 
 * Actions Performed:
 * 1. Connects to production Firestore database (ai-studio-logitechreferral-b8d5459c-9f89-41f8-8b62-53bce08868a8).
 * 2. Deletes all non-admin test users (LT000101, LT000102, etc.).
 * 3. Preserves Super Admin 'logitech01' with fresh starting ₹0 balance.
 * 4. Wipes dummy payments, fake recharge requests, and duplicate UTRs.
 * 5. Wipes test withdrawal requests and payout logs.
 * 6. Wipes all demo ledger transactions.
 * 7. Resets sequential user ID counter to 100 (so next real customer is LT000101).
 * 8. Records a permanent LIVE_LAUNCH audit log.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(config) : getApp();
const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

async function runCleanSlate() {
  console.log('===========================================================');
  console.log('🚀 LOGITECH ENTERPRISE: STARTING LIVE CLEAN SLATE WIPE');
  console.log('Target Database:', config.firestoreDatabaseId || 'default');
  console.log('===========================================================');

  try {
    let usersWiped = 0;
    let paymentsWiped = 0;
    let withdrawalsWiped = 0;
    let ledgerWiped = 0;

    // 1. Wipe non-admin users
    console.log('\n[1/6] Purging test member accounts...');
    const usersSnap = await getDocs(collection(db, 'users'));
    const userBatch = writeBatch(db);
    usersSnap.forEach((userDoc) => {
      if (userDoc.id !== 'logitech01') {
        userBatch.delete(userDoc.ref);
        usersWiped++;
      }
    });

    // Reset Super Admin to ₹0 clean balance
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
    console.log(`✓ Purged ${usersWiped} test users. Super Admin reset to ₹0.`);

    // 2. Wipe payments
    console.log('\n[2/6] Wiping test payment/recharge records...');
    const paySnap = await getDocs(collection(db, 'payments'));
    if (!paySnap.empty) {
      const payBatch = writeBatch(db);
      paySnap.forEach(d => {
        payBatch.delete(d.ref);
        paymentsWiped++;
      });
      await payBatch.commit();
    }
    console.log(`✓ Wiped ${paymentsWiped} test payment transactions.`);

    // 3. Wipe withdrawals
    console.log('\n[3/6] Wiping test withdrawal requests...');
    const withSnap = await getDocs(collection(db, 'withdrawals'));
    if (!withSnap.empty) {
      const withBatch = writeBatch(db);
      withSnap.forEach(d => {
        withBatch.delete(d.ref);
        withdrawalsWiped++;
      });
      await withBatch.commit();
    }
    console.log(`✓ Wiped ${withdrawalsWiped} test withdrawal requests.`);

    // 4. Wipe ledger
    console.log('\n[4/6] Wiping test ledger history...');
    const ledgerSnap = await getDocs(collection(db, 'ledger'));
    if (!ledgerSnap.empty) {
      const ledgerBatch = writeBatch(db);
      ledgerSnap.forEach(d => {
        ledgerBatch.delete(d.ref);
        ledgerWiped++;
      });
      await ledgerBatch.commit();
    }
    console.log(`✓ Wiped ${ledgerWiped} test ledger entries.`);

    // 5. Reset user counter
    console.log('\n[5/6] Resetting user counter to 100 (Next Member: LT000101)...');
    await setDoc(doc(db, 'system_counters', 'users'), {
      nextNumber: 101,
      lastResetAt: new Date().toISOString(),
      status: 'LIVE_PRODUCTION_READY'
    });
    console.log('✓ Sequential User ID counter reset. First live registrant will get LT000101.');

    // 6. Record live launch log
    console.log('\n[6/6] Logging official LIVE_PRODUCTION_INITIALIZED audit trail...');
    const logId = `LOG-LIVE-${Date.now()}`;
    await setDoc(doc(db, 'audit_logs', logId), {
      id: logId,
      adminId: 'system-live-launch',
      action: 'LIVE_PRODUCTION_INITIALIZED',
      details: `Platform moved to 100% Live Production. Database clean slate executed. Next user will start from LT000101.`,
      timestamp: new Date().toISOString(),
    });

    console.log('\n===========================================================');
    console.log('✅ LIVE CLEAN SLATE COMPLETED SUCCESSFULLY!');
    console.log('The platform is now 100% clean and ready for real customer registrations.');
    console.log('===========================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clean slate failed:', error);
    process.exit(1);
  }
}

runCleanSlate();
