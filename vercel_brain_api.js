// api/brain.js — lightweight AI knowledge endpoint for Sage
// This runs in a Vercel/Netlify serverless environment.

import kb from '../kb.json' assert { type: 'json' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  const q = question.toLowerCase();

  // --- Step 1: Match known carrier FAQs ---
  for (const carrier of kb.carriers) {
    if (carrier.keywords.some(k => q.includes(k))) {
      return res.json({
        text: `Here’s what ${carrier.name} can help you with directly:`,
        intent: 'route_carrier_faq',
        carrier: carrier.name,
        link: carrier.link
      });
    }
  }

  // --- Step 2: Match simple insurance intents ---
  if (/pet|dog|cat/.test(q)) {
    return res.json({
      text: 'Fetch Pet Insurance can help cover your furry family for accidents, illnesses, and more.',
      intent: 'route_carrier_quote',
      carrier: 'FETCH'
    });
  }

  if (/business|contractor|commercial/.test(q)) {
    return res.json({
      text: 'For business insurance, NEXT and Coterie provide quick quote options I can review for you.',
      intent: 'route_carrier_quote',
      carrier: 'NEXT'
    });
  }

  // --- Step 3: Otherwise, handoff to Kendall ---
  return res.json({
    text: "I couldn’t find an exact match in my knowledge base. Want me to have Kendall follow up personally?",
    intent: 'handoff_human'
  });
}
