// ===========================
// MYRIGHT — SHARED FIREBASE CONFIG
// Replace these values with your actual Firebase project settings
// from https://console.firebase.google.com
// ===========================

export const firebaseConfig = {
  apiKey: "AIzaSyAO6trpZKCvCm4xwuuiCMlLVhmJOdZ_Krc",
  authDomain: "my-right-c8924.firebaseapp.com",
  projectId: "my-right-c8924",
  storageBucket: "my-right-c8924.firebasestorage.app",
  messagingSenderId: "879694032704",
  appId: "1:879694032704:web:c36729fe7fa249076b94a5"
};

// ===========================
// GUEST / SKIP LOGIN
// Users who click "Skip" get a guest session stored in localStorage.
// They can generate documents but cannot save history.
// ===========================

export function setGuestMode() {
  localStorage.setItem('mr_guest', '1');
}

export function isGuest() {
  return localStorage.getItem('mr_guest') === '1';
}

export function clearGuest() {
  localStorage.removeItem('mr_guest');
}
