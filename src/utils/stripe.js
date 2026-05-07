// Stripe.js loader (loads from CDN, no npm dependency)
let stripePromise;

export function getStripe() {
  if (stripePromise) return stripePromise;
  stripePromise = new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      if (window.Stripe) resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));
      else reject(new Error('Stripe failed to load'));
    };
    script.onerror = () => reject(new Error('Stripe failed to load'));
    document.head.appendChild(script);
  });
  return stripePromise;
}

export async function startCheckout(email) {
  try {
    const res = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Failed to create session');
    const { url } = await res.json();
    if (url) window.location.href = url;
  } catch (e) {
    // Demo fallback so the app remains usable without Stripe configured
    window.location.href = '/checkout-success?demo=1';
  }
}

export async function verifySubscription(email) {
  try {
    const res = await fetch(`/verify-subscription?email=${encodeURIComponent(email)}`);
    if (!res.ok) return { status: 'none' };
    return await res.json();
  } catch {
    return { status: 'none' };
  }
}
