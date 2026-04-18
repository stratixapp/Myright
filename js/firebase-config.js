// ===========================
// MYRIGHT — SHARED FIREBASE CONFIG
// Firebase client config is intentionally public — it identifies your project
// but does NOT grant access. Access is controlled by Firestore Security Rules
// and Firebase Auth. NEVER put Razorpay secret key or Anthropic key here.
// See: https://firebase.google.com/docs/projects/api-keys
// ===========================

export const firebaseConfig = {
  apiKey:            "AIzaSyAO6trpZKCvCm4xwuuiCMlLVhmJOdZ_Krc",
  authDomain:        "my-right-c8924.firebaseapp.com",
  projectId:         "my-right-c8924",
  storageBucket:     "my-right-c8924.firebasestorage.app",
  messagingSenderId: "879694032704",
  appId:             "1:879694032704:web:c36729fe7fa249076b94a5"
};

// ===========================
// WORKER URL — set this to your deployed Cloudflare Worker
// Used for: document generation, payment order creation, payment verification
// RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are NEVER in this file.
// They live in Cloudflare Worker secrets (Settings → Variables → Secrets).
// ===========================
export const WORKER_URL = "https://myright-api.ananthuapi123.workers.dev";

// ===========================
// PRICING — single source of truth
// These values match what the Cloudflare Worker enforces server-side.
// If you change these, update cloudflare-worker.js PLAN_AMOUNTS too.
// ===========================
export const PRICING = {
  monthly:           { amount: 199,  label: "Pro Monthly", period: "month" },
  yearly:            { amount: 1499, label: "Pro Yearly",  period: "year"  },
  bundle_affidavit:  { amount: 199,  label: "Affidavit Starter Pack" },
  bundle_property:   { amount: 299,  label: "Property Agreement Pack" },
  bundle_employment: { amount: 199,  label: "Employment Document Pack" },
  bundle_freelancer: { amount: 349,  label: "Freelancer Legal Pack" }
};

// ===========================
// GUEST / SKIP LOGIN
// ===========================
export function setGuestMode() { localStorage.setItem('mr_guest', '1'); }
export function isGuest()       { return localStorage.getItem('mr_guest') === '1'; }
export function clearGuest()    { localStorage.removeItem('mr_guest'); }
