import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Use initializeFirestore with long polling to fix connectivity issues on some domains
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId as any);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user is new and record join
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create user document
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        walletBalance: 0
      }, { merge: true });

      // Add to join notifications for admin panel
      await addDoc(collection(db, 'join_notifications'), {
        userId: user.uid,
        userName: user.displayName || 'New User',
        userEmail: user.email,
        createdAt: serverTimestamp(),
        plan: 'Free' // Default plan
      });
    } else {
      // Update last login
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    }

    return user;
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

export const setupRecaptcha = (containerId: string) => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      }
    });
  }
  return (window as any).recaptchaVerifier;
};

export const sendPhoneOtp = async (phoneNumber: string, appVerifier: any) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Failed to send OTP', error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
