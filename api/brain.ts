// /api/brain.js — serverless endpoint for Sage's mini-brain (Vercel)
import kb from '../kb.json' assert { type: 'json' };

export default async function handler(req, res) {
  // Simple GET check so you can visit /api/brain in a browser and see it's alive
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, tip: "POST {question} to this endpoint." });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Missing question' });
    }

    const q = question.toLowerCase();

    // 1) Match carrier FAQs by keywords
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

    // 2) Lightweight intent routes (commercial/pet etc.)
    if (/pet|dog|cat/.test(q)) {
      return res.json({
        text: 'Fetch Pet Insurance can help cover your furry family for accidents, illnesses, and more.',
        intent: 'route_carrier_quote',
        carrier: 'FETCH'
      });
    }

    if (/business|contractor|commercial|llc|general liability|workers/.test(q)) {
      return res.json({
        text: 'For business insurance, NEXT and Coterie offer fast quotes I can review for you.',
        intent: 'route_carrier_quote',
        carrier: 'NEXT'
      });
    }

    // 3) Default — hand off to Kendall
    return res.json({
      text: "I couldn’t find an exact match in my knowledge base. Want me to have Kendall follow up personally?",
      intent: 'handoff_human'
    });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
