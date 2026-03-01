import { db } from './firebase.js';
import { doc, getDoc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firestore doc: households/my-household/data/main
const DOC_REF = doc(db, 'households', 'my-household', 'data', 'main');
const FIELD_NAME = 'homeBudgetData';

let unsubscribeFn = null;
let isApplyingRemote = false;

export async function loadFromFirestore() {
  try {
    const snap = await getDoc(DOC_REF);
    if (snap.exists()) {
      const d = snap.data();
      return d && d[FIELD_NAME] ? d[FIELD_NAME] : null;
    }
    return null;
  } catch (err) {
    console.error('loadFromFirestore failed:', err);
    throw err;
  }
}

export async function saveToFirestore(data) {
  // Prevent write-loop when we just applied a remote snapshot locally.
  if (isApplyingRemote) return;

  try {
    await setDoc(DOC_REF, { [FIELD_NAME]: data }, { merge: true });
  } catch (err) {
    console.error('saveToFirestore failed:', err);
    throw err;
  }
}

export function subscribeToFirestore(onData) {
  if (unsubscribeFn) unsubscribeFn();

  unsubscribeFn = onSnapshot(
    DOC_REF,
    (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      if (!d || !d[FIELD_NAME]) return;

      isApplyingRemote = true;
      try {
        onData(d[FIELD_NAME]);
      } finally {
        // tiny delay so any immediate saveData() calls don't loop
        setTimeout(() => { isApplyingRemote = false; }, 50);
      }
    },
    (err) => console.error('subscribeToFirestore error:', err)
  );

  return unsubscribeFn;
}

export function unsubscribeFromFirestore() {
  if (unsubscribeFn) unsubscribeFn();
  unsubscribeFn = null;
}
