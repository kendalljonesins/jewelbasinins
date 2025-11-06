// /api/basic-auth.js
// Vercel Edge Function: HTTP Basic Auth gate for the agent portal

export const config = { runtime: 'edge' };

// 🔒 set your credentials
const USER = 'kendall.jone9533';            // <-- change me
const PASS = 'mountainfox2025';    // <-- change me

export default async function handler(req) {
  const deny = () =>
    new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="JBIS Agent Portal"',
        'Cache-Control': 'no-store'
      }
    });

  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) return deny();

  try {
    const [user, pass] = atob(auth.split(' ')[1]).split(':');
    if (user !== USER || pass !== PASS) return deny();
  } catch {
    return deny();
  }

  // ✅ Auth OK: fetch and return the static page content (no redirect)
  // This avoids any routing loops.
  const url = new URL(req.url);
  url.pathname = '/agent.html';
  const res = await fetch(url.toString(), { headers: { 'Cache-Control': 'no-store' } });
  return new Response(res.body, {
    status: res.status,
    headers: res.headers
  });
}
