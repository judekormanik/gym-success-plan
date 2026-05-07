import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

// GET /api/comments?post_id=xxx
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const postId = url.searchParams.get('post_id');
  if (!postId) return bad('post_id required');
  const r = await env.DB.prepare(
    'SELECT * FROM community_comments WHERE post_id = ? ORDER BY created_at ASC LIMIT 200'
  ).bind(postId).all();
  return json({ comments: r.results || [] });
}

export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.post_id || !body.content) return bad('post_id and content required');
  const id = uuid();
  const now = new Date().toISOString();
  const userName = data.user.name || 'Member';
  await env.DB.prepare(
    'INSERT INTO community_comments (id, post_id, user_id, user_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, body.post_id, data.user.id, userName, body.content, now).run();
  return json({ comment: { id, post_id: body.post_id, user_id: data.user.id, user_name: userName, content: body.content, created_at: now } });
}
