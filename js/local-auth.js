// ===========================
// MYRIGHT v5 — AUTH & DATA LAYER
// localStorage-based (mirrors Firebase interface)
// Switch to firebase.js for production
// ===========================

const USERS_KEY = 'mr_users';
const SESSION_KEY = 'mr_session';
const DOCS_KEY = 'mr_documents';
const PURCHASES_KEY = 'mr_purchases';
const ANALYTICS_KEY = 'mr_analytics';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
}
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }
function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ── Purchases ─────────────────────────────────────────────────────────────────
window.MRPurchases = {
  getAll(uid) {
    try {
      const all = JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]');
      return uid ? all.filter(p => p.userId === uid) : all;
    } catch { return []; }
  },
  hasPurchased(uid, docId) {
    return this.getAll(uid).some(p => p.docId === docId);
  },
  hasBundlePurchased(uid, bundleId) {
    return this.getAll(uid).some(p => p.bundleId === bundleId);
  },
  // Returns all doc IDs user owns from bundles
  getBundleDocIds(uid) {
    const all = this.getAll(uid);
    const ids = new Set();
    all.filter(p => p.bundleId && p.bundleDocIds).forEach(p => p.bundleDocIds.forEach(id => ids.add(id)));
    return ids;
  },
  addPurchase(uid, type, id, name, amount, extra = {}) {
    const all = JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]');
    all.push({
      id: genId(),
      userId: uid,
      type, // 'document' | 'bundle' | 'subscription'
      docId: type === 'document' ? id : null,
      bundleId: type === 'bundle' ? id : null,
      bundleDocIds: extra.bundleDocIds || null,
      planId: type === 'subscription' ? id : null,
      name,
      amount,
      purchasedAt: new Date().toISOString()
    });
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(all));
  }
};

// ── Analytics ──────────────────────────────────────────────────────────────────
window.MRAnalytics = {
  _key(uid) { return `${ANALYTICS_KEY}_${uid}`; },
  get(uid) {
    try { return JSON.parse(localStorage.getItem(this._key(uid)) || '{}'); } catch { return {}; }
  },
  trackGeneration(uid, docType, docName, price) {
    const data = this.get(uid);
    const month = new Date().toISOString().slice(0, 7);
    data.total = (data.total || 0) + 1;
    data.monthly = data.monthly || {};
    data.monthly[month] = (data.monthly[month] || 0) + 1;
    data.byType = data.byType || {};
    data.byType[docType] = (data.byType[docType] || 0) + 1;
    data.byTypeName = data.byTypeName || {};
    data.byTypeName[docType] = docName;
    // Track actual lawyer fees saved (from docs-catalog)
    data.lawyerSaved = (data.lawyerSaved || 0) + (price || 0);
    localStorage.setItem(this._key(uid), JSON.stringify(data));
  },
  getMonthlyCount(uid) {
    const data = this.get(uid);
    const month = new Date().toISOString().slice(0, 7);
    return (data.monthly || {})[month] || 0;
  },
  getTopDocTypes(uid, limit = 4) {
    const data = this.get(uid);
    const byType = data.byType || {};
    return Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([type, count]) => ({ id: type, name: data.byTypeName?.[type] || type, count }));
  }
};

// ── Auth API ───────────────────────────────────────────────────────────────────
window.MRAuth = {
  currentUser() { return getSession(); },

  signUp(name, email, password) {
    if (!name || !email || !password) return { error: 'All fields are required.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
    const users = getUsers();
    const key = email.toLowerCase().trim();
    if (users[key]) return { error: 'This email is already registered.' };
    const user = {
      uid: genId(),
      name: name.trim(),
      email: key,
      password,
      plan: 'free',          // ← always free on signup
      planExpiry: null,
      docsGenerated: 0,
      createdAt: new Date().toISOString()
    };
    users[key] = user;
    saveUsers(users);
    const session = { uid: user.uid, name: user.name, email: user.email, plan: 'free', planExpiry: null };
    saveSession(session);
    return { user: session };
  },

  signIn(email, password) {
    if (!email || !password) return { error: 'Email and password are required.' };
    const users = getUsers();
    const key = email.toLowerCase().trim();
    const user = users[key];
    if (!user) return { error: 'No account found with this email.' };
    if (user.password !== password) return { error: 'Incorrect password.' };
    // Always read fresh plan from user record (not cached)
    const session = { uid: user.uid, name: user.name, email: user.email, plan: user.plan, planExpiry: user.planExpiry || null };
    saveSession(session);
    return { user: session };
  },

  signInWithGoogle() {
    // Simulate Google login: ask for email, create if new, always free plan
    const email = prompt('Google Sign-In — enter your email address:');
    if (!email || !email.includes('@')) return { error: 'Cancelled or invalid email.' };
    const users = getUsers();
    const key = email.toLowerCase().trim();
    if (!users[key]) {
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      users[key] = {
        uid: genId(), name, email: key, password: '',
        plan: 'free', planExpiry: null, docsGenerated: 0,
        createdAt: new Date().toISOString()
      };
      saveUsers(users);
    }
    const user = users[key];
    const session = { uid: user.uid, name: user.name, email: user.email, plan: user.plan, planExpiry: user.planExpiry || null };
    saveSession(session);
    return { user: session };
  },

  signOut() { clearSession(); },

  getUserData() {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    return Object.values(users).find(u => u.uid === session.uid) || null;
  },

  // Get fresh plan from user record (not session cache)
  getPlan() {
    const data = this.getUserData();
    if (!data) return 'free';
    // Check expiry
    if (data.plan !== 'free' && data.planExpiry) {
      if (new Date(data.planExpiry) < new Date()) {
        // Plan expired — downgrade
        this.updateField('plan', 'free');
        this.updateField('planExpiry', null);
        const sess = getSession();
        if (sess) { sess.plan = 'free'; sess.planExpiry = null; saveSession(sess); }
        return 'free';
      }
    }
    return data.plan || 'free';
  },

  isPro() {
    const plan = this.getPlan();
    return plan === 'pro' || plan === 'yearly';
  },

  upgradePlan(planId) {
    const session = getSession();
    if (!session) return false;
    const users = getUsers();
    const user = Object.values(users).find(u => u.uid === session.uid);
    if (!user) return false;
    user.plan = planId;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (planId === 'yearly' ? 12 : 1));
    user.planExpiry = expiry.toISOString();
    users[user.email] = user;
    saveUsers(users);
    // Update session
    session.plan = planId;
    session.planExpiry = user.planExpiry;
    saveSession(session);
    MRPurchases.addPurchase(session.uid, 'subscription', planId,
      planId === 'yearly' ? 'Pro Yearly' : 'Pro Monthly',
      planId === 'yearly' ? 1499 : 199);
    return true;
  },

  resetPassword(email, newPassword) {
    const users = getUsers();
    const key = email.toLowerCase().trim();
    const user = users[key];
    if (!user) return { error: 'No account found with this email.' };
    user.password = newPassword;
    users[key] = user;
    saveUsers(users);
    return { success: true };
  },

  updateField(field, value) {
    const session = getSession();
    if (!session) return;
    const users = getUsers();
    const user = Object.values(users).find(u => u.uid === session.uid);
    if (user) { user[field] = value; users[user.email] = user; saveUsers(users); }
  },

  requireAuth() {
    const session = getSession();
    if (!session) {
      const dest = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `login.html?next=${dest}`;
      return null;
    }
    return session;
  }
};

// ── Document Storage ───────────────────────────────────────────────────────────
window.MRDocs = {
  getAll(uid) {
    try {
      const all = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
      return uid ? all.filter(d => d.userId === uid).reverse() : all;
    } catch { return []; }
  },
  save(uid, docType, docName, content, lawyerFee) {
    try {
      const all = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
      const entry = {
        id: genId(), userId: uid, docType, docName, content,
        lawyerFee: lawyerFee || 0,
        createdAt: new Date().toISOString()
      };
      all.push(entry);
      try { localStorage.setItem(DOCS_KEY, JSON.stringify(all)); }
      catch (e) {
        const pruned = all.slice(-80);
        try { localStorage.setItem(DOCS_KEY, JSON.stringify(pruned)); }
        catch (e2) { return null; }
      }
      // Update doc count in user record
      const users = getUsers();
      const user = Object.values(users).find(u => u.uid === uid);
      if (user) { user.docsGenerated = (user.docsGenerated || 0) + 1; users[user.email] = user; saveUsers(users); }
      // Track analytics with lawyer fee saved
      MRAnalytics.trackGeneration(uid, docType, docName, lawyerFee || 0);
      return entry;
    } catch (e) { return null; }
  },
  delete(id) {
    const all = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
    localStorage.setItem(DOCS_KEY, JSON.stringify(all.filter(d => d.id !== id)));
  },
  get(id) {
    const all = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
    return all.find(d => d.id === id) || null;
  }
};

// ── Toast ──────────────────────────────────────────────────────────────────────
window.MRToast = function(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  const icons = { success: '✅', error: '❌', warning: '⚡', info: 'ℹ️' };
  t.innerHTML = `${icons[type] || ''} ${msg}`;
  t.className = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', 3500);
};

// ── Bundle Catalog ─────────────────────────────────────────────────────────────
window.BUNDLES = [
  {
    id: 'bundle_affidavit',
    name: 'Affidavit Starter Pack',
    icon: '📜',
    description: '5 most-used affidavits for all personal needs',
    docs: ['affidavit','address_proof','income_affidavit','nationality_affidavit','dob_affidavit'],
    docNames: ['General Affidavit','Address Proof Affidavit','Income Affidavit','Nationality Affidavit','DOB Affidavit'],
    normalPrice: 395,
    bundlePrice: 199,
    badge: '🔥 Most Popular'
  },
  {
    id: 'bundle_property',
    name: 'Property Agreement Pack',
    icon: '🏠',
    description: 'Complete property documentation toolkit',
    docs: ['rent_agreement','property_affidavit','possession_letter','mutation_affidavit','society_noc'],
    docNames: ['Rent Agreement','Property Ownership Affidavit','Possession Handover Letter','Property Mutation Affidavit','Society NOC'],
    normalPrice: 625,
    bundlePrice: 299,
    badge: '💼 Best Value'
  },
  {
    id: 'bundle_employment',
    name: 'Employment Document Pack',
    icon: '💼',
    description: 'Complete HR & employment document set',
    docs: ['offer_letter','appointment_letter','experience_cert','salary_certificate','relieving_letter'],
    docNames: ['Offer Letter','Appointment Letter','Experience Certificate','Salary Certificate','Relieving Letter'],
    normalPrice: 415,
    bundlePrice: 199,
    badge: '⚡ Quick Access'
  },
  {
    id: 'bundle_freelancer',
    name: 'Freelancer Legal Pack',
    icon: '🖊️',
    description: 'Everything a freelancer needs to stay protected',
    docs: ['freelance_contract','nda','service_agreement','payment_agreement','loan_acknowledgement'],
    docNames: ['Freelance Contract','NDA','Service Agreement','Payment Agreement','Loan Acknowledgement'],
    normalPrice: 745,
    bundlePrice: 349,
    badge: '🌟 For Freelancers'
  }
];
