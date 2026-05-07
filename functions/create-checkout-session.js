// Cloudflare Pages Function: POST /create-checkout-session
// Creates a Stripe Checkout Session for the $19.99 annual plan.

export async function onRequestPost({ request, env }) {
  try {
    const { email } = await request.json();
    if (!email) return json({ error: 'email required' }, 400);

    const appUrl = env.VITE_APP_URL || new URL(request.url).origin;

    const body = new URLSearchParams({
      mode: 'payment',
      'payment_method_types[0]': 'card',
      customer_email: email,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'The Gym Success Plan — Annual',
      'line_items[0][price_data][product_data][description]': 'One year of full access',
      'line_items[0][price_data][unit_amount]': '1999',
      success_url: `${appUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout-cancel`,
      'metadata[email]': email,
      'metadata[plan]': 'annual',
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await res.json();
    if (!res.ok) return json({ error: data?.error?.message || 'Stripe error' }, 500);

    return json({ id: data.id, url: data.url });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
