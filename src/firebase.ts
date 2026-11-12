import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocFromServer, 
  Firestore,
  FirestoreError 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import config from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(config) : getApp();

// Initialize Auth
export const auth: Auth = getAuth(app);

// Automatically sign in anonymously if not authenticated so requests have auth context
signInAnonymously(auth).catch((err) => {
  console.warn('Anonymous auth sign-in warning:', err);
});

// Initialize Firestore
export const db: Firestore = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Standardized Firestore Error Handler required by Firebase Integration Skill
export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    tenantId: string | null;
    providerData: Array<{
      providerId: string;
      displayName: string | null;
      email: string | null;
      phoneNumber: string | null;
      photoURL: string | null;
    }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: FirestoreErrorInfo['operationType'],
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof FirestoreError ? `${error.code}: ${error.message}` : (error instanceof Error ? error.message : String(error)),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? false,
      isAnonymous: currentUser?.isAnonymous ?? false,
      tenantId: currentUser?.tenantId ?? null,
      providerData: currentUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName,
        email: p.email,
        phoneNumber: p.phoneNumber,
        photoURL: p.photoURL,
      })) ?? [],
    },
  };
  console.error('Firestore Error:', errorInfo);
  throw new Error(JSON.stringify(errorInfo));
}

// Connectivity verification using getDocFromServer
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(db, 'settings', 'global');
    await getDocFromServer(testDocRef);
    return true;
  } catch (error) {
    console.warn('Firestore initial getDocFromServer probe (may not exist yet):', error);
    return false;
  }
}
