import { db, ensureSignedIn } from "./firebase.js";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const HOUSEHOLD_ID = "my-household";

function budgetDocRef() {
  return doc(db, "households", HOUSEHOLD_ID, "data", "main");
}

export async function subscribeToBudget(onData) {
  await ensureSignedIn();
  return onSnapshot(budgetDocRef(), (snap) => {
    const docData = snap.data();
    onData(docData?.homeBudgetData ?? null);
  });
}

export async function writeBudget(homeBudgetData) {
  await ensureSignedIn();
  await setDoc(
    budgetDocRef(),
    { homeBudgetData, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function debounce(fn, delay = 600) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
