import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAwDLlae_YcnEi7cIKtXFt49Ra7Zx59-TY',
  authDomain: 'r34players-fb021.firebaseapp.com',
  projectId: 'r34players-fb021',
  storageBucket: 'r34players-fb021.firebasestorage.app',
  messagingSenderId: '330283178352',
  appId: '1:330283178352:web:44baa897318f359d57d7b5',
  measurementId: 'G-18ZNVL8XNT',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

let currentUser: User | null = null
let authResolve: ((u: User | null) => void) | null = null

onAuthStateChanged(auth, (user) => {
  currentUser = user
  if (authResolve) { authResolve(user); authResolve = null }
})

export function waitForAuth(): Promise<User | null> {
  if (currentUser) return Promise.resolve(currentUser)
  return new Promise(r => { authResolve = r })
}

export async function ensureSignedIn(): Promise<User> {
  if (currentUser) return currentUser
  const cred = await signInAnonymously(auth)
  currentUser = cred.user
  return cred.user
}

export function getUid(): string | null {
  return currentUser?.uid || null
}

function dataDoc() {
  const uid = getUid()
  if (!uid) return null
  return doc(db, 'sync', uid)
}

export async function pushData(data: Record<string, string>): Promise<void> {
  const ref = dataDoc()
  if (!ref) return
  await setDoc(ref, { data, lastUpdated: serverTimestamp() }, { merge: true })
}

export async function pullData(): Promise<Record<string, string> | null> {
  const ref = dataDoc()
  if (!ref) return null
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const d = snap.data()
  return d?.data || null
}

export function listenData(callback: (data: Record<string, string> | null) => void): () => void {
  const ref = dataDoc()
  if (!ref) return () => {}
  const unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) { callback(null); return }
    callback(snap.data()?.data || null)
  })
  return unsub
}

export async function generateCode(): Promise<string> {
  const uid = getUid()
  if (!uid) throw new Error('Not signed in')
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  await setDoc(doc(db, 'codes', code), { uid, createdAt: serverTimestamp() })
  return code
}

export async function findByCode(code: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'codes', code.toUpperCase()))
  if (!snap.exists()) return null
  return snap.data().uid || null
}
