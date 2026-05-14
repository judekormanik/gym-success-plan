import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

// POST body: { post_id }
// Clones the workout payload inside a community_posts.metadata into the
// current user's custom_workouts table.
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  const postId = String(body.post_id || '');
  if (!postId) return bad('post_id required');

  const row = await env.DB.prepare(
    "SELECT metadata, user_name FROM community_posts WHERE id = ? AND kind = 'workout_share'"
  ).bind(postId).first();
  if (!row) return bad('shared workout not found', 404);

  let meta;
  try { meta = JSON.parse(row.metadata || '{}'); } catch { meta = {}; }
  const w = meta.workout;
  if (!w || !Array.isArray(w.exercises) || w.exercises.length === 0) {
    return bad('post does not contain a workout');
  }

  const id = uuid();
  const now = new Date().toISOString();
  const name = `${String(w.name || 'Workout').slice(0, 72)} (from ${(row.user_name || 'member').slice(0, 24)})`;
  const description = String(w.description || '').slice(0, 500);
  const exercises = JSON.stringify(
    w.exercises.map((e) => {
      const out = { exerciseId: String(e.exerciseId || ''), sets: Math.max(1, Math.min(20, Number(e.sets) || 3)) };
      if (e.repsTarget) out.repsTarget = String(e.repsTarget).slice(0, 24);
      if (e.restSeconds != null) out.restSeconds = Math.max(0, Math.min(900, Number(e.restSeconds) || 0));
      if (e.notes) out.notes = String(e.notes).slice(0, 500);
      return out;
    }).filter((e) => e.exerciseId)
  );

  await env.DB.prepare(
    'INSERT INTO custom_workouts (id, user_id, name, description, exercises, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, data.user.id, name, description, exercises, now).run();

  return json({
    workout: { id, name, description, exercises: JSON.parse(exercises), created_at: now },
  });
}
