import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

const SEED = [
  { id: 'seed-1', user_id: 'seed', user_name: 'Marcus T.', content: 'Hit a 405 rack pull today. Stuck at 365 for two months — the structured progression in this app actually works.', likes: 47, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'seed-2', user_id: 'seed', user_name: 'Sara K.', content: 'Down 6.2kg in 11 weeks holding all my lifts. The macro targets + workout cadence are dialled in.', likes: 92, created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
  { id: 'seed-3', user_id: 'seed', user_name: 'Devon R.', content: 'Day 47 streak. Showing up was the system.', likes: 31, created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
];

export async function onRequestGet({ env }) {
  const r = await env.DB.prepare(
    'SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 50'
  ).all();
  const real = r.results || [];
  return json({ posts: real.length ? real : SEED });
}

export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.content) return bad('content required');
  const id = uuid();
  const now = new Date().toISOString();
  const userName = data.user.name || 'Member';
  await env.DB.prepare(
    'INSERT INTO community_posts (id, user_id, user_name, content, likes, created_at) VALUES (?, ?, ?, ?, 0, ?)'
  ).bind(id, data.user.id, userName, body.content, now).run();
  return json({ post: { id, user_id: data.user.id, user_name: userName, content: body.content, likes: 0, created_at: now } });
}

// PATCH /api/posts?id=xxx&action=like
export async function onRequestPatch({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return bad('id required');
  await env.DB.prepare('UPDATE community_posts SET likes = COALESCE(likes,0) + 1 WHERE id = ?').bind(id).run();
  const row = await env.DB.prepare('SELECT * FROM community_posts WHERE id = ?').bind(id).first();
  return json({ post: row });
}
