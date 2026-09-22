import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Safe helper to obtain FirebaseApp on client only
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!firebaseConfig.apiKey) return null;

  try {
    if (!getApps().length) {
      return initializeApp(firebaseConfig);
    }
    return getApp();
  } catch (err) {
    console.warn('Firebase initializeApp warning:', err);
    return null;
  }
}

// Safe helper to obtain Firebase Auth instance
export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    return getAuth(app);
  } catch (err) {
    console.warn('Firebase getAuth warning:', err);
    return null;
  }
}

// Fallback proxy to ensure importing `auth` never triggers unhandled exceptions during build
export const auth: Auth = new Proxy({} as Auth, {
  get(target, prop, receiver) {
    const liveAuth = getFirebaseAuth();
    if (!liveAuth) return undefined;
    const val = (liveAuth as any)[prop];
    return typeof val === 'function' ? val.bind(liveAuth) : val;
  }
}) as Auth;

// Helper to initialize invisible reCAPTCHA verifier on browser
export function setupRecaptcha(containerId = 'recaptcha-container'): RecaptchaVerifier | null {
  if (typeof window === 'undefined') return null;

  try {
    const activeAuth = getFirebaseAuth();
    if (!activeAuth) {
      console.warn('Firebase Auth is not initialized or API key is missing.');
      return null;
    }

    // If verifier already exists and is rendered, clear it
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        // Ignore clear error if not rendered
      }
    }

    const verifier = new RecaptchaVerifier(activeAuth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired, please try again.');
      },
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  } catch (error) {
    console.error('Error creating RecaptchaVerifier:', error);
    return null;
  }
}

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
export default getFirebaseApp;
