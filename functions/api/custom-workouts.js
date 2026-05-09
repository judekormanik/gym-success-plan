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

// Each entry stored in `exercises` is:
//   { exerciseId, sets, repsTarget?, restSeconds?, notes? }
function normalizeExercise(e) {
  const out = {
    exerciseId: String(e.exerciseId || ''),
    sets: clamp(Number(e.sets) || 3, 1, 20),
  };
  if (e.repsTarget) out.repsTarget = String(e.repsTarget).slice(0, 24);
  if (e.restSeconds != null && e.restSeconds !== '') {
    const r = Number(e.restSeconds);
    if (Number.isFinite(r) && r >= 0) out.restSeconds = Math.min(900, Math.max(0, Math.round(r)));
  }
  if (e.notes) out.notes = String(e.notes).slice(0, 500);
  return out;
}
function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

// POST /api/custom-workouts  body: { name, description?, exercises: [{exerciseId, sets, repsTarget?, restSeconds?, notes?}] }
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.name || !Array.isArray(body.exercises) || body.exercises.length === 0) {
    return bad('name and at least one exercise required');
  }
  const id = uuid();
  const now = new Date().toISOString();
  const exercises = JSON.stringify(body.exercises.map(normalizeExercise).filter((e) => e.exerciseId));

  await env.DB.prepare(
    'INSERT INTO custom_workouts (id, user_id, name, description, exercises, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, data.user.id, String(body.name).slice(0, 80), String(body.description || '').slice(0, 500), exercises, now).run();

  return json({
    workout: {
      id, name: body.name, description: body.description || '',
      exercises: JSON.parse(exercises), created_at: now,
    },
  });
}

// PATCH /api/custom-workouts?id=xxx  body: { name?, description?, exercises? }
export async function onRequestPatch({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return bad('id required');
  const body = await request.json().catch(() => ({}));
  const cols = []; const vals = [];
  if (body.name) { cols.push('name = ?'); vals.push(String(body.name).slice(0, 80)); }
  if ('description' in body) { cols.push('description = ?'); vals.push(String(body.description || '').slice(0, 500)); }
  if (Array.isArray(body.exercises)) {
    cols.push('exercises = ?');
    vals.push(JSON.stringify(body.exercises.map(normalizeExercise).filter((e) => e.exerciseId)));
  }
  if (!cols.length) return bad('nothing to update');
  vals.push(id, data.user.id);
  await env.DB.prepare(
    `UPDATE custom_workouts SET ${cols.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...vals).run();

  const row = await env.DB.prepare(
    'SELECT id, name, description, exercises, created_at FROM custom_workouts WHERE id = ? AND user_id = ?'
  ).bind(id, data.user.id).first();
  if (!row) return bad('not found', 404);
  return json({
    workout: { ...row, exercises: safeParse(row.exercises, []) },
  });
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
