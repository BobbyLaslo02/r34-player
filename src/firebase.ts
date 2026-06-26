import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAwDLlae_YcnEi7cIKtXFt49Ra7Zx59-TY',
  authDomain: 'r34players-fb021.firebaseapp.com',
  projectId: 'r34players-fb021',
  storageBucket: 'r34players-fb021.firebasestorage.app',
  messagingSenderId: '330283178352',
  appId: '1:330283178352:web:44baa897318f359d57d7b5',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

setPersistence(auth, browserLocalPersistence).catch(() => {})

export type AuthState = { user: User | null; loading: boolean }

let authListeners: ((s: AuthState) => void)[] = []
let currentState: AuthState = { user: null, loading: true }

onAuthStateChanged(auth, (user) => {
  currentState = { user, loading: false }
  authListeners.forEach(fn => fn(currentState))
})

export function onAuthChange(fn: (s: AuthState) => void): () => void {
  authListeners.push(fn)
  fn(currentState)
  return () => { authListeners = authListeners.filter(f => f !== fn) }
}

export function getCurrentUser(): User | null {
  return currentState.user
}

export function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export function logOut() {
  return signOut(auth)
}

function syncDocRef() {
  const user = getCurrentUser()
  if (!user) return null
  return doc(db, 'sync', user.uid)
}

export async function pushData(data: Record<string, string>): Promise<void> {
  const ref = syncDocRef()
  if (!ref) return
  await setDoc(ref, { data, lastUpdated: serverTimestamp() }, { merge: true })
}

export async function pullData(): Promise<Record<string, string> | null> {
  const ref = syncDocRef()
  if (!ref) return null
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data()?.data || null
}

export function listenData(callback: (data: Record<string, string> | null) => void): () => void {
  const ref = syncDocRef()
  if (!ref) return () => {}
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) { callback(null); return }
    callback(snap.data()?.data || null)
  })
}
