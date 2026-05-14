// GET /api/foods/search?q=oats
// Proxies Open Food Facts (open data, ODbL).
//
// We use Search-a-licious (search.openfoodfacts.org) because the legacy
// search.pl endpoint on world.openfoodfacts.org returns 525 SSL errors when
// called from inside Cloudflare Workers (Cloudflare-to-Cloudflare handshake
// quirk). Search-a-licious returns a clean JSON shape and is the actively
// maintained search service.

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q || q.length < 2) {
    return json({ results: [] });
  }

  const offUrl =
    `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}` +
    `&page_size=30` +
    `&fields=code,product_name,brands,image_small_url,image_url,nutriments,serving_size,serving_quantity`;

  try {
    const res = await fetch(offUrl, {
      headers: {
        'User-Agent': 'TheGymSuccessPlan/1.0 (https://gym-success-plan.pages.dev)',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return json({ results: [], debug: 'status_' + res.status });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { return json({ results: [], debug: 'non_json' }); }
    // Keep entries with at least kcal/100g (filters out junk that the
    // community contributed without nutrition data). Cap at 20 in the
    // response so the UI stays scannable.
    const results = (data.hits || [])
      .map(simplify)
      .filter((r) => r && r.per100?.calories > 0)
      .slice(0, 20);
    return json({ results });
  } catch {
    return json({ results: [], debug: 'threw' });
  }
}

export function simplify(p) {
  const name = (p.product_name || '').trim();
  if (!name) return null;

  // brands can come in as array (search-a-licious) or string (v2 product API)
  let brand = '';
  if (Array.isArray(p.brands)) brand = (p.brands[0] || '').trim();
  else if (typeof p.brands === 'string') brand = (p.brands.split(',')[0] || '').trim();

  const n = p.nutriments || {};
  const per100 = {
    calories: round(n['energy-kcal_100g'] ?? n.energy_kcal_100g ?? n.energy_100g),
    protein: round(n.proteins_100g),
    carbs: round(n.carbohydrates_100g),
    fats: round(n.fat_100g),
  };

  const servingG = Number(p.serving_quantity) || null;
  const perServing = servingG
    ? {
        servingG,
        servingLabel: p.serving_size || `${servingG}g`,
        calories: round((per100.calories * servingG) / 100),
        protein: round((per100.protein * servingG) / 100),
        carbs: round((per100.carbs * servingG) / 100),
        fats: round((per100.fats * servingG) / 100),
      }
    : null;
  return {
    code: p.code || null,
    name,
    brand,
    image: p.image_small_url || p.image_url || null,
    per100,
    perServing,
  };
}

function round(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

export function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
