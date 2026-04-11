/**
 * MyRight — Cloudflare Worker
 * Deploy this at: https://dash.cloudflare.com → Workers & Pages → Create Worker
 * Set secret: ANTHROPIC_API_KEY = your key from console.anthropic.com
 */

export default {
  async fetch(request, env) {
    // CORS headers for all responses
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors });
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
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }]
          })
        });

        const data = await resp.json();
        if (data.error) return new Response(JSON.stringify({ error: data.error.message }), { status: 500, headers: cors });
        const text = data.content?.[0]?.text || '';
        return new Response(JSON.stringify({ content: text, reply: text }), { headers: cors });
      }

      // ── /ai-chat ───────────────────────────────────────────
      if (path === '/ai-chat' || path === '/legal-advisor') {
        const { system, message, history = [], max_tokens = 1024 } = body;
        const messages = [...(history || []), { role: 'user', content: message }];

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens,
            system: system || 'You are a helpful Indian legal assistant.',
            messages
          })
        });

        const data = await resp.json();
        if (data.error) return new Response(JSON.stringify({ error: data.error.message }), { status: 500, headers: cors });
        const reply = data.content?.[0]?.text || '';
        return new Response(JSON.stringify({ reply, content: data.content }), { headers: cors });
      }

      // ── /analyze ───────────────────────────────────────────
      if (path === '/analyze') {
        const { system, message, history = [] } = body;
        const messages = [...(history || []), { role: 'user', content: message }];

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: system || 'You are an expert Indian legal risk analyzer.',
            messages
          })
        });

        const data = await resp.json();
        if (data.error) return new Response(JSON.stringify({ error: data.error.message }), { status: 500, headers: cors });
        const reply = data.content?.[0]?.text || '';
        return new Response(JSON.stringify({ reply, content: data.content }), { headers: cors });
      }

      return new Response(JSON.stringify({ error: 'Unknown endpoint: ' + path }), { status: 404, headers: cors });

    } catch (e) {
      return new Response(JSON.stringify({ error: 'Worker error: ' + e.message }), { status: 500, headers: cors });
    }
  }
};
