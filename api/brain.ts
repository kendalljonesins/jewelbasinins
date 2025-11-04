// /api/brain.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

type KBItem = {
  match: string[];         // keywords to match
  text?: string;           // direct answer
  intent?: string;         // e.g., route_carrier_faq, route_carrier_quote, handoff_human
  carrier?: string;        // e.g., 'Progressive', 'NEXT', 'Coterie', 'FETCH'
  link?: string;           // URL to FAQ/portal
};

type KB = { items: KBItem[] };

function score(q: string, keys: string[]) {
  const t = q.toLowerCase();
  return keys.reduce((s, k) => s + (t.includes(k.toLowerCase()) ? 1 : 0), 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, tip: 'POST {question} to this endpoint.' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ text: 'Use POST with a question.' });
  }

  try {
    const { question } = (req.body || {}) as { question?: string };
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ text: 'Ask me a question.' });
    }

    // Load your live KB (put kb.json in /public so it deploys statically).
    // This builds an absolute URL like https://your-site.vercel.app/kb.json
    const origin =
      (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'])
        ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
        : `https://${req.headers.host}`;

    const kbUrl = `${origin}/kb.json`;
    const kbResp = await fetch(kbUrl);
    const kb = (await kbResp.json()) as KB;

    let best: KBItem | null = null;
    let bestScore = 0;

    for (const item of kb.items || []) {
      const s = score(question, item.match || []);
      if (s > bestScore) {
        best = item;
        bestScore = s;
      }
    }

    if (!best || bestScore === 0) {
      return res.status(200).json({
        text: "I couldn't find an exact match in my knowledge base. Want me to have Kendall follow up?",
        intent: 'handoff_human'
      });
    }

    // Build a consistent response for the chat client
    return res.status(200).json({
      text: best.text || 'Here’s what I found.',
      intent: best.intent || 'answer',
      carrier: best.carrier || undefined,
      link: best.link || undefined
    });
  } catch (err) {
    return res.status(200).json({
      text: "I couldn’t reach my knowledge base just now. Want me to have Kendall follow up?",
      intent: 'handoff_human'
    });
  }
}
