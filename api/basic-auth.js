// /api/basic-auth.js
export const config = { runtime: 'edge' };

const USER = 'yourusername';      // change these
const PASS = 'yoursupersecretpw'; // keep private

export default async function handler(req) {
  const deny = () =>
    new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="JBIS Agent Portal"' }
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
  return Response.redirect(url, 302);
}
