/**
 * MyRight — Cloudflare Worker (Secured)
 * Deploy at: https://dash.cloudflare.com → Workers & Pages → Create Worker
 *
 * Required secrets (set in Worker → Settings → Variables → Secrets):
 *   ANTHROPIC_API_KEY  → your key from console.anthropic.com
 *   FIREBASE_PROJECT_ID → my-right-c8924
 *   ADMIN_SECRET_TOKEN  → generate a random 32-char string, paste here
 *                         Use: https://randomkeygen.com → Fort Knox Passwords
 *
 * Admin reads chats by calling /admin-chats with the ADMIN_SECRET_TOKEN header.
 * This never exposes any credential in the browser source code.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      const body = await request.json();

      // ── /generate ──────────────────────────────────────────
      if (path === '/generate') {
        const { docType, formData, system, message } = body;
        const fieldLines = formData
          ? Object.entries(formData).filter(([k,v]) => v).map(([k,v]) => `${k.replace(/_/g,' ')}: ${v}`).join('\n')
          : '';
        const systemPrompt = system || `You are an expert Indian legal document drafter with 20 years experience.
Generate a complete, professional, legally sound document using Indian law standards.
Include all standard clauses, proper headings, parties section, recitals, terms, and signature block.
Output ONLY the document text — no explanations, no markdown symbols, no commentary.
Use formal legal language. Number all clauses. Make it print-ready.`;
        const userMsg = message || `Generate a complete ${(docType||'').replace(/_/g,' ')} document with these details:\n\n${fieldLines}\n\nProduce the full ready-to-sign document.`;

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2048, system: systemPrompt, messages: [{ role: 'user', content: userMsg }] })
        });
        const data = await resp.json();
        if (data.error) return new Response(JSON.stringify({ error: data.error.message }), { status: 500, headers: CORS_HEADERS });
        const text = data.content?.[0]?.text || '';
        return new Response(JSON.stringify({ content: text, reply: text }), { headers: CORS_HEADERS });
      }

      // ── /ai-chat ───────────────────────────────────────────
      if (path === '/ai-chat' || path === '/legal-advisor') {
        const { system, message, history = [], max_tokens = 1024 } = body;
        const messages = [...(history || []), { role: 'user', content: message }];
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens, system: system || 'You are a helpful Indian legal assistant.', messages })
        });
        const data = await resp.json();
        if (data.error) return new Response(JSON.stringify({ error: data.error.message }), { status: 500, headers: CORS_HEADERS });
        const reply = data.content?.[0]?.text || '';
        return new Response(JSON.stringify({ reply, content: data.content }), { headers: CORS_HEADERS });
      }

      // ── /analyze ───────────────────────────────────────────
      if (path === '/analyze') {
        const { system, message, history = [] } = body;
        const messages = [...(history || []), { role: 'user', content: message }];
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: system || 'You are an expert Indian legal risk analyzer.', messages })
        });
        const data = await resp.json();
        if (data.error) return new Response(JSON.stringify({ error: data.error.message }), { status: 500, headers: CORS_HEADERS });
        const reply = data.content?.[0]?.text || '';
        return new Response(JSON.stringify({ reply, content: data.content }), { headers: CORS_HEADERS });
      }

      // ── /admin-chats  (server-side admin read — token protected) ──
      // The admin panel calls this instead of reading Firestore directly from the browser.
      // ADMIN_SECRET_TOKEN is a Cloudflare secret — never visible in source code.
      if (path === '/admin-chats') {
        const token = request.headers.get('X-Admin-Token');
        if (!token || token !== env.ADMIN_SECRET_TOKEN) {
          return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401, headers: CORS_HEADERS });
        }
        // Forward to Firestore REST API using Firebase's public REST (no Admin SDK needed in Workers)
        const projectId = env.FIREBASE_PROJECT_ID || 'my-right-c8924';
        const fsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/chats?pageSize=100`;
        const fsResp = await fetch(fsUrl, { headers: { 'Content-Type': 'application/json' } });
        const fsData = await fsResp.json();
        return new Response(JSON.stringify(fsData), { headers: CORS_HEADERS });
      }

      return new Response(JSON.stringify({ error: 'Unknown endpoint: ' + path }), { status: 404, headers: CORS_HEADERS });

    } catch (e) {
      return new Response(JSON.stringify({ error: 'Worker error: ' + e.message }), { status: 500, headers: CORS_HEADERS });
    }
  }
};
