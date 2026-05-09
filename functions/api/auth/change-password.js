import { hashPassword, verifyPassword, json, bad } from '../../_lib/auth.js';
import { requireUser } from '../_middleware.js';

export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const { current, next } = await request.json().catch(() => ({}));
  if (!current || !next) return bad('current and next password required');
  if (next.length < 6) return bad('new password must be at least 6 characters');

  const row = await env.DB.prepare(
    'SELECT password_hash, password_salt FROM users WHERE id = ?'
  ).bind(data.user.id).first();
  if (!row) return bad('user not found', 404);

  const ok = await verifyPassword(current, row.password_hash, row.password_salt);
  if (!ok) return bad('current password is incorrect', 401);

  const { password_hash, password_salt } = await hashPassword(next);
  await env.DB.prepare(
    'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?'
  ).bind(password_hash, password_salt, data.user.id).run();

  return json({ ok: true });
}
