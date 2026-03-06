import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Product, Order, Coupon, AppSettings, Ingredient, WalletTransaction } from '../types';

export const FirebaseService = {
  // Auth
  login: async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  },

  register: async (userData: Partial<User>, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email!, pass);
    const newUser: User = {
      ...userData,
      id: userCredential.user.uid,
      isAdmin: userData.email === 'marcoseduardock@gmail.com',
      createdAt: new Date().toISOString(),
    } as User;
    
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    return newUser;
  },

  logout: () => signOut(auth),

  // Generic Firestore Helpers
  getCollection: async <T>(collectionName: string): Promise<T[]> => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  },

  saveDocument: async (collectionName: string, id: string, data: any) => {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
  },

  addDocument: async (collectionName: string, data: any) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Real-time Listeners
  subscribeToCollection: (collectionName: string, callback: (data: any[]) => void) => {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  // Specific Methods
  getProducts: () => FirebaseService.getCollection<Product>('products'),
  getOrders: () => FirebaseService.getCollection<Order>('orders'),
  getUsers: () => FirebaseService.getCollection<User>('users'),
  getSettings: async () => {
    const docSnap = await getDoc(doc(db, 'settings', 'app'));
    return docSnap.exists() ? (docSnap.data() as AppSettings) : null;
  },
  saveSettings: (settings: AppSettings) => FirebaseService.saveDocument('settings', 'app', settings),
};
