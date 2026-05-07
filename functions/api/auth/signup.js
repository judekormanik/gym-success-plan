import { hashPassword, createSession, setSessionCookie, uuid, json, bad } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const { email, password, name } = await request.json().catch(() => ({}));
  if (!email || !password) return bad('email and password required');
  if (password.length < 6) return bad('password must be at least 6 characters');

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return bad('an account with this email already exists', 409);

  const id = uuid();
  const { password_hash, password_salt } = await hashPassword(password);

  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, password_salt, name, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))'
  ).bind(id, email, password_hash, password_salt, name || null).run();

  const token = await createSession(id, env.AUTH_SECRET);
  return json(
    { user: { id, email, name: name || null, onboarded: 0 } },
    { headers: { 'Set-Cookie': setSessionCookie(token) } }
  );
}
