#!/usr/bin/env node
// Builds public/exercises.json from the free-exercise-db source.
// Source: yuhonas/free-exercise-db (Unlicense / public domain)
// Output: a slimmer, app-shaped JSON that the Library/Builder consume at runtime.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/exercises.json');
const CACHE = resolve(__dirname, '../node_modules/.cache/exercises-source.json');

// Fetch the source (cached after first build).
const SOURCE_URL = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json';
async function loadSource() {
  if (existsSync(CACHE)) return readFileSync(CACHE, 'utf8');
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error('Failed to fetch free-exercise-db: ' + res.status);
  const text = await res.text();
  try {
    const { mkdirSync } = await import('node:fs');
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, text);
  } catch {}
  return text;
}

// Map free-exercise-db primary muscles -> our muscle group buckets
const MUSCLE_TO_GROUP = {
  lats: 'back',
  'middle back': 'back',
  'lower back': 'back',
  traps: 'back',
  chest: 'chest',
  shoulders: 'shoulders',
  neck: 'shoulders',
  quadriceps: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  calves: 'legs',
  abductors: 'legs',
  adductors: 'legs',
  biceps: 'arms',
  triceps: 'arms',
  forearms: 'arms',
  abdominals: 'core',
};

const EQUIPMENT_MAP = {
  barbell: 'barbell',
  'e-z curl bar': 'barbell',
  dumbbell: 'dumbbell',
  kettlebells: 'kettlebell',
  cable: 'cable',
  machine: 'machine',
  'body only': 'bodyweight',
  bands: 'bands',
  'medicine ball': 'other',
  'exercise ball': 'other',
  'foam roll': 'other',
  other: 'other',
};

const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';

const raw = JSON.parse(await loadSource());

function transform(e) {
  const primary = (e.primaryMuscles || [])[0];
  const muscle = MUSCLE_TO_GROUP[primary] || 'full';
  const equipment = EQUIPMENT_MAP[e.equipment] || 'other';

  // The first instruction often duplicates the title. We trim instructions that
  // are very long (over 200 chars) to keep the JSON small but actually useful.
  const instructions = (e.instructions || []).map((s) => s.trim()).filter(Boolean);

  // Pick a sensible default set count by category & primary muscle
  const defaultSets = e.category === 'cardio' ? 1
    : muscle === 'legs' || muscle === 'back' || muscle === 'chest' ? 3
    : 3;

  const id = e.id; // keep upstream IDs verbatim — that's what the image folders use

  return {
    id,
    name: e.name,
    muscle,
    primaryMuscles: e.primaryMuscles || [],
    secondaryMuscles: e.secondaryMuscles || [],
    equipment,
    level: e.level || null,
    force: e.force || null,
    mechanic: e.mechanic || null,
    category: e.category || null,
    defaultSets,
    instructions,
    image: (e.images && e.images[0]) ? `${CDN}/${e.images[0]}` : null,
    imageAlt: (e.images && e.images[1]) ? `${CDN}/${e.images[1]}` : null,
    curated: false,
  };
}

const transformed = raw.map(transform);

// Mark known-good IDs as curated. These match the IDs in our hand-picked list
// (src/utils/exerciseLibrary.js). They get featured prominently.
const CURATED_IDS = new Set([
  'Rack_Pulls', 'Barbell_Deadlift', 'Bent_Over_Barbell_Row',
  'Pullups', 'Wide-Grip_Lat_Pulldown', 'Seated_Cable_Rows',
  'One-Arm_Dumbbell_Row', 'Straight-Arm_Pulldown', 'Face_Pull',
  'Barbell_Bench_Press_-_Medium_Grip', 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Dumbbell_Bench_Press', 'Incline_Dumbbell_Press', 'Cable_Crossover',
  'Dumbbell_Flyes', 'Pushups', 'Dips_-_Chest_Version',
  'Standing_Military_Press', 'Seated_Dumbbell_Press', 'Side_Lateral_Raise',
  'Front_Dumbbell_Raise', 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
  'Barbell_Shrug', 'Arnold_Dumbbell_Press',
  'Barbell_Squat', 'Front_Barbell_Squat', 'Romanian_Deadlift',
  'Leg_Press', 'Leg_Extensions', 'Lying_Leg_Curls',
  'Dumbbell_Lunges', 'Dumbbell_Squat_To_A_Bench', 'Standing_Calf_Raises',
  'Barbell_Hip_Thrust',
  'Close-Grip_Barbell_Bench_Press', 'EZ-Bar_Skullcrusher',
  'Triceps_Pushdown', 'Overhead_Cable_Curl',
  'Barbell_Curl', 'Dumbbell_Bicep_Curl', 'Hammer_Curls',
  'Preacher_Curl', 'Reverse_Barbell_Curl',
  'Seated_Dumbbell_Palms-Up_Wrist_Curl',
  'Plank', 'Hanging_Leg_Raise', 'Crunches',
  'Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists',
  'Cross-Body_Crunch', 'Ab_Roller',
  'Rowing_Stationary',
]);

for (const e of transformed) {
  if (CURATED_IDS.has(e.id)) e.curated = true;
}

// Stable alphabetical sort
transformed.sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(OUT, JSON.stringify(transformed));
console.log(`Wrote ${transformed.length} exercises (${transformed.filter((e) => e.curated).length} curated) to ${OUT}`);
