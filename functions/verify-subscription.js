// Cloudflare Pages Function: GET /verify-subscription?email=...
// Returns the user's subscription status and expiry from Supabase.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  if (!email) return json({ error: 'email required' }, 400);

  const sbUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL);
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!sbUrl || !key) return json({ status: 'none' });

  try {
    const res = await fetch(
      `${sbUrl}/rest/v1/users?select=subscription_status,subscription_expires&email=eq.${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );
    if (!res.ok) return json({ status: 'none' });
    const rows = await res.json();
    const row = rows?.[0];
    if (!row) return json({ status: 'none' });

    const expires = row.subscription_expires ? new Date(row.subscription_expires) : null;
    const active = row.subscription_status === 'active' && expires && expires > new Date();

    return json({
      status: active ? 'active' : 'expired',
      expires: row.subscription_expires,
    });
  } catch (e) {
    return json({ status: 'none' });
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
