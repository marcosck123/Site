import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  updateDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  increment, 
  writeBatch 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigValid } from '../firebase';
import { User, Product, Order, Coupon, AppSettings, CartItem, InitialData } from '../types';

// This is temporary, to hold the initial data for seeding.
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COUPONS } from './initialData';

const ensureFirebaseAuthEnabled = () => {
  if (!isFirebaseConfigValid) {
    throw new Error('firebase/config-missing');
  }
};

export const FirebaseService = {
  // Seeding
  seedInitialData: async () => {
    const productsRef = collection(db, 'products');
    const productsSnap = await getDocs(query(productsRef));
    if (productsSnap.empty) {
      console.log('Seeding initial products...');
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach(product => {
        const newDocRef = doc(productsRef);
        batch.set(newDocRef, { ...product, id: newDocRef.id });
      });
      await batch.commit();
    }

    const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
    if (!settingsDoc.exists() || !settingsDoc.data().categories?.length) {
        console.log('Seeding initial categories and settings...');
        await setDoc(doc(db, 'settings', 'app'), {
            categories: INITIAL_CATEGORIES,
            coupons: INITIAL_COUPONS
        }, { merge: true });
    }
  },

  // Auth
  login: async (email: string, pass: string) => {
    ensureFirebaseAuthEnabled();
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  },

  //The validation is done in the AuthModal.tsx file
  register: async (userData: Partial<User>, pass: string) => {
    ensureFirebaseAuthEnabled();
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email!, pass);
    
    await updateProfile(userCredential.user, {
      displayName: userData.name,
      photoURL: userData.avatar
    });

    const newUser: User = {
      ...userData,
      id: userCredential.user.uid,
      isAdmin: userData.email === 'marcoseduardock@gmail.com',
      createdAt: serverTimestamp()
    } as User;
    
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    return newUser;
  },

  logout: () => signOut(auth),

  // Generic Firestore
  updateDocument: async (collectionName: string, id: string, data: any) => {
    await updateDoc(doc(db, collectionName, id), data);
  },

  addDocument: async (collectionName: string, data: any) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  subscribeToCollection: (path: string, callback: (data: any[]) => void) => {
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  subscribeToDocument: <T>(collectionName: string, docId: string, callback: (data: T | null) => void) => {
    return onSnapshot(doc(db, collectionName, docId), (doc) => {
      callback(doc.exists() ? { id: doc.id, ...doc.data() } as T : null);
    });
  },

  // Specific Methods
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    return FirebaseService.subscribeToCollection('products', callback);
  },
  
  getSettings: async () => {
    const docSnap = await getDoc(doc(db, 'settings', 'app'));
    return docSnap.exists() ? (docSnap.data() as AppSettings) : null;
  },

  // User
  updateUser: (userId: string, data: Partial<User>) => {
    return FirebaseService.updateDocument('users', userId, data);
  },
  subscribeToUser: (userId: string, callback: (user: User | null) => void) => {
    return FirebaseService.subscribeToDocument<User>('users', userId, callback);
  },

  // Cart
  subscribeToCart: (userId: string, callback: (items: CartItem[]) => void) => {
    return FirebaseService.subscribeToCollection(`users/${userId}/cart`, callback);
  },

  async addToCart(userId: string, product: Product) {
    const cartItemRef = doc(db, `users/${userId}/cart`, product.id);
    const docSnap = await getDoc(cartItemRef);

    if (docSnap.exists()) {
      await updateDoc(cartItemRef, { quantity: increment(1) });
    } else {
      const newItem: CartItem = { ...product, quantity: 1 };
      await setDoc(cartItemRef, newItem);
    }
  },

  removeFromCart: (userId: string, productId: string) => {
    return deleteDoc(doc(db, `users/${userId}/cart`, productId));
  },

  updateCartItemQuantity: (userId: string, productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      return FirebaseService.removeFromCart(userId, productId);
    }
    return updateDoc(doc(db, `users/${userId}/cart`, productId), { quantity: newQuantity });
  }
};
