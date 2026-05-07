import { json, bad } from '../_lib/auth.js';
import { requireUser } from './_middleware.js';

const ALLOWED = [
  'name', 'goal', 'weight', 'height', 'experience', 'bmr', 'calorie_target',
  'current_streak', 'longest_streak', 'last_workout_date',
  'pwa_installed', 'onboarded',
];

export async function onRequestGet({ data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  return json({ profile: data.user });
}

export async function onRequestPatch({ request, env, data }) {
  const blocked = requireUser(data); if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  const cols = [];
  const vals = [];
  for (const k of ALLOWED) {
    if (k in body) {
      cols.push(`${k} = ?`);
      let v = body[k];
      if (k === 'pwa_installed' || k === 'onboarded') v = v ? 1 : 0;
      vals.push(v);
    }
  }
  if (!cols.length) return bad('no valid fields');
  vals.push(data.user.id);
  await env.DB.prepare(`UPDATE users SET ${cols.join(', ')} WHERE id = ?`).bind(...vals).run();

  const updated = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(data.user.id).first();
  delete updated.password_hash;
  delete updated.password_salt;
  return json({ profile: updated });
}
