
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  deleteUser
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
  writeBatch,
  runTransaction
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

// Helper to remove undefined values from objects
const cleanObject = (obj: any) => {
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
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
        const cleanProduct = cleanObject(product);
        batch.set(newDocRef, { ...cleanProduct, id: newDocRef.id });
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

  register: async (userData: Partial<User>, pass: string) => {
    ensureFirebaseAuthEnabled();
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email!, pass);
    const user = userCredential.user;

    try {
        await updateProfile(user, {
            displayName: userData.name,
            photoURL: userData.avatar
        });

        const newUser: User = {
            ...userData,
            id: user.uid,
            isAdmin: userData.email === 'marcoseduardock@gmail.com',
            createdAt: serverTimestamp()
        } as User;
        
        await setDoc(doc(db, 'users', user.uid), cleanObject(newUser));
        
        return newUser;
    } catch (dbError) {
        console.error("Failed to create user document in Firestore, rolling back Auth user creation.", dbError);
        await deleteUser(user);
        throw dbError;
    }
  },

  logout: () => signOut(auth),
  
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        callback(userDoc.exists() ? userDoc.data() as User : null);
      } else {
        callback(null);
      }
    });
  },

  // Generic Firestore
  updateDocument: async (collectionName: string, id: string, data: any) => {
    await updateDoc(doc(db, collectionName, id), cleanObject(data));
  },

  addDocument: async (collectionName: string, data: any) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...cleanObject(data),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  subscribeToCollection: <T>(path: string, callback: (data: T[]) => void): () => void => {
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
        callback(data);
    }, (error) => {
        console.error(`Error subscribing to ${path}:`, error);
        callback([]);
    });
  },

  subscribeToDocument: <T>(collectionName: string, docId: string, callback: (data: T | null) => void): () => void => {
    return onSnapshot(doc(db, collectionName, docId), (doc) => {
      callback(doc.exists() ? { id: doc.id, ...doc.data() } as T : null);
    }, (error) => {
        console.error(`Error subscribing to ${collectionName}/${docId}:`, error);
        callback(null);
    });
  },

  // Specific Methods
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    return FirebaseService.subscribeToCollection<Product>('products', callback);
  },
  
  subscribeToSettings: (callback: (settings: AppSettings | null) => void) => {
    return FirebaseService.subscribeToDocument<AppSettings>('settings', 'app', callback);
  },

  // User
  updateUser: (userId: string, data: Partial<User>) => {
    return FirebaseService.updateDocument('users', userId, data);
  },
  subscribeToUser: (userId: string, callback: (user: User | null) => void) => {
    if (!userId) {
      callback(null);
      return () => {};
    }
    return FirebaseService.subscribeToDocument<User>('users', userId, callback);
  },

  // Cart
  subscribeToCart: (userId: string, callback: (items: CartItem[]) => void) => {
    if (!userId) {
        callback([]);
        return () => {};
    }
    return FirebaseService.subscribeToCollection<CartItem>(`users/${userId}/cart`, callback);
  },

  async addToCart(userId: string, product: Product) {
    const cartItemRef = doc(db, `users/${userId}/cart`, product.id);
    
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(cartItemRef);

      if (docSnap.exists()) {
        transaction.update(cartItemRef, { quantity: increment(1) });
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: 1,
        };
        if (product.promoPrice) {
          newItem.promoPrice = product.promoPrice;
        }
        transaction.set(cartItemRef, cleanObject(newItem));
      }
    });
  },

  removeFromCart: (userId: string, productId: string) => {
    return deleteDoc(doc(db, `users/${userId}/cart`, productId));
  },

  updateCartItemQuantity: (userId: string, productId: string, newQuantity: number) => {
    const cartItemRef = doc(db, `users/${userId}/cart`, productId);
    if (newQuantity <= 0) {
      return deleteDoc(cartItemRef);
    }
    return updateDoc(cartItemRef, { quantity: newQuantity });
  }
};