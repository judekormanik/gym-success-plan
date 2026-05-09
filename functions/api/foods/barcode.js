// GET /api/foods/barcode?code=3017624010701
// Looks up a single product by barcode via Search-a-licious.
// (The legacy world.openfoodfacts.org endpoints return 525 SSL handshake
// errors when called from inside Cloudflare Workers.)

import { simplify, json } from './search.js';

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const code = (url.searchParams.get('code') || '').replace(/\D/g, '');
  if (!code) return json({ error: 'code required' }, 400);

  const offUrl =
    `https://search.openfoodfacts.org/search?q=code%3A${encodeURIComponent(code)}` +
    `&page_size=1` +
    `&fields=code,product_name,brands,image_small_url,image_url,nutriments,serving_size,serving_quantity`;

  try {
    const res = await fetch(offUrl, {
      headers: {
        'User-Agent': 'TheGymSuccessPlan/1.0 (https://gym-success-plan.pages.dev)',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return json({ found: false, debug: 'status_' + res.status });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { return json({ found: false, debug: 'non_json' }); }

    const hit = (data.hits || [])[0];
    if (!hit) return json({ found: false });
    const result = simplify(hit);
    if (!result) return json({ found: false });
    return json({ found: true, result });
  } catch {
    return json({ found: false, debug: 'threw' });
  }
}
