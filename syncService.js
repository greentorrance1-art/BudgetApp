import { db } from './firebase.js';
import { doc, getDoc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const FIELD_NAME = 'homeBudgetData';
const HOUSEHOLD_DOC_PATH = 'households/my-household/data/main';

let unsubscribe = null;
let isSyncing = false;

export async function loadFromFirestore() {
    try {
        console.log('[Firestore] Loading from:', HOUSEHOLD_DOC_PATH);
        const docRef = doc(db, 'households/my-household/data', 'main');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data[FIELD_NAME]) {
                console.log('[Firestore] Data loaded successfully');
                return data[FIELD_NAME];
            }
        }
        console.log('[Firestore] No data found in Firestore');
        return null;
    } catch (error) {
        console.error('[Firestore] Error loading:', error.code, error.message);
        return null;
    }
}

export async function saveToFirestore(data) {
    if (isSyncing) {
        console.log('[Firestore] Skipping save (sync in progress)');
        return;
    }

    try {
        console.log('[Firestore] Saving to:', HOUSEHOLD_DOC_PATH);
        const docRef = doc(db, 'households/my-household/data', 'main');
        await setDoc(docRef, {
            [FIELD_NAME]: data
        }, { merge: true });
        console.log('[Firestore] Save complete');
    } catch (error) {
        console.error('[Firestore] Error saving:', error.code, error.message);
    }
}

export function subscribeToFirestore(callback) {
    console.log('[Firestore] Starting real-time listener');
    const docRef = doc(db, 'households/my-household/data', 'main');

    unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data[FIELD_NAME]) {
                console.log('[Firestore] Real-time update received');
                isSyncing = true;
                callback(data[FIELD_NAME]);
                setTimeout(() => {
                    isSyncing = false;
                }, 100);
            }
        }
    }, (error) => {
        console.error('[Firestore] Listener error:', error.code, error.message);
    });

    return unsubscribe;
}

export function unsubscribeFromFirestore() {
    if (unsubscribe) {
        console.log('[Firestore] Stopping listener');
        unsubscribe();
        unsubscribe = null;
    }
}
