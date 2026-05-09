import { GOALS } from './constants.js';

// Mifflin-St Jeor BMR. Male: +5, Female: -161, "other" averages the two.
export function calcBMR({ weightKg, heightCm, age = 30, sex = 'm' }) {
  if (!weightKg || !heightCm) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'f') return Math.round(base - 161);
  if (sex === 'o') return Math.round(base - 78);
  return Math.round(base + 5);
}

export const ACTIVITY_LEVELS = [
  { id: 'sedentary',   label: 'Sedentary',          mult: 1.2,    desc: 'Little or no exercise' },
  { id: 'light',       label: 'Lightly active',     mult: 1.375,  desc: '1-3 sessions / week' },
  { id: 'moderate',    label: 'Moderately active',  mult: 1.55,   desc: '3-5 sessions / week' },
  { id: 'very',        label: 'Very active',        mult: 1.725,  desc: '6-7 sessions / week' },
  { id: 'athlete',     label: 'Athlete',            mult: 1.9,    desc: 'Hard daily training' },
];

export function activityMultiplier(id) {
  const a = ACTIVITY_LEVELS.find((x) => x.id === id);
  return a ? a.mult : 1.55;
}

// TDEE = BMR × activity multiplier. Falls back to BMR if no activity set.
export function calcTDEE(bmr, activityLevel) {
  if (!bmr) return 0;
  return Math.round(bmr * activityMultiplier(activityLevel));
}

// Goal-adjusted daily calorie target. Goes off TDEE when activity is known,
// otherwise off BMR (legacy behaviour).
export function calcCalorieTarget(bmr, goalId, activityLevel) {
  const base = activityLevel ? calcTDEE(bmr, activityLevel) : (bmr || 0);
  const goal = GOALS.find((g) => g.id === goalId) || GOALS[1];
  return Math.max(1200, Math.round(base + goal.delta));
}

export function calcMacroTargets({ calories = 0, weightKg = 0, goalId = 'maintain' }) {
  const proteinPerKg = goalId === 'cut' ? 2.4 : goalId === 'bulk' ? 2.0 : 2.2;
  const protein = Math.round(weightKg * proteinPerKg);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));
  return { protein, carbs, fats, calories };
}

export function sumMacros(entries = []) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (Number(e.calories) || 0),
      protein: acc.protein + (Number(e.protein) || 0),
      carbs: acc.carbs + (Number(e.carbs) || 0),
      fats: acc.fats + (Number(e.fats) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

export function epley1RM(weight, reps) {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30));
}

export function isPersonalRecord(prev = [], weight, reps) {
  if (!weight || !reps) return false;
  const newScore = epley1RM(weight, reps);
  if (!prev.length) return true;
  const best = Math.max(...prev.map((p) => epley1RM(p.weight, p.reps)));
  return newScore > best;
}

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a, b) {
  const ms = new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function calcStreak(workouts = []) {
  if (!workouts.length) return { current: 0, longest: 0 };
  const days = Array.from(
    new Set(workouts.filter((w) => w.completed_at).map((w) => dateKey(new Date(w.completed_at))))
  ).sort();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = daysBetween(days[i - 1], days[i]);
    if (diff === 1) { run++; longest = Math.max(longest, run); }
    else if (diff !== 0) { run = 1; }
  }

  let current = 0;
  const today = dateKey();
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  let cursor = days.includes(today) ? today : days.includes(yesterday) ? yesterday : null;
  if (cursor) {
    current = 1;
    for (let i = days.indexOf(cursor) - 1; i >= 0; i--) {
      if (daysBetween(days[i], days[i + 1]) === 1) current++;
      else break;
    }
  }
  return { current, longest: Math.max(longest, current) };
}

export function exportToCSV(rows = []) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

export function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatRelative(date) {
  if (!date) return '';
  const diff = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}
