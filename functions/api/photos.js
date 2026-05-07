import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const r = await env.DB.prepare(
    'SELECT * FROM progress_photos WHERE user_id = ? ORDER BY taken_at DESC LIMIT 100'
  ).bind(data.user.id).all();
  return json({ photos: r.results || [] });
}

// Body: { photo_url (data: URL or hosted URL), notes }
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.photo_url) return bad('photo_url required');
  const id = uuid();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO progress_photos (id, user_id, photo_url, notes, taken_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, data.user.id, body.photo_url, body.notes || '', now).run();
  return json({ photo: { id, user_id: data.user.id, photo_url: body.photo_url, notes: body.notes || '', taken_at: now } });
}
