import { json, bad } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

// GET /api/favorites -> { ids: ['Barbell_Squat', ...] }
export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const r = await env.DB.prepare(
    'SELECT exercise_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(data.user.id).all();
  return json({ ids: (r.results || []).map((row) => row.exercise_id) });
}

// POST body: { exercise_id }
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  const id = String(body.exercise_id || '').slice(0, 200);
  if (!id) return bad('exercise_id required');
  await env.DB.prepare(
    'INSERT OR IGNORE INTO favorites (user_id, exercise_id, created_at) VALUES (?, ?, ?)'
  ).bind(data.user.id, id, new Date().toISOString()).run();
  return json({ ok: true });
}

// DELETE ?exercise_id=...
export async function onRequestDelete({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('exercise_id') || '';
  if (!id) return bad('exercise_id required');
  await env.DB.prepare(
    'DELETE FROM favorites WHERE user_id = ? AND exercise_id = ?'
  ).bind(data.user.id, id).run();
  return json({ ok: true });
}
