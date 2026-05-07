import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const r = await env.DB.prepare(
    'SELECT * FROM nutrition_log WHERE user_id = ? ORDER BY logged_at DESC LIMIT 500'
  ).bind(data.user.id).all();
  return json({ nutrition: r.results || [] });
}

export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.food_name) return bad('food_name required');
  const id = uuid();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO nutrition_log (id, user_id, food_name, calories, protein, carbs, fats, logged_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id, data.user.id, body.food_name,
    Number(body.calories) || 0, Number(body.protein) || 0,
    Number(body.carbs) || 0, Number(body.fats) || 0, now
  ).run();
  return json({
    entry: {
      id, user_id: data.user.id, food_name: body.food_name,
      calories: Number(body.calories) || 0, protein: Number(body.protein) || 0,
      carbs: Number(body.carbs) || 0, fats: Number(body.fats) || 0, logged_at: now,
    },
  });
}

export async function onRequestDelete({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return bad('id required');
  await env.DB.prepare('DELETE FROM nutrition_log WHERE id = ? AND user_id = ?').bind(id, data.user.id).run();
  return json({ ok: true });
}
