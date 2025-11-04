// /api/brain.ts  (Vercel Edge/Node runtime OK)
import { NextResponse } from 'next/server';

function withCORS(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }));
}

export async function GET(req: Request) {
  return withCORS(
    NextResponse.json({ ok: true, tip: 'POST {question} to this endpoint.' })
  );
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    // Build the public URL to kb.json using the same host
    const url = new URL(req.url);
    const kbUrl = `${url.origin}/kb.json`;

    const kb = await fetch(kbUrl, { cache: 'no-store' }).then((r) => r.json());
    // Very simple keyword match against `kb` (array of { k: string[], a: string })
    let best: string | null = null;
    let score = 0;

    for (const entry of kb as Array<{ k: string[]; a: string }>) {
      const s = entry.k.reduce(
        (acc, kw) =>
          acc + (String(question || '').toLowerCase().includes(kw) ? 1 : 0),
        0
      );
      if (s > score) {
        score = s;
        best = entry.a;
      }
    }

    const resp = best
      ? { text: best, intent: 'kb_answer' }
      : {
          text:
            "I don't want to guess. I can have Kendall follow up with a precise answer—shall we finish the quick details?",
          intent: 'handoff_human',
        };

    return withCORS(NextResponse.json(resp));
  } catch (e) {
    return withCORS(
      NextResponse.json(
        {
          text:
            "I couldn’t reach my knowledge base just now. Want me to have Kendall follow up?",
          intent: 'handoff_human',
        },
        { status: 200 }
      )
    );
  }
}
