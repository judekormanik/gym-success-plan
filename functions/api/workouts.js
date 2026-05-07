import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const workouts = await env.DB.prepare(
    'SELECT * FROM workouts WHERE user_id = ? ORDER BY completed_at DESC LIMIT 200'
  ).bind(data.user.id).all();
  const ids = (workouts.results || []).map((w) => w.id);
  let sets = [];
  if (ids.length) {
    const placeholders = ids.map(() => '?').join(',');
    const res = await env.DB.prepare(
      `SELECT * FROM sets WHERE workout_id IN (${placeholders}) ORDER BY completed_at DESC`
    ).bind(...ids).all();
    sets = res.results || [];
  }
  return json({ workouts: workouts.results || [], sets });
}

// Body: { day_number, day_name, duration_minutes, notes, sets: [{exercise, setNumber, weight, reps, isDropSet, isPR}] }
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.day_number || !body.day_name) return bad('day_number and day_name required');

  const workoutId = uuid();
  const now = new Date().toISOString();

  const stmts = [
    env.DB.prepare(
      'INSERT INTO workouts (id, user_id, day_number, day_name, completed_at, duration_minutes, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(workoutId, data.user.id, body.day_number, body.day_name, now, body.duration_minutes || 0, body.notes || ''),
  ];

  const setRows = (body.sets || []).map((s, i) => {
    const id = uuid();
    return {
      id, workout_id: workoutId, exercise_name: s.exercise, set_number: s.setNumber || i + 1,
      weight: Number(s.weight) || 0, reps: Number(s.reps) || 0,
      is_drop_set: s.isDropSet ? 1 : 0, is_pr: s.isPR ? 1 : 0, completed_at: now,
    };
  });

  for (const s of setRows) {
    stmts.push(env.DB.prepare(
      'INSERT INTO sets (id, workout_id, exercise_name, set_number, weight, reps, is_drop_set, is_pr, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(s.id, s.workout_id, s.exercise_name, s.set_number, s.weight, s.reps, s.is_drop_set, s.is_pr, s.completed_at));
  }

  await env.DB.batch(stmts);

  return json({
    workout: { id: workoutId, user_id: data.user.id, day_number: body.day_number, day_name: body.day_name, completed_at: now, duration_minutes: body.duration_minutes || 0, notes: body.notes || '' },
    sets: setRows,
  });
}
