export const config = { runtime: 'edge' };

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

  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) return deny();

  try {
    const [user, pass] = atob(auth.split(' ')[1]).split(':');
    if (user !== USER || pass !== PASS) return deny();
  } catch {
    return deny();
  }

  const url = new URL(req.url);
  url.pathname = '/agent.html';
  const res = await fetch(url.toString(), { headers: { 'Cache-Control': 'no-store' } });
  return new Response(res.body, { status: res.status, headers: res.headers });
}
