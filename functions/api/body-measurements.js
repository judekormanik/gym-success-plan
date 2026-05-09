import { json, bad, uuid } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

const FIELDS = ['chest','waist','hips','left_arm','right_arm','left_thigh','right_thigh','neck','calf'];

export async function onRequestGet({ env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const r = await env.DB.prepare(
    'SELECT * FROM body_measurements WHERE user_id = ? ORDER BY logged_at DESC LIMIT 365'
  ).bind(data.user.id).all();
  return json({ measurements: r.results || [] });
}

// POST body: { chest?, waist?, hips?, left_arm?, right_arm?, left_thigh?, right_thigh?, neck?, calf?, notes? }
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  const values = FIELDS.map((f) => {
    const v = body[f];
    return v != null && v !== '' ? Number(v) : null;
  });
  if (values.every((v) => v == null) && !body.notes) {
    return bad('at least one measurement required');
  }
  const id = uuid();
  const now = new Date().toISOString();
  const cols = ['id','user_id', ...FIELDS, 'notes', 'logged_at'];
  const placeholders = cols.map(() => '?').join(',');
  await env.DB.prepare(
    `INSERT INTO body_measurements (${cols.join(',')}) VALUES (${placeholders})`
  ).bind(id, data.user.id, ...values, body.notes || '', now).run();
  return json({ entry: { id, user_id: data.user.id, ...Object.fromEntries(FIELDS.map((f, i) => [f, values[i]])), notes: body.notes || '', logged_at: now } });
}

export async function onRequestDelete({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return bad('id required');
  await env.DB.prepare('DELETE FROM body_measurements WHERE id = ? AND user_id = ?').bind(id, data.user.id).run();
  return json({ ok: true });
}
