// /api/basic-auth.js  (Vercel Edge Function)
export const config = { runtime: 'edge' };

// 🔒 credentials
const USER = 'kjones9533';
const PASS = 'mountainfox2025';

export default async function handler(req) {
  const deny = () =>
    new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="JBIS Agent Portal"',
        'Cache-Control': 'no-store'
      }
    });

  // Expect "Authorization: Basic base64(user:pass)"
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) return deny();

  try {
    const [user, pass] = atob(auth.split(' ')[1]).split(':');
    if (user !== USER || pass !== PASS) return deny();
  } catch {
    return deny();
  }

  // ✅ Auth OK → redirect the browser to the real static page
  const url = new URL(req.url);
  url.pathname = '/agent.html';
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Cache-Control': 'no-store'
    }
  });
}
