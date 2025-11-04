// api/brain.js — Sage's lightweight KB endpoint (Vercel)
// Node 18+ (ESM) friendly

export default async function handler(req, res) {
  // CORS for cross-origin (your main site calling Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, tip: "POST {question} to this endpoint." });
  }

  try {
    // Load kb.json that sits in the SAME folder as this file
    const kb = (await import('./kb.json', { assert: { type: 'json' } })).default;

    const { question } = req.body || {};
    if (!question) return res.status(400).json({ error: 'Missing question' });

    const q = String(question).toLowerCase();

    // 1) Carrier matches
    for (const carrier of kb.carriers || []) {
      if (carrier.keywords?.some(k => q.includes(k))) {
        return res.json({
          text: `Here’s what ${carrier.name} can help you with directly:`,
          intent: 'route_carrier_faq',
          carrier: carrier.name,
          link: carrier.link
        });
      }
    }

    // 2) Simple intents
    if (/pet|dog|cat/.test(q)) {
      return res.json({
        text: 'Fetch Pet Insurance can help cover your furry family for accidents, illnesses, and more.',
        intent: 'route_carrier_quote',
        carrier: 'FETCH'
      });
    }
    if (/business|contractor|commercial/.test(q)) {
      return res.json({
        text: 'For business insurance, NEXT and Coterie provide quick quote options I can review with you.',
        intent: 'route_carrier_quote',
        carrier: 'NEXT'
      });
    }

    // 3) Handoff fallback
    return res.json({
      text: "I couldn’t find an exact match in my knowledge base. Want me to have Kendall follow up personally?",
      intent: 'handoff_human'
    });
  } catch (e) {
    return res.status(500).json({ error: 'KB load failed', detail: String(e) });
  }
}
