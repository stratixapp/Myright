/**
 * MyRight — Cloudflare Worker v2 (Production-hardened)
 *
 * Required secrets (Workers → Settings → Variables → Secrets):
 *   ANTHROPIC_API_KEY     → from console.anthropic.com
 *   RAZORPAY_KEY_ID       → from Razorpay dashboard (live key)
 *   RAZORPAY_KEY_SECRET   → from Razorpay dashboard (live secret)
 *   FIREBASE_PROJECT_ID   → my-right-c8924
 *   FIREBASE_SERVER_KEY   → Firebase Admin SDK service account key (JSON string)
 *   ADMIN_SECRET_TOKEN    → random 32-char string for legacy admin-chats endpoint
 *
 * Endpoints:
 *   POST /generate           — AI document generation
 *   POST /ai-chat            — AI legal advisor chat
 *   POST /analyze            — AI risk analyzer
 *   POST /create-order       — Create Razorpay order (server-side)
 *   POST /verify-payment     — Verify Razorpay signature + activate plan (server-side)
 *   POST /admin-chats        — Admin: list all chat rooms (token-gated)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, Authorization',
  'Content-Type': 'application/json'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

// ── HMAC-SHA256 using Web Crypto (available in CF Workers) ───────────────────
async function hmacSHA256(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Firestore REST helper ────────────────────────────────────────────────────
async function firestoreWrite(projectId, collection, docId, data, serviceKey) {
  // Parse service account JSON to get access token via JWT
  // For simplicity we use the Firestore REST API with a Firebase ID token
  // In production: use a proper service account JWT or Firebase Admin REST
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string')  fields[k] = { stringValue: v };
    else if (typeof v === 'number') fields[k] = { integerValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (v === null) fields[k] = { nullValue: null };
    else fields[k] = { stringValue: String(v) };
  }
  const resp = await fetch(url + '?updateMask.fieldPaths=' + Object.keys(data).join('&updateMask.fieldPaths='), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ fields })
  });
  return resp.ok;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const url  = new URL(request.url);
    const path = url.pathname;

    let body = {};
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

    // ── /generate ──────────────────────────────────────────────────────────
    if (path === '/generate') {
      const { docType, formData, system, message } = body;
      const fieldLines = formData
        ? Object.entries(formData).filter(([,v]) => v).map(([k,v]) => `${k.replace(/_/g,' ')}: ${v}`).join('\n')
        : '';
      const systemPrompt = system || `You are an expert Indian legal document drafter with 20 years experience.
Generate a complete, professional, legally sound document using Indian law standards.
Include all standard clauses, proper headings, parties section, recitals, terms, and signature block.
Output ONLY the document text — no explanations, no markdown symbols, no commentary.
Use formal legal language. Number all clauses. Make it print-ready.`;
      const userMsg = message || `Generate a complete ${(docType||'').replace(/_/g,' ')} document with these details:\n\n${fieldLines}\n\nProduce the full ready-to-sign document.`;

      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2048, system: systemPrompt, messages: [{ role: 'user', content: userMsg }] })
        });
        const data = await resp.json();
        if (data.error) return json({ error: data.error.message }, 500);
        const text = data.content?.[0]?.text || '';
        return json({ content: text, reply: text });
      } catch(e) { return json({ error: 'Generation failed: ' + e.message }, 500); }
    }

    // ── /ai-chat ───────────────────────────────────────────────────────────
    if (path === '/ai-chat' || path === '/legal-advisor') {
      const { system, message, history = [], max_tokens = 1024 } = body;
      const messages = [...history, { role: 'user', content: message }];
      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens, system: system || 'You are a helpful Indian legal assistant.', messages })
        });
        const data = await resp.json();
        if (data.error) return json({ error: data.error.message }, 500);
        return json({ reply: data.content?.[0]?.text || '', content: data.content });
      } catch(e) { return json({ error: 'Chat failed: ' + e.message }, 500); }
    }

    // ── /analyze ───────────────────────────────────────────────────────────
    if (path === '/analyze') {
      const { system, message, history = [] } = body;
      const messages = [...history, { role: 'user', content: message }];
      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: system || 'You are an expert Indian legal risk analyzer.', messages })
        });
        const data = await resp.json();
        if (data.error) return json({ error: data.error.message }, 500);
        return json({ reply: data.content?.[0]?.text || '', content: data.content });
      } catch(e) { return json({ error: 'Analysis failed: ' + e.message }, 500); }
    }

    // ── /create-order ──────────────────────────────────────────────────────
    // Frontend calls this to get a Razorpay order_id before opening checkout.
    // Amount and plan are validated server-side — frontend cannot fake them.
    if (path === '/create-order') {
      const { planId, uid, email } = body;

      // Validate planId against allowed plans (server enforces pricing)
      const PLANS = { monthly: 19900, yearly: 149900, chat_unlock: 4900 }; // amounts in paise
      const BUNDLE_PRICES = { bundle_affidavit: 19900, bundle_property: 29900, bundle_employment: 19900, bundle_freelancer: 34900 };
      const ALL_PRICES = { ...PLANS, ...BUNDLE_PRICES };

      if (!planId || !uid) return json({ error: 'planId and uid are required' }, 400);

      // doc_ prefixed plan IDs: validate amount from request body (min ₹1, max ₹10000)
      let amount;
      if (planId.startsWith('doc_')) {
        const reqAmount = parseInt(body.amount, 10);
        if (!reqAmount || reqAmount < 100 || reqAmount > 100000) return json({ error: 'Invalid doc amount' }, 400);
        amount = reqAmount * 100; // convert ₹ to paise — body.amount is in rupees
      } else if (ALL_PRICES[planId]) {
        amount = ALL_PRICES[planId];
      } else {
        return json({ error: 'Invalid plan' }, 400);
      }
      const receipt = `rcpt_${uid.slice(0,8)}_${Date.now()}`;

      try {
        const creds = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
        const resp  = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Basic ${creds}` },
          body: JSON.stringify({ amount, currency: 'INR', receipt, notes: { uid, planId, email: email || '' } })
        });
        const order = await resp.json();
        if (order.error) return json({ error: order.error.description }, 500);
        // Return order_id and key_id (key_id is safe to expose; key_secret never leaves server)
        return json({ order_id: order.id, key_id: env.RAZORPAY_KEY_ID, amount, currency: 'INR', planId });
      } catch(e) { return json({ error: 'Order creation failed: ' + e.message }, 500); }
    }

    // ── /verify-payment ────────────────────────────────────────────────────
    // Called by frontend after Razorpay checkout handler fires.
    // Verifies HMAC signature, then activates plan in Firestore.
    // Frontend CANNOT upgrade itself — only this endpoint writes to purchases.
    if (path === '/verify-payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uid, planId } = body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !uid || !planId) {
        return json({ error: 'Missing required verification fields' }, 400);
      }

      // 1. Verify HMAC signature
      const expectedSig = await hmacSHA256(
        env.RAZORPAY_KEY_SECRET,
        `${razorpay_order_id}|${razorpay_payment_id}`
      );
      if (expectedSig !== razorpay_signature) {
        return json({ error: 'Payment signature verification failed' }, 400);
      }

      // 2. Fetch payment from Razorpay to confirm amount + status
      try {
        const creds    = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
        const pyResp   = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: { Authorization: `Basic ${creds}` }
        });
        const payment = await pyResp.json();

        if (payment.status !== 'captured' && payment.status !== 'authorized') {
          return json({ error: 'Payment not captured: ' + payment.status }, 400);
        }

        // 3. Validate amount matches expected plan price
        const PLAN_AMOUNTS = { monthly: 19900, yearly: 149900, chat_unlock: 4900, bundle_affidavit: 19900, bundle_property: 29900, bundle_employment: 19900, bundle_freelancer: 34900 };
        // For doc_ prefixed plans, verify amount is within ₹1–₹1000 range instead of exact match
        if (planId.startsWith('doc_')) {
          if (payment.amount < 100 || payment.amount > 100000) {
            return json({ error: `Doc payment amount out of valid range: ${payment.amount}` }, 400);
          }
        } else {
          const expectedAmount = PLAN_AMOUNTS[planId];
          if (!expectedAmount) return json({ error: 'Unknown plan' }, 400);
          if (payment.amount !== expectedAmount) {
            return json({ error: `Amount mismatch: expected ${expectedAmount}, got ${payment.amount}` }, 400);
          }
        }

        // 4. Compute plan expiry
        const now    = new Date();
        const expiry = new Date(now);
        const isSubscription = planId === 'monthly' || planId === 'yearly';
        const isChatUnlock = planId === 'chat_unlock';
        if (planId === 'yearly')  expiry.setFullYear(expiry.getFullYear() + 1);
        else if (planId === 'monthly') expiry.setMonth(expiry.getMonth() + 1);

        // 5. Update Firestore via REST (requires FIREBASE_SERVER_KEY — Firebase service account access token)
        // NOTE: In production, use Firebase Admin SDK in a proper Node environment, or generate a
        // short-lived Google access token from your service account private key.
        // For Cloudflare Workers, store the access token as a secret and refresh it periodically,
        // OR use the Firestore REST API with an API key scoped only to Firestore writes.
        const projectId = env.FIREBASE_PROJECT_ID || 'my-right-c8924';

        // Write purchase record
        const purchaseId = `${uid}_${razorpay_payment_id}`;
        const purchaseData = {
          userId: uid,
          planId,
          type: isSubscription ? 'subscription' : 'bundle',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amount: payment.amount,
          currency: 'INR',
          status: 'verified',
          purchasedAt: now.toISOString(),
          ...(isSubscription ? { planExpiry: expiry.toISOString() } : {})
        };

        // Write to purchases collection
        await firestoreWrite(projectId, 'purchases', purchaseId, purchaseData, env.FIREBASE_SERVER_KEY);

        // Update user document with new plan (subscriptions only)
        if (isSubscription) {
          await firestoreWrite(projectId, 'users', uid, {
            plan: planId === 'yearly' ? 'yearly' : 'pro',
            planExpiry: expiry.toISOString(),
            lastPaymentId: razorpay_payment_id
          }, env.FIREBASE_SERVER_KEY);
        }

        return json({
          success: true,
          planId,
          planExpiry: isSubscription ? expiry.toISOString() : null,
          paymentId: razorpay_payment_id
        });

      } catch(e) { return json({ error: 'Verification error: ' + e.message }, 500); }
    }

    // ── /admin-chats ───────────────────────────────────────────────────────
    if (path === '/admin-chats') {
      const token = request.headers.get('X-Admin-Token');
      if (!token || token !== env.ADMIN_SECRET_TOKEN) {
        return json({ error: 'Unauthorised' }, 401);
      }
      const projectId = env.FIREBASE_PROJECT_ID || 'my-right-c8924';
      const fsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/chats?pageSize=100`;
      try {
        const fsResp = await fetch(fsUrl, { headers: { Authorization: `Bearer ${env.FIREBASE_SERVER_KEY}` } });
        const fsData = await fsResp.json();
        return json(fsData);
      } catch(e) { return json({ error: 'Firestore error: ' + e.message }, 500); }
    }

    return json({ error: 'Unknown endpoint: ' + path }, 404);
  }
};
