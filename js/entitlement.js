// ===========================
// MYRIGHT — ENTITLEMENT MODULE (Production)
//
// Single source of truth for feature access decisions.
// ALL entitlement checks go through this module.
// Access is verified against Firestore — not localStorage alone.
// ===========================

window.MREntitlement = (function() {
  'use strict';

  // Cache result for current page session to avoid repeated Firestore reads
  let _cachedPlan     = null;
  let _cachedExpiry   = null;
  let _cachedUid      = null;
  let _cacheTimestamp = 0;
  const CACHE_TTL_MS  = 60 * 1000; // Re-verify with Firestore every 60s

  // ── Internal: fetch plan from Firestore (authoritative) ──────────────────
  async function _fetchPlanFromFirestore(uid) {
    const db = window.MRAuth && MRAuth.getDb ? MRAuth.getDb() : null;
    if (!db) return null;
    try {
      const snap = await db.collection('users').doc(uid).get();
      if (!snap.exists) return null;
      return snap.data();
    } catch(e) {
      console.error('MREntitlement: Firestore fetch failed', e);
      return null;
    }
  }

  // ── getPlan: always verify against Firestore; cache for 60s ─────────────
  async function getPlan(uid) {
    const now = Date.now();
    // Return cached result if still valid and same user
    if (_cachedUid === uid && (now - _cacheTimestamp) < CACHE_TTL_MS && _cachedPlan !== null) {
      return { plan: _cachedPlan, planExpiry: _cachedExpiry };
    }

    const data = await _fetchPlanFromFirestore(uid);
    if (!data) {
      // Firestore unavailable — fall back to localStorage cache (read-only, don't grant)
      const session = (() => { try { return JSON.parse(localStorage.getItem('mr_session') || 'null'); } catch { return null; } })();
      return { plan: session?.plan || 'free', planExpiry: session?.planExpiry || null };
    }

    const plan   = data.plan || 'free';
    const expiry = data.planExpiry || null;

    // Check expiry for paid plans
    let effectivePlan = plan;
    if (plan !== 'free' && expiry) {
      if (new Date(expiry) < new Date()) {
        effectivePlan = 'free'; // expired
      }
    }

    // Update cache
    _cachedPlan      = effectivePlan;
    _cachedExpiry    = expiry;
    _cachedUid       = uid;
    _cacheTimestamp  = now;

    // Keep localStorage in sync
    try {
      const session = JSON.parse(localStorage.getItem('mr_session') || 'null');
      if (session && session.uid === uid) {
        session.plan       = effectivePlan;
        session.planExpiry = expiry;
        localStorage.setItem('mr_session', JSON.stringify(session));
      }
    } catch(e) {}

    return { plan: effectivePlan, planExpiry: expiry };
  }

  // ── isPro: async, Firestore-verified ─────────────────────────────────────
  async function isPro(uid) {
    const { plan } = await getPlan(uid);
    return plan === 'pro' || plan === 'yearly';
  }

  // ── canGenerateDoc: checks plan + monthly usage limit ────────────────────
  async function canGenerateDoc(uid) {
    const { plan } = await getPlan(uid);
    if (plan === 'pro' || plan === 'yearly') return { allowed: true };

    // Free plan: check Firestore usage counter
    const db = window.MRAuth && MRAuth.getDb ? MRAuth.getDb() : null;
    if (!db) return { allowed: false, reason: 'offline' };

    try {
      const month  = new Date().toISOString().slice(0, 7);
      const snap   = await db.collection('analytics').doc(uid).get();
      const data   = snap.exists ? snap.data() : {};
      const used   = (data.monthly || {})[month] || 0;
      const FREE_LIMIT = 2;
      if (used >= FREE_LIMIT) {
        return { allowed: false, reason: 'limit', used, limit: FREE_LIMIT };
      }
      return { allowed: true, used, limit: FREE_LIMIT };
    } catch(e) {
      return { allowed: false, reason: 'error' };
    }
  }

  // ── canAccessChat: check if user has purchased chat or has pro plan ───────
  async function canAccessChat(uid) {
    const { plan } = await getPlan(uid);
    if (plan === 'pro' || plan === 'yearly') return { allowed: true };

    // Check chatPaid field in Firestore
    const db = window.MRAuth && MRAuth.getDb ? MRAuth.getDb() : null;
    if (!db) return { allowed: false };
    try {
      const snap = await db.collection('users').doc(uid).get();
      if (snap.exists && snap.data().chatPaid === true) return { allowed: true };
      return { allowed: false, reason: 'unpaid' };
    } catch(e) { return { allowed: false, reason: 'error' }; }
  }

  // ── hasBundleAccess: check purchase record in Firestore ──────────────────
  async function hasBundleAccess(uid, bundleId) {
    const { plan } = await getPlan(uid);
    if (plan === 'pro' || plan === 'yearly') return true; // Pro gets all bundles

    const db = window.MRAuth && MRAuth.getDb ? MRAuth.getDb() : null;
    if (!db) return false;
    try {
      const snap = await db.collection('purchases')
        .where('userId', '==', uid)
        .where('bundleId', '==', bundleId)
        .limit(1).get();
      return !snap.empty;
    } catch(e) { return false; }
  }

  // ── hasSingleDocAccess: check purchase for individual doc ────────────────
  async function hasSingleDocAccess(uid, docId) {
    const { plan } = await getPlan(uid);
    if (plan === 'pro' || plan === 'yearly') return true;

    const db = window.MRAuth && MRAuth.getDb ? MRAuth.getDb() : null;
    if (!db) return false;
    try {
      const snap = await db.collection('purchases')
        .where('userId', '==', uid)
        .where('docId', '==', docId)
        .limit(1).get();
      return !snap.empty;
    } catch(e) { return false; }
  }

  // ── showPaywall: standard UI helper ──────────────────────────────────────
  function showPaywall(reason, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const msgs = {
      limit:  '📄 You\'ve used your 2 free documents this month.',
      unpaid: '💬 Legal chat requires an active plan.',
      error:  '⚠️ Could not verify your access. Please refresh.',
      offline:'📵 Offline — access cannot be verified.'
    };
    container.innerHTML = `
      <div style="text-align:center;padding:32px 20px;background:var(--surface);border-radius:16px;border:1.5px solid rgba(212,168,71,0.2);">
        <div style="font-size:36px;margin-bottom:12px;">🔒</div>
        <div style="font-size:15px;font-weight:600;color:var(--text1);margin-bottom:8px;">${msgs[reason] || 'Access restricted'}</div>
        <div style="font-size:13px;color:var(--text3);margin-bottom:20px;">Upgrade to Pro for unlimited access to all features.</div>
        <a href="subscription.html" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#d4a847,#b8932e);color:#070c19;font-weight:700;border-radius:12px;text-decoration:none;font-size:14px;">View Plans →</a>
      </div>`;
  }

  // Public API
  return { getPlan, isPro, canGenerateDoc, canAccessChat, hasBundleAccess, hasSingleDocAccess, showPaywall };
})();
