// ===========================
// MYRIGHT v11 — FIREBASE AUTH & DATA LAYER
// Replaces local-auth.js — all data stored in Firebase
// ===========================

const FB_CONFIG = {
  apiKey: "AIzaSyAO6trpZKCvCm4xwuuiCMlLVhmJOdZ_Krc",
  authDomain: "my-right-c8924.firebaseapp.com",
  projectId: "my-right-c8924",
  storageBucket: "my-right-c8924.firebasestorage.app",
  messagingSenderId: "879694032704",
  appId: "1:879694032704:web:c36729fe7fa249076b94a5"
};

// ── Firebase init (compat CDN, loaded via script tags in HTML) ────────────────
let _fbApp = null, _fbAuth = null, _fbDb = null;

function _initFB() {
  if (_fbDb) return true;
  try {
    if (!firebase.apps.length) {
      _fbApp = firebase.initializeApp(FB_CONFIG);
    } else {
      _fbApp = firebase.app();
    }
    _fbAuth = firebase.auth();
    _fbDb   = firebase.firestore();
    _fbDb.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    return true;
  } catch(e) {
    console.error('Firebase init error:', e);
    return false;
  }
}

// ── Session cache (minimal — source of truth is Firebase) ────────────────────
function _getSession() {
  try { return JSON.parse(localStorage.getItem('mr_session') || 'null'); } catch { return null; }
}
function _saveSession(s) {
  localStorage.setItem('mr_session', JSON.stringify(s));
}
function _clearSession() {
  localStorage.removeItem('mr_session');
}
function _genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── MRAuth ────────────────────────────────────────────────────────────────────
window.MRAuth = {

  currentUser() {
    return _getSession();
  },

  async signUp(name, email, password) {
    if (!_initFB()) return { error: 'Firebase unavailable. Check your internet.' };
    if (!name || !email || !password) return { error: 'All fields are required.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
    try {
      const cred = await _fbAuth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        plan: 'free',
        planExpiry: null,
        docsGenerated: 0,
        chatMessagesUsed: 0,
        chatPaid: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await _fbDb.collection('users').doc(cred.user.uid).set(userData);
      const session = { uid: cred.user.uid, name: name.trim(), email: email.toLowerCase().trim(), plan: 'free' };
      _saveSession(session);
      return { user: session };
    } catch(e) {
      return { error: _fbError(e.code) };
    }
  },

  async signIn(email, password) {
    if (!_initFB()) return { error: 'Firebase unavailable. Check your internet.' };
    if (!email || !password) return { error: 'Email and password are required.' };
    try {
      const cred = await _fbAuth.signInWithEmailAndPassword(email, password);
      const snap = await _fbDb.collection('users').doc(cred.user.uid).get();
      const data = snap.exists ? snap.data() : {};
      const session = {
        uid: cred.user.uid,
        name: data.name || cred.user.displayName || email.split('@')[0],
        email: email.toLowerCase().trim(),
        plan: data.plan || 'free',
        planExpiry: data.planExpiry || null
      };
      _saveSession(session);
      return { user: session };
    } catch(e) {
      return { error: _fbError(e.code) };
    }
  },

  async signInWithGoogle() {
    if (!_initFB()) return { error: 'Firebase unavailable.' };
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      // Use redirect for TWA/WebView compatibility
      if (window.matchMedia('(display-mode: standalone)').matches) {
        await _fbAuth.signInWithRedirect(provider);
        return { redirect: true };
      }
      const result = await _fbAuth.signInWithPopup(provider);
      const user = result.user;
      const snap = await _fbDb.collection('users').doc(user.uid).get();
      if (!snap.exists) {
        await _fbDb.collection('users').doc(user.uid).set({
          name: user.displayName || '',
          email: user.email,
          plan: 'free',
          planExpiry: null,
          docsGenerated: 0,
          chatMessagesUsed: 0,
          chatPaid: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      const data = snap.exists ? snap.data() : {};
      const session = {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email,
        plan: data.plan || 'free',
        planExpiry: data.planExpiry || null
      };
      _saveSession(session);
      return { user: session };
    } catch(e) {
      return { error: _fbError(e.code) };
    }
  },

  signOut() {
    if (_fbAuth) _fbAuth.signOut().catch(() => {});
    _clearSession();
  },

  async getUserData() {
    const session = _getSession();
    if (!session) return null;
    if (!_initFB()) return session;
    try {
      const snap = await _fbDb.collection('users').doc(session.uid).get();
      if (snap.exists) {
        const data = snap.data();
        // Refresh session with latest plan
        session.plan = data.plan || 'free';
        session.planExpiry = data.planExpiry || null;
        _saveSession(session);
        return { uid: session.uid, ...data };
      }
    } catch(e) {}
    return session;
  },

  getPlan() {
    const s = _getSession();
    if (!s) return 'free';
    const plan = s.plan || 'free';
    if (plan === 'free') return 'free';
    // Check expiry only for paid plans
    if (s.planExpiry) {
      try {
        if (new Date(s.planExpiry) < new Date()) {
          // Expired — reset session silently
          s.plan = 'free';
          s.planExpiry = null;
          _saveSession(s);
          return 'free';
        }
      } catch(e) {}
    }
    return plan;
  },

  isPro() {
    const p = this.getPlan();
    return p === 'pro' || p === 'yearly';
  },

  async upgradePlan(planId) {
    const session = _getSession();
    if (!session || !_initFB()) return false;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (planId === 'yearly' ? 12 : 1));
    const expiryISO = expiry.toISOString();
    try {
      await _fbDb.collection('users').doc(session.uid).update({
        plan: planId,
        planExpiry: expiryISO
      });
      session.plan = planId;
      session.planExpiry = expiryISO;
      _saveSession(session);
      return true;
    } catch(e) {
      // If Firestore update fails, still update session so UI reflects upgrade
      session.plan = planId;
      session.planExpiry = expiryISO;
      _saveSession(session);
      console.error('upgradePlan Firestore error:', e);
      return true; // Return true so UI still unlocks
    }
  },

  // Update a single field on the user Firestore doc + session cache
  async updateField(field, value) {
    const session = _getSession();
    if (!session || !_initFB()) return false;
    try {
      const update = {};
      update[field] = value;
      await _fbDb.collection('users').doc(session.uid).update(update);
      if (field in session) {
        session[field] = value;
        _saveSession(session);
      }
      return true;
    } catch(e) {
      console.error('updateField error:', e);
      return false;
    }
  },

  async resetPassword(email) {
    if (!_initFB()) return { error: 'Firebase unavailable.' };
    try {
      await _fbAuth.sendPasswordResetEmail(email);
      return { success: true };
    } catch(e) {
      return { error: _fbError(e.code) };
    }
  },

  requireAuth() {
    const session = _getSession();
    if (!session) {
      const dest = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `login.html?next=${dest}`;
      return null;
    }
    return session;
  },

  getDb() {
    _initFB();
    return _fbDb;
  }
};

// ── MRDocs — Firebase-backed ──────────────────────────────────────────────────
window.MRDocs = {
  async getAll(uid) {
    if (!_initFB()) return [];
    try {
      const snap = await _fbDb.collection('documents')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  },

  async save(uid, docType, docName, content, lawyerFee) {
    if (!_initFB()) return null;
    try {
      const entry = {
        userId: uid, docType, docName, content,
        lawyerFee: lawyerFee || 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const ref = await _fbDb.collection('documents').add(entry);
      // Increment doc count
      await _fbDb.collection('users').doc(uid).update({
        docsGenerated: firebase.firestore.FieldValue.increment(1)
      }).catch(() => {});
      return { id: ref.id, ...entry };
    } catch(e) { return null; }
  },

  async delete(id) {
    if (!_initFB()) return;
    try { await _fbDb.collection('documents').doc(id).delete(); } catch(e) {}
  },

  async get(id) {
    if (!_initFB()) return null;
    try {
      const snap = await _fbDb.collection('documents').doc(id).get();
      return snap.exists ? { id: snap.id, ...snap.data() } : null;
    } catch(e) { return null; }
  }
};

// ── MRPurchases — Firebase-backed ─────────────────────────────────────────────
window.MRPurchases = {
  async getAll(uid) {
    if (!_initFB()) return [];
    try {
      const snap = await _fbDb.collection('purchases')
        .where('userId', '==', uid)
        .orderBy('purchasedAt', 'desc')
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  },

  async hasPurchased(uid, docId) {
    if (!_initFB()) return false;
    try {
      const snap = await _fbDb.collection('purchases')
        .where('userId', '==', uid)
        .where('docId', '==', docId)
        .limit(1).get();
      return !snap.empty;
    } catch(e) { return false; }
  },

  async addPurchase(uid, type, id, name, amount, extra = {}) {
    if (!_initFB()) return;
    try {
      await _fbDb.collection('purchases').add({
        userId: uid, type,
        docId: type === 'document' ? id : null,
        bundleId: type === 'bundle' ? id : null,
        bundleDocIds: extra.bundleDocIds || null,
        planId: type === 'subscription' ? id : null,
        name, amount,
        purchasedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) {}
  }
};

// ── MRAnalytics — Firebase-backed ─────────────────────────────────────────────
window.MRAnalytics = {
  async trackGeneration(uid, docType, docName, price) {
    if (!_initFB()) return;
    const month = new Date().toISOString().slice(0, 7);
    try {
      const ref = _fbDb.collection('analytics').doc(uid);
      const snap = await ref.get();
      const data = snap.exists ? snap.data() : {};
      data.total = (data.total || 0) + 1;
      data.monthly = data.monthly || {};
      data.monthly[month] = (data.monthly[month] || 0) + 1;
      data.byType = data.byType || {};
      data.byType[docType] = (data.byType[docType] || 0) + 1;
      data.lawyerSaved = (data.lawyerSaved || 0) + (price || 0);
      await ref.set(data, { merge: true });
    } catch(e) {}
  },

  async getMonthlyCount(uid) {
    if (!_initFB()) return 0;
    const month = new Date().toISOString().slice(0, 7);
    try {
      const snap = await _fbDb.collection('analytics').doc(uid).get();
      if (!snap.exists) return 0;
      return (snap.data().monthly || {})[month] || 0;
    } catch(e) { return 0; }
  },

  async getTopDocTypes(uid, limit = 4) {
    if (!_initFB()) return [];
    try {
      const snap = await _fbDb.collection('analytics').doc(uid).get();
      if (!snap.exists) return [];
      const data = snap.data();
      return Object.entries(data.byType || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([type, count]) => ({ id: type, name: type, count }));
    } catch(e) { return []; }
  }
};

// ── Toast util ─────────────────────────────────────────────────────────────────
window.MRToast = function(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  const icons = { success: '✅', error: '❌', warning: '⚡', info: 'ℹ️' };
  t.innerHTML = `${icons[type] || ''} ${msg}`;
  t.className = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', 3500);
};

// ── Firebase error messages ───────────────────────────────────────────────────
function _fbError(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/invalid-credential': 'Incorrect email or password.'
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ── Bundle catalog (unchanged) ────────────────────────────────────────────────
window.BUNDLES = [
  {
    id: 'bundle_affidavit', name: 'Affidavit Starter Pack', icon: '📜',
    description: '5 most-used affidavits for all personal needs',
    docs: ['affidavit','address_proof','income_affidavit','nationality_affidavit','dob_affidavit'],
    docNames: ['General Affidavit','Address Proof Affidavit','Income Affidavit','Nationality Affidavit','DOB Affidavit'],
    normalPrice: 395, bundlePrice: 199, badge: '🔥 Most Popular'
  },
  {
    id: 'bundle_property', name: 'Property Agreement Pack', icon: '🏠',
    description: 'Complete property documentation toolkit',
    docs: ['rent_agreement','property_affidavit','possession_letter','mutation_affidavit','society_noc'],
    docNames: ['Rent Agreement','Property Ownership Affidavit','Possession Handover Letter','Property Mutation Affidavit','Society NOC'],
    normalPrice: 625, bundlePrice: 299, badge: '💼 Best Value'
  },
  {
    id: 'bundle_employment', name: 'Employment Document Pack', icon: '💼',
    description: 'Complete HR & employment document set',
    docs: ['offer_letter','appointment_letter','experience_cert','salary_certificate','relieving_letter'],
    docNames: ['Offer Letter','Appointment Letter','Experience Certificate','Salary Certificate','Relieving Letter'],
    normalPrice: 415, bundlePrice: 199, badge: '⚡ Quick Access'
  },
  {
    id: 'bundle_freelancer', name: 'Freelancer Legal Pack', icon: '🖊️',
    description: 'Everything a freelancer needs to stay protected',
    docs: ['freelance_contract','nda','service_agreement','payment_agreement','loan_acknowledgement'],
    docNames: ['Freelance Contract','NDA','Service Agreement','Payment Agreement','Loan Acknowledgement'],
    normalPrice: 745, bundlePrice: 349, badge: '🌟 For Freelancers'
  }
];

// ── Auto-init on load ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _initFB();
});
