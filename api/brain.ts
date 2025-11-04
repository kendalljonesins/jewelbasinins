// api/brain.ts — Vercel Edge Function
import type { VercelRequest, VercelResponse } from '@vercel/node';
import kb from '../kb.json';

type BrainReply = {
  text: string;
  intent: 'answer_kb' | 'route_carrier_faq' | 'route_carrier_quote' | 'collect_lead' | 'handoff_human';
  carrier?: 'NEXT' | 'COTERIE' | 'PROGRESSIVE' | 'FETCH' | null;
  link?: string | null;
};

// --- Very simple keyword retrieval over KB ---
function searchKB(q: string): string[] {
  const haystacks: string[] = [];
  haystacks.push(
    `Agency: ${kb.agency.name}. Phone ${kb.agency.phone}. Email ${kb.agency.email}. Hours ${kb.agency.hours}. States ${kb.agency.states.join(', ')}.`
  );
  kb.faqs.forEach(f => haystacks.push(`${f.q}: ${f.a}`));
  haystacks.push(`Links: ${JSON.stringify(kb.links)}`);
  haystacks.push(`Carriers: ${Object.keys(kb.carrierFaqs).join(', ')}`);

  const tokens = (q.toLowerCase().match(/\w+/g) || []);
  const scored = haystacks
    .map(text => ({
      text,
      score: tokens.reduce((s, w) => s + (text.toLowerCase().includes(w) ? 1 : 0), 0)
    }))
    .sort((a,b)=>b.score-a.score)
    .slice(0,3)
    .map(x=>x.text);
  return scored;
}

// --- Carrier detection for FAQ intents ---
function detectCarrier(question: string): { key: string, section?: 'faq'|'billing'|'claims' } | null {
  const lower = question.toLowerCase();
  for (const [key, info] of Object.entries<any>(kb.carrierFaqs)) {
    if (info.aliases.some((a: string) => lower.includes(a))) {
      const section = /billing|payment/.test(lower) ? 'billing'
                   : /claim|accident|damage/.test(lower) ? 'claims'
                   : 'faq';
      return { key, section };
    }
  }
  return null;
}

// --- Strict system prompt for the LLM (guardrails) ---
const SYSTEM_PROMPT = `
You are Sage 🌿, the digital assistant for Jewel Basin Insurance Solutions (JBIS).
HARD RULES:
- ONLY answer using the KB snippets provided. If the info isn't in snippets, say you don't have that and offer to have Kendall follow up.
- Do NOT provide binding quotes, underwriting decisions, or legal advice.
- Keep replies short, warm, and professional (2–4 sentences).
- If asked about business self-serve, suggest NEXT/Coterie links.
- If asked about pets, suggest FETCH link.
- Mention privacy/opt-out only if user asks about data or contact.
Return JSON ONLY (no prose), shaped as:
{"text": string, "intent": "answer_kb" | "route_carrier_faq" | "route_carrier_quote" | "collect_lead" | "handoff_human", "carrier": "NEXT"|"COTERIE"|"PROGRESSIVE"|"FETCH"|null}
`;

// --- Call your LLM provider (stubbed: rule-based fallback) ---
async function callLLM(snippets: string[], user: string): Promise<BrainReply> {
  // If you have a provider, plug it here. For now, safe rule-based behaviors:

  // Route to carrier FAQ if clearly about a known carrier
  const carrier = detectCarrier(user);
  if (carrier) {
    const link = (kb as any).carrierFaqs[carrier.key][carrier.section ?? 'faq'];
    return {
      text: `Here’s the official ${carrier.key} ${carrier.section ?? 'FAQ'} link.`,
      intent: 'route_carrier_faq',
      carrier: carrier.key as any,
      link
    };
  }

  // Otherwise, answer from the top snippet if we can
  const top = snippets[0]?.slice(0, 280) || '';
  if (!top) {
    return {
      text: "I don’t want to guess. I can have Kendall follow up with a precise answer.",
      intent: 'handoff_human',
      carrier: null,
      link: null
    };
  }

  // Light heuristics for commercial/pets
  const lower = user.toLowerCase();
  if (/business|commercial|llc|contractor/.test(lower)) {
    return {
      text: "You can start a quick small-business quote with NEXT or Coterie — I’ll still review to confirm discounts.",
      intent: 'route_carrier_quote',
      carrier: 'NEXT',
      link: (kb as any).links.next_review
    };
  }
  if (/pet|dog|cat/.test(lower)) {
    return {
      text: "For pets, Fetch is a great option — I can send you the link or continue here.",
      intent: 'route_carrier_quote',
      carrier: 'FETCH',
      link: (kb as any).links.fetch
    };
  }

  // Generic “answer_kb”
  return {
    text: top,
    intent: 'answer_kb',
    carrier: null,
    link: null
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { question = "" } = req.body || {};
    const snippets = searchKB(question);
    const reply = await callLLM(snippets, question);

    res.status(200).json({ ...reply, snippets });
  } catch (e) {
    res.status(200).json({
      text: "Something hiccupped. I can have Kendall reach out, or you can try again.",
      intent: "handoff_human",
      carrier: null,
      link: null
    });
  }
}
