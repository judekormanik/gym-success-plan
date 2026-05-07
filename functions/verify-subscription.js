// Cloudflare Pages Function: GET /verify-subscription?email=...
// Returns subscription status & expiry from D1.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  if (!email) return json({ error: 'email required' }, 400);
  if (!env.DB) return json({ status: 'none' });

  const row = await env.DB.prepare(
    'SELECT subscription_status, subscription_expires FROM users WHERE email = ?'
  ).bind(email).first();
  if (!row) return json({ status: 'none' });

  const expires = row.subscription_expires ? new Date(row.subscription_expires) : null;
  const active = row.subscription_status === 'active' && expires && expires > new Date();
  return json({ status: active ? 'active' : 'expired', expires: row.subscription_expires });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
