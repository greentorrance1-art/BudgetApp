import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAwkLkbyuiuHaMGpU8pJ5DsWi33i44Ljv4",
  authDomain: "production-mode-290db.firebaseapp.com",
  projectId: "production-mode-290db",
  storageBucket: "production-mode-290db.firebasestorage.app",
  messagingSenderId: "365690860963",
  appId: "1:365690860963:web:84ad0e1731fd3aa4ccd616",
  measurementId: "G-G5HK6VM4L0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, onAuthStateChanged };
