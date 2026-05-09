// Thin fetch wrapper for the Cloudflare Pages Functions API.
// Cookies (session) are sent automatically with credentials: 'include'.

async function call(path, { method = 'GET', body, params } = {}) {
  let url = path;
  if (params) {
    const q = new URLSearchParams(params).toString();
    url += `?${q}`;
  }
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // ── Auth ──
  signup: (email, password, name) => call('/api/auth/signup', { method: 'POST', body: { email, password, name } }),
  signin: (email, password)        => call('/api/auth/signin', { method: 'POST', body: { email, password } }),
  signout: ()                      => call('/api/auth/signout', { method: 'POST' }),
  me: ()                           => call('/api/auth/me'),

  // ── Profile ──
  getProfile: () => call('/api/profile'),
  updateProfile: (patch) => call('/api/profile', { method: 'PATCH', body: patch }),

  // ── Workouts / sets ──
  listWorkouts: () => call('/api/workouts'),
  saveWorkout: (workout) => call('/api/workouts', { method: 'POST', body: workout }),

  // ── PRs ──
  listPRs: () => call('/api/personal-records'),
  addPR: (pr) => call('/api/personal-records', { method: 'POST', body: pr }),

  // ── Body weight ──
  listBodyWeight: () => call('/api/body-weight'),
  addBodyWeight: (weight) => call('/api/body-weight', { method: 'POST', body: { weight } }),

  // ── Nutrition ──
  listNutrition: () => call('/api/nutrition'),
  addFood: (food) => call('/api/nutrition', { method: 'POST', body: food }),
  removeFood: (id) => call('/api/nutrition', { method: 'DELETE', params: { id } }),

  // ── Community ──
  listPosts: () => call('/api/posts'),
  addPost: (content) => call('/api/posts', { method: 'POST', body: { content } }),
  likePost: (id) => call('/api/posts', { method: 'PATCH', params: { id } }),
  listComments: (postId) => call('/api/comments', { params: { post_id: postId } }),
  addComment: (postId, content) => call('/api/comments', { method: 'POST', body: { post_id: postId, content } }),

  // ── Photos ──
  listPhotos: () => call('/api/photos'),
  addPhoto: (photoUrl, notes) => call('/api/photos', { method: 'POST', body: { photo_url: photoUrl, notes } }),

  // ── Custom workouts ──
  listCustomWorkouts: () => call('/api/custom-workouts'),
  saveCustomWorkout: (workout) => call('/api/custom-workouts', { method: 'POST', body: workout }),
  updateCustomWorkout: (id, patch) => call('/api/custom-workouts', { method: 'PATCH', params: { id }, body: patch }),
  deleteCustomWorkout: (id) => call('/api/custom-workouts', { method: 'DELETE', params: { id } }),

  // ── Foods (Open Food Facts via our proxy) ──
  searchFoods: (q) => call('/api/foods/search', { params: { q } }),
  lookupBarcode: (code) => call('/api/foods/barcode', { params: { code } }),

  // ── Body measurements ──
  listMeasurements: () => call('/api/body-measurements'),
  addMeasurement: (m) => call('/api/body-measurements', { method: 'POST', body: m }),
  removeMeasurement: (id) => call('/api/body-measurements', { method: 'DELETE', params: { id } }),

  // ── Water ──
  getWater: () => call('/api/water'),
  addWater: (ml) => call('/api/water', { method: 'POST', body: { ml } }),
  removeWater: (id) => call('/api/water', { method: 'DELETE', params: { id } }),

  // ── Favorites ──
  listFavorites: () => call('/api/favorites'),
  addFavorite: (exercise_id) => call('/api/favorites', { method: 'POST', body: { exercise_id } }),
  removeFavorite: (exercise_id) => call('/api/favorites', { method: 'DELETE', params: { exercise_id } }),

  // ── Auth maintenance ──
  changePassword: (current, next) => call('/api/auth/change-password', { method: 'POST', body: { current, next } }),
  deleteAccount: (password) => call('/api/auth/delete-account', { method: 'POST', body: { password } }),

  // ── Subscription verify ──
  verifySubscription: (email) => call('/verify-subscription', { params: { email } }),
};
