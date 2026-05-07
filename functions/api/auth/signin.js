import { verifyPassword, createSession, setSessionCookie, json, bad } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) return bad('email and password required');

  const row = await env.DB.prepare(
    'SELECT id, email, password_hash, password_salt, name, onboarded FROM users WHERE email = ?'
  ).bind(email).first();
  if (!row) return bad('invalid credentials', 401);

  const ok = await verifyPassword(password, row.password_hash, row.password_salt);
  if (!ok) return bad('invalid credentials', 401);

  const token = await createSession(row.id, env.AUTH_SECRET);
  return json(
    { user: { id: row.id, email: row.email, name: row.name, onboarded: row.onboarded } },
    { headers: { 'Set-Cookie': setSessionCookie(token) } }
  );
}
