// Cloudflare Pages Function: POST /webhook
// Handles Stripe webhook events. Verifies signature, then activates subscription in Supabase.

export async function onRequestPost({ request, env }) {
  const sig = request.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  const body = await request.text();
  const valid = await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return new Response('Invalid signature', { status: 400 });

  let event;
  try { event = JSON.parse(body); } catch { return new Response('Bad payload', { status: 400 }); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email || session.metadata?.email;
    const customerId = session.customer;

    if (email) {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);

      await supabaseRequest(env, '/rest/v1/users', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subscription_status: 'active',
          subscription_expires: expires.toISOString(),
          stripe_customer_id: customerId,
        }),
      });
    }
  }

  return new Response('ok', { status: 200 });
}

async function verifyStripeSignature(payload, header, secret) {
  // Stripe signature header looks like: "t=timestamp,v1=hash,v1=hash"
  if (!secret) return true; // dev / unconfigured: skip verification (do not use in production without secret)
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(`${timestamp}.${payload}`));
  const computed = Array.from(new Uint8Array(sigBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return safeEqual(computed, signature);
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function supabaseRequest(env, path, init = {}) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL) + path;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
}
