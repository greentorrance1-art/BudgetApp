import { db } from './firebase.js';
import { doc, getDoc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const HOUSEHOLD_DOC = 'households/my-household/data/main';
const FIELD_NAME = 'homeBudgetData';

let unsubscribe = null;
let isSyncing = false;

export async function loadFromFirestore() {
    try {
        const docRef = doc(db, 'households/my-household/data', 'main');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data[FIELD_NAME]) {
                return data[FIELD_NAME];
            }
        }
        return null;
    } catch (error) {
        console.error('Error loading from Firestore:', error);
        return null;
    }
}

export async function saveToFirestore(data) {
    if (isSyncing) {
        return;
    }

    try {
        const docRef = doc(db, 'households/my-household/data', 'main');
        await setDoc(docRef, {
            [FIELD_NAME]: data
        }, { merge: true });
    } catch (error) {
        console.error('Error saving to Firestore:', error);
    }
}

export function subscribeToFirestore(callback) {
    const docRef = doc(db, 'households/my-household/data', 'main');

    unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data[FIELD_NAME]) {
                isSyncing = true;
                callback(data[FIELD_NAME]);
                setTimeout(() => {
                    isSyncing = false;
                }, 100);
            }
        }
    }, (error) => {
        console.error('Error listening to Firestore:', error);
    });

    return unsubscribe;
}

export function unsubscribeFromFirestore() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
}
