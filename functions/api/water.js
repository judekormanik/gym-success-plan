import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

// GET /api/water -> { entries: [{id, ml, logged_at}], todayMl }
export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const r = await env.DB.prepare(
    'SELECT id, ml, logged_at FROM water_log WHERE user_id = ? ORDER BY logged_at DESC LIMIT 200'
  ).bind(data.user.id).all();
  const entries = r.results || [];
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMl = entries
    .filter((e) => (e.logged_at || '').slice(0, 10) === todayKey)
    .reduce((a, e) => a + (Number(e.ml) || 0), 0);
  return json({ entries, todayMl });
}

// POST body: { ml }   ml may be negative to subtract
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  const ml = Math.round(Number(body.ml));
  if (!Number.isFinite(ml) || ml === 0) return bad('ml required');
  const id = uuid();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO water_log (id, user_id, ml, logged_at) VALUES (?, ?, ?, ?)'
  ).bind(id, data.user.id, ml, now).run();
  return json({ entry: { id, ml, logged_at: now } });
}

export async function onRequestDelete({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return bad('id required');
  await env.DB.prepare('DELETE FROM water_log WHERE id = ? AND user_id = ?').bind(id, data.user.id).run();
  return json({ ok: true });
}
