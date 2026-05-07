// Shared auth helpers for Cloudflare Pages Functions.
// All crypto uses Web Crypto (no npm deps, runs natively in Workers).

const enc = new TextEncoder();
const dec = new TextDecoder();

const SESSION_COOKIE = 'gsp_session';
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days
const PBKDF2_ITERATIONS = 100_000;

// ─── Helpers ─────────────────────────────────────────
export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const a = crypto.getRandomValues(new Uint8Array(16));
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  const h = [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => Uint8Array.from(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));

const b64url = (buf) => {
  const bin = String.fromCharCode(...new Uint8Array(buf));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const b64urlDecode = (str) => {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

// ─── Password hashing (PBKDF2-SHA256) ─────────────────
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return { password_hash: toHex(hash), password_salt: toHex(salt) };
}

export async function verifyPassword(password, hashHex, saltHex) {
  if (!hashHex || !saltHex) return false;
  const salt = fromHex(saltHex);
  const hash = await pbkdf2(password, salt);
  return constantTimeEqual(toHex(hash), hashHex);
}

async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// ─── Session tokens (compact JWT-style: payload.signature) ─────────
export async function createSession(userId, secret) {
  const payload = {
    uid: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
  };
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await sign(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export async function readSession(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  const expected = await sign(payloadB64, secret);
  if (!constantTimeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(dec.decode(b64urlDecode(payloadB64)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function sign(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret || 'dev-insecure-secret'),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64url(sig);
}

// ─── Cookie helpers ──────────────────────────────────
export function setSessionCookie(token) {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SEC}`,
  ].join('; ');
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readCookie(request, name = SESSION_COOKIE) {
  const header = request.headers.get('Cookie') || '';
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

// ─── Convenience: get user from a request ─────────────
export async function getUserFromRequest(request, env) {
  const token = readCookie(request);
  if (!token) return null;
  const session = await readSession(token, env.AUTH_SECRET);
  if (!session?.uid) return null;
  const row = await env.DB.prepare(
    'SELECT id, email, name, goal, weight, height, experience, bmr, calorie_target, ' +
    'subscription_status, subscription_expires, stripe_customer_id, current_streak, longest_streak, ' +
    'last_workout_date, pwa_installed, onboarded, created_at FROM users WHERE id = ?'
  ).bind(session.uid).first();
  return row || null;
}

// ─── JSON response helper ────────────────────────────
export function json(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    status: init.status || 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

export function bad(msg, status = 400) {
  return json({ error: msg }, { status });
}
