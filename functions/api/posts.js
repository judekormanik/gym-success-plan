import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

const SEED = [
  { id: 'seed-1', user_id: 'seed', user_name: 'Marcus T.', content: 'Hit a 405 rack pull today. Stuck at 365 for two months — the structured progression in this app actually works.', likes: 47, kind: 'post', reactions: { fire: 12, trophy: 6, muscle: 9 }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'seed-2', user_id: 'seed', user_name: 'Sara K.', content: 'Down 6.2kg in 11 weeks holding all my lifts. The macro targets + workout cadence are dialled in.', likes: 92, kind: 'post', reactions: { fire: 24, trophy: 18, muscle: 5 }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
  { id: 'seed-3', user_id: 'seed', user_name: 'Devon R.', content: 'Day 47 streak. Showing up was the system.', likes: 31, kind: 'post', reactions: { fire: 14, trophy: 3, muscle: 2 }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
];

function parseJSON(s, fallback = null) {
  try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}

function rowToPost(row) {
  return {
    ...row,
    metadata: parseJSON(row.metadata, null),
    reactions: parseJSON(row.reactions, {}) || {},
  };
}

export async function onRequestGet({ env }) {
  const r = await env.DB.prepare(
    'SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 50'
  ).all();
  const real = (r.results || []).map(rowToPost);
  return json({ posts: real.length ? real : SEED });
}

// POST body: { content, kind?, metadata? }
//   kind = 'post' (default) | 'workout_share'
//   metadata for workout_share: { workout: { name, description, exercises } }
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  if (!body.content) return bad('content required');
  const id = uuid();
  const now = new Date().toISOString();
  const userName = data.user.name || 'Member';
  const kind = ['post', 'workout_share'].includes(body.kind) ? body.kind : 'post';
  const metadataStr = body.metadata ? JSON.stringify(body.metadata).slice(0, 8000) : null;

  await env.DB.prepare(
    'INSERT INTO community_posts (id, user_id, user_name, content, likes, kind, metadata, reactions, created_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)'
  ).bind(id, data.user.id, userName, body.content, kind, metadataStr, '{}', now).run();

  return json({
    post: {
      id, user_id: data.user.id, user_name: userName,
      content: body.content, likes: 0, kind,
      metadata: body.metadata || null, reactions: {},
      created_at: now,
    },
  });
}

// PATCH /api/posts?id=xxx&action=like|fire|trophy|muscle
export async function onRequestPatch({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const action = url.searchParams.get('action') || 'like';
  if (!id) return bad('id required');

  if (action === 'like') {
    await env.DB.prepare('UPDATE community_posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ?').bind(id).run();
  } else if (['fire', 'trophy', 'muscle'].includes(action)) {
    // Increment a key in the reactions JSON. SQLite has json_set but for
    // portability we fetch-update-write.
    const row = await env.DB.prepare('SELECT reactions FROM community_posts WHERE id = ?').bind(id).first();
    if (!row) return bad('not found', 404);
    const reactions = parseJSON(row.reactions, {}) || {};
    reactions[action] = (reactions[action] || 0) + 1;
    await env.DB.prepare('UPDATE community_posts SET reactions = ? WHERE id = ?').bind(JSON.stringify(reactions), id).run();
  } else {
    return bad('unknown action');
  }

  const row = await env.DB.prepare('SELECT * FROM community_posts WHERE id = ?').bind(id).first();
  return json({ post: row ? rowToPost(row) : null });
}
