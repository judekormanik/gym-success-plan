// USDA SR Legacy foods — 7,759 generic foods, public-domain US Government data.
// Lazy-loaded from /usda-foods.json on first search to keep the initial bundle
// small. Macros are PER 100 GRAMS (USDA standard).

let _usda = null;
let _usdaPromise = null;

export function loadUSDA() {
  if (_usda) return Promise.resolve(_usda);
  if (_usdaPromise) return _usdaPromise;
  _usdaPromise = fetch('/usda-foods.json', { credentials: 'omit' })
    .then((r) => (r.ok ? r.json() : []))
    .then((arr) => {
      _usda = Array.isArray(arr) ? arr : [];
      return _usda;
    })
    .catch(() => {
      _usda = [];
      return _usda;
    });
  return _usdaPromise;
}

// Fuzzy match against USDA names. Same ranking scheme as verifiedFoods:
// exact > starts-with > word-boundary > substring.
export function searchUSDA(query, max = 15) {
  if (!_usda) return [];
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return [];

  const out = [];
  for (const row of _usda) {
    const name = row.n.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(' ' + q) || name.includes(',' + q) || name.includes(', ' + q)) score = 60;
    else if (name.includes(q)) score = 40;
    if (score > 0) out.push({ row, score });
  }
  out.sort((a, b) => b.score - a.score || a.row.n.length - b.row.n.length);
  return out.slice(0, max).map((s) => s.row);
}

// USDA macros are per 100g. Expose a typed object the picker can use.
export function asPer100(row) {
  return {
    food_name: row.n,
    calories: Math.round(row.c),
    protein: row.p,
    carbs: row.h,
    fats: row.f,
  };
}
