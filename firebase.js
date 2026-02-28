// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAwkLkbyuiuHaMGpU8pJ5DsWi33i44Ljv4",
  authDomain: "production-mode-290db.firebaseapp.com",
  projectId: "production-mode-290db",
  storageBucket: "production-mode-290db.firebasestorage.app",
  messagingSenderId: "365690860963",
  appId: "1:365690860963:web:84ad0e1731fd3aa4ccd616",
  measurementId: "G-G5HK6VM4L0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Required because your Firestore rules require an authenticated member UID
export async function ensureSignedIn() {
  // already signed in?
  if (auth.currentUser) return auth.currentUser;

  // wait for auth init
  const existing = await new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u || null);
    });
  });
  if (existing) return existing;

  // minimal login (no UI changes)
  const email = prompt("Budget Sync Login: enter email");
  const pass = prompt("Budget Sync Login: enter password");
  if (!email || !pass) throw new Error("Login cancelled");

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (err) {
    // If the account doesn't exist yet, create it
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }
}
