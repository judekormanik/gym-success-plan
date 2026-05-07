import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const r = await env.DB.prepare(
    'SELECT * FROM body_weight_log WHERE user_id = ? ORDER BY logged_at DESC LIMIT 365'
  ).bind(data.user.id).all();
  return json({ body_weight: r.results || [] });
}

export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.weight) return bad('weight required');
  const id = uuid();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO body_weight_log (id, user_id, weight, logged_at) VALUES (?, ?, ?, ?)'
  ).bind(id, data.user.id, Number(body.weight), now).run();
  return json({ entry: { id, user_id: data.user.id, weight: Number(body.weight), logged_at: now } });
}
