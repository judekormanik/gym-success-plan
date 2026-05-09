import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

// GET /api/custom-workouts -> { workouts: [{ id, name, description, exercises[], created_at }] }
export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const r = await env.DB.prepare(
    'SELECT id, name, description, exercises, created_at FROM custom_workouts WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(data.user.id).all();
  const workouts = (r.results || []).map((row) => ({
    ...row,
    exercises: safeParse(row.exercises, []),
  }));
  return json({ workouts });
}

// POST /api/custom-workouts  body: { name, description?, exercises: [{exerciseId, sets}] }
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.name || !Array.isArray(body.exercises) || body.exercises.length === 0) {
    return bad('name and at least one exercise required');
  }
  const id = uuid();
  const now = new Date().toISOString();
  const exercises = JSON.stringify(
    body.exercises.map((e) => ({ exerciseId: String(e.exerciseId), sets: Number(e.sets) || 3 }))
  );
  await env.DB.prepare(
    'INSERT INTO custom_workouts (id, user_id, name, description, exercises, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, data.user.id, body.name, body.description || '', exercises, now).run();

  return json({
    workout: {
      id, name: body.name, description: body.description || '',
      exercises: JSON.parse(exercises), created_at: now,
    },
  });
}

// PATCH /api/custom-workouts?id=xxx  body: same shape
export async function onRequestPatch({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return bad('id required');
  const body = await request.json().catch(() => ({}));
  const cols = []; const vals = [];
  if (body.name) { cols.push('name = ?'); vals.push(body.name); }
  if ('description' in body) { cols.push('description = ?'); vals.push(body.description || ''); }
  if (Array.isArray(body.exercises)) {
    cols.push('exercises = ?');
    vals.push(JSON.stringify(body.exercises.map((e) => ({ exerciseId: String(e.exerciseId), sets: Number(e.sets) || 3 }))));
  }
  if (!cols.length) return bad('nothing to update');
  vals.push(id, data.user.id);
  await env.DB.prepare(
    `UPDATE custom_workouts SET ${cols.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...vals).run();
  return json({ ok: true });
}

// DELETE /api/custom-workouts?id=xxx
export async function onRequestDelete({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return bad('id required');
  await env.DB.prepare('DELETE FROM custom_workouts WHERE id = ? AND user_id = ?')
    .bind(id, data.user.id).run();
  return json({ ok: true });
}

function safeParse(s, fallback) {
  try { return JSON.parse(s); } catch { return fallback; }
}
