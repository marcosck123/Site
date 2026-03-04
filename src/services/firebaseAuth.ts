import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './firebase';

export async function firebaseLogin(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseRegister(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function firebaseLogout() {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return onAuthStateChanged(auth, callback);
}
