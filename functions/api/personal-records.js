import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const r = await env.DB.prepare(
    'SELECT * FROM personal_records WHERE user_id = ? ORDER BY achieved_at DESC LIMIT 200'
  ).bind(data.user.id).all();
  return json({ personal_records: r.results || [] });
}

export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.exercise_name || !body.weight || !body.reps) return bad('exercise_name, weight, reps required');
  const id = uuid();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO personal_records (id, user_id, exercise_name, weight, reps, achieved_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, data.user.id, body.exercise_name, Number(body.weight), Number(body.reps), now).run();
  return json({ pr: { id, user_id: data.user.id, exercise_name: body.exercise_name, weight: Number(body.weight), reps: Number(body.reps), achieved_at: now } });
}
