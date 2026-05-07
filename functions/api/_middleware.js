// Pages Functions middleware: attach user to data for every /api/* route.
// Routes that need auth call requireUser(data); public routes ignore data.user.

import { getUserFromRequest } from '../_lib/auth.js';

export async function onRequest(context) {
  const { request, env, next, data } = context;
  data.user = await getUserFromRequest(request, env);
  return next();
}

export function requireUser(data) {
  if (!data.user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
