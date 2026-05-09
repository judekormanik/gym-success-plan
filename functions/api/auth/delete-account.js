import { verifyPassword, clearSessionCookie, json, bad } from '../../_lib/auth.js';
import { requireUser } from '../_middleware.js';

// Hard-delete the account. ON DELETE CASCADE handles related rows.
export async function onRequestPost({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const { password } = await request.json().catch(() => ({}));
  if (!password) return bad('password required');

  const row = await env.DB.prepare(
    'SELECT password_hash, password_salt FROM users WHERE id = ?'
  ).bind(data.user.id).first();
  if (!row) return bad('user not found', 404);
  const ok = await verifyPassword(password, row.password_hash, row.password_salt);
  if (!ok) return bad('password incorrect', 401);

  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(data.user.id).run();

  return json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
}
