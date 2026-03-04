import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

function getDb() {
  if (!db) throw new Error('Firestore is not initialized');
  return db;
}

export async function getDocument(collectionName: string, id: string) {
  const snap = await getDoc(doc(getDb(), collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setDocument(collectionName: string, id: string, data: DocumentData) {
  return setDoc(doc(getDb(), collectionName, id), data);
}

export async function addDocument(collectionName: string, data: DocumentData) {
  return addDoc(collection(getDb(), collectionName), data);
}

export async function updateDocument(collectionName: string, id: string, data: DocumentData) {
  return updateDoc(doc(getDb(), collectionName, id), data);
}

export async function deleteDocument(collectionName: string, id: string) {
  return deleteDoc(doc(getDb(), collectionName, id));
}

export async function getCollection(collectionName: string) {
  const snap = await getDocs(collection(getDb(), collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function queryCollection(collectionName: string, ...queryConstraints: QueryConstraint[]) {
  const q = query(collection(getDb(), collectionName), ...queryConstraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
