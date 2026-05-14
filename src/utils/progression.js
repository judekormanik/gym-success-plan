// Auto-progression: given a user's history for an exercise, suggest the next
// weight × reps to attempt. Conservative double-progression model:
//
//   1. Find the most recent session for this exercise (set of rows with the
//      same exercise_name, same completed_at minute).
//   2. If user hit the target on every set last time -> add a small bump.
//      Bumps are unit-aware: ~2.5% of last weight, rounded to a sane
//      increment (2.5kg / 5lb for compound, 1kg / 2.5lb for small movements).
//   3. If user missed reps on any set -> repeat the same weight, aim to
//      complete the target rep range first.
//   4. If no history -> suggest a starting weight based on best effort.

import { kgToLb, lbToKg } from './units.js';

// Compound lifts get bigger jumps; isolation gets smaller jumps.
const COMPOUND_HINTS = [
  'squat', 'deadlift', 'bench', 'press', 'row', 'pull', 'rack pull', 'clean',
];
function isCompound(exerciseName = '') {
  const n = exerciseName.toLowerCase();
  return COMPOUND_HINTS.some((k) => n.includes(k));
}

// Round to the nearest practical plate jump.
function roundIncrement(weight, units, compound) {
  if (units === 'imperial') {
    const step = compound ? 5 : 2.5; // lb
    return Math.round(weight / step) * step;
  }
  const step = compound ? 2.5 : 1; // kg
  return Math.round(weight / step) * step;
}

// Parse a repsTarget like "8-10", "8", "6-8", "45 sec" -> { lo, hi } or null
function parseRepsTarget(repsTarget) {
  if (!repsTarget) return null;
  const s = String(repsTarget).toLowerCase();
  if (/sec|min|step|m\b/.test(s)) return null; // time-based, no progression
  const m = s.match(/(\d+)(?:\s*[-–]\s*(\d+))?/);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = m[2] ? Number(m[2]) : lo;
  return { lo, hi };
}

// Group sets by an approximate session window (10-minute buckets).
function groupBySession(sets) {
  const sorted = [...sets].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  const sessions = [];
  for (const s of sorted) {
    const ts = new Date(s.completed_at).getTime();
    const last = sessions[sessions.length - 1];
    if (!last || Math.abs(new Date(last[0].completed_at).getTime() - ts) > 1000 * 60 * 60 * 4) {
      sessions.push([s]);
    } else {
      last.push(s);
    }
  }
  return sessions;
}

/**
 * @param history         array of set rows for this exercise (newest or oldest order doesn't matter)
 * @param repsTarget      the workout's reps target string (e.g. "8-10")
 * @param units           'metric' | 'imperial' — for display + rounding
 * @param exerciseName    used to bias compound vs isolation increments
 */
export function suggestNext({ history = [], repsTarget = '', units = 'metric', exerciseName = '' }) {
  const target = parseRepsTarget(repsTarget);
  const sessions = groupBySession(history);
  const lastSession = sessions[0];

  // No prior data — we can't fabricate a real number, just nudge them to start.
  if (!lastSession || lastSession.length === 0) {
    return {
      kind: 'first-time',
      label: target
        ? `Start with a manageable weight aiming for ${target.lo}${target.hi !== target.lo ? `-${target.hi}` : ''} reps`
        : 'Pick a weight you can do for 8-10 quality reps',
    };
  }

  const compound = isCompound(exerciseName);
  // Average weight in the last session (some folks pyramid; we use the top set)
  const topWeight = lastSession.reduce((m, s) => Math.max(m, Number(s.weight) || 0), 0);
  if (!topWeight) {
    return {
      kind: 'first-time',
      label: 'Pick a weight you can move with quality reps',
    };
  }

  // Did they hit the target on every set?
  const hitTarget = target
    ? lastSession.every((s) => Number(s.reps) >= target.lo)
    : lastSession.every((s, _, arr) => Number(s.reps) >= Math.max(...arr.map((x) => Number(x.reps))) - 1);

  let suggestedKg;
  let kind;
  if (hitTarget) {
    // Bump: ~2.5% but rounded to the nearest plate jump
    const bumpKg = compound ? 2.5 : 1.25;
    suggestedKg = roundIncrement(topWeight + bumpKg, 'metric', compound);
    kind = 'bump';
  } else {
    suggestedKg = topWeight;
    kind = 'repeat';
  }

  // Reps suggestion: aim for the top of the range if bumping, else the bottom
  const repsHint = target
    ? (hitTarget ? `${target.hi}` : `${target.lo}-${target.hi}`)
    : `${Math.max(...lastSession.map((s) => Number(s.reps) || 0))}`;

  const display = units === 'imperial'
    ? `${kgToLb(suggestedKg).toFixed(suggestedKg % 1 ? 1 : 0)} lb`
    : `${Number.isInteger(suggestedKg) ? suggestedKg : suggestedKg.toFixed(1)} kg`;

  return {
    kind,
    suggestedKg,
    repsHint,
    display,
    label: kind === 'bump'
      ? `Try ${display} × ${repsHint}`
      : `Repeat ${display} × ${repsHint} — hit it cleanly`,
    lastWeight: topWeight,
    lastWeightDisplay: units === 'imperial'
      ? `${kgToLb(topWeight).toFixed(topWeight % 1 ? 1 : 0)} lb`
      : `${Number.isInteger(topWeight) ? topWeight : topWeight.toFixed(1)} kg`,
  };
}

/**
 * Warmup ladder: given the working weight (in kg) and reps target,
 * returns 3-4 warmup sets that ramp up. Skips warmups for very light loads.
 *
 *  e.g. working 100kg / 8 reps -> [
 *    { weight: 40, reps: 8 },
 *    { weight: 60, reps: 5 },
 *    { weight: 80, reps: 3 },
 *  ]
 */
export function generateWarmup(workingKg, units = 'metric', { compound = true } = {}) {
  if (!workingKg || workingKg <= 0) return [];
  const bar = units === 'imperial' ? 20.4 : 20; // ~45lb / 20kg standard bar
  if (workingKg < bar * 1.8) return []; // bar warmups only — no ladder needed

  const round = (kg) => {
    if (units === 'imperial') {
      const lb = kgToLb(kg);
      const step = compound ? 5 : 2.5;
      return lbToKg(Math.round(lb / step) * step);
    }
    const step = compound ? 2.5 : 1;
    return Math.round(kg / step) * step;
  };

  const steps = [
    { pct: 0.4, reps: 8 },
    { pct: 0.6, reps: 5 },
    { pct: 0.8, reps: 3 },
  ];

  return steps.map((s) => {
    const kg = round(workingKg * s.pct);
    return {
      weight: kg,
      display: units === 'imperial'
        ? `${kgToLb(kg).toFixed(kg % 1 ? 1 : 0)} lb`
        : `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`,
      reps: s.reps,
      pct: Math.round(s.pct * 100),
    };
  });
}
