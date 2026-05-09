// Starter templates for the workout builder. Each template is a list of
// exerciseIds (matching exerciseLibrary.js) with sensible default sets and
// rep targets. Users can clone and customize — they're not "the" plan, just
// scaffolding.

export const TEMPLATES = [
  {
    id: 'ppl-push',
    name: 'Push (PPL)',
    description: 'Chest · shoulders · triceps',
    exercises: [
      { exerciseId: 'bench', sets: 4, repsTarget: '6-8', restSeconds: 120 },
      { exerciseId: 'incline-db', sets: 3, repsTarget: '8-10', restSeconds: 90 },
      { exerciseId: 'ohp', sets: 3, repsTarget: '6-8', restSeconds: 120 },
      { exerciseId: 'lateral', sets: 4, repsTarget: '12-15', restSeconds: 60 },
      { exerciseId: 'tri-pushdown', sets: 3, repsTarget: '10-12', restSeconds: 60 },
      { exerciseId: 'overhead-tri', sets: 3, repsTarget: '10-12', restSeconds: 60 },
    ],
  },
  {
    id: 'ppl-pull',
    name: 'Pull (PPL)',
    description: 'Back · rear delts · biceps',
    exercises: [
      { exerciseId: 'deadlift', sets: 3, repsTarget: '5', restSeconds: 180 },
      { exerciseId: 'pullup', sets: 4, repsTarget: '6-10', restSeconds: 120 },
      { exerciseId: 'bent-row', sets: 3, repsTarget: '8-10', restSeconds: 90 },
      { exerciseId: 'face-pull', sets: 3, repsTarget: '12-15', restSeconds: 60 },
      { exerciseId: 'bicep-curl', sets: 3, repsTarget: '8-12', restSeconds: 60 },
      { exerciseId: 'hammer', sets: 3, repsTarget: '10-12', restSeconds: 60 },
    ],
  },
  {
    id: 'ppl-legs',
    name: 'Legs (PPL)',
    description: 'Quads · hamstrings · calves · core',
    exercises: [
      { exerciseId: 'squat', sets: 4, repsTarget: '5-8', restSeconds: 180 },
      { exerciseId: 'rdl', sets: 3, repsTarget: '8-10', restSeconds: 120 },
      { exerciseId: 'leg-press', sets: 3, repsTarget: '10-12', restSeconds: 90 },
      { exerciseId: 'leg-curl', sets: 3, repsTarget: '10-12', restSeconds: 60 },
      { exerciseId: 'calf-raise', sets: 4, repsTarget: '12-15', restSeconds: 60 },
      { exerciseId: 'plank', sets: 3, repsTarget: '45 sec', restSeconds: 45 },
    ],
  },
  {
    id: 'upper',
    name: 'Upper Body',
    description: 'All upper-body movers in one session',
    exercises: [
      { exerciseId: 'bench', sets: 4, repsTarget: '6-8', restSeconds: 120 },
      { exerciseId: 'bent-row', sets: 4, repsTarget: '6-8', restSeconds: 120 },
      { exerciseId: 'ohp', sets: 3, repsTarget: '8-10', restSeconds: 90 },
      { exerciseId: 'lat-pulldown', sets: 3, repsTarget: '8-10', restSeconds: 90 },
      { exerciseId: 'lateral', sets: 3, repsTarget: '12-15', restSeconds: 60 },
      { exerciseId: 'bicep-curl', sets: 3, repsTarget: '10-12', restSeconds: 60 },
      { exerciseId: 'tri-pushdown', sets: 3, repsTarget: '10-12', restSeconds: 60 },
    ],
  },
  {
    id: 'lower',
    name: 'Lower Body',
    description: 'Quads, hamstrings, glutes, calves',
    exercises: [
      { exerciseId: 'squat', sets: 4, repsTarget: '5-8', restSeconds: 180 },
      { exerciseId: 'rdl', sets: 3, repsTarget: '8-10', restSeconds: 120 },
      { exerciseId: 'walking-lunge', sets: 3, repsTarget: '10 ea side', restSeconds: 90 },
      { exerciseId: 'leg-ext', sets: 3, repsTarget: '12-15', restSeconds: 60 },
      { exerciseId: 'leg-curl', sets: 3, repsTarget: '12-15', restSeconds: 60 },
      { exerciseId: 'calf-raise', sets: 4, repsTarget: '12-15', restSeconds: 60 },
    ],
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    description: 'Hit everything in one go',
    exercises: [
      { exerciseId: 'squat', sets: 3, repsTarget: '6-8', restSeconds: 120 },
      { exerciseId: 'bench', sets: 3, repsTarget: '6-8', restSeconds: 120 },
      { exerciseId: 'bent-row', sets: 3, repsTarget: '8-10', restSeconds: 90 },
      { exerciseId: 'ohp', sets: 2, repsTarget: '8-10', restSeconds: 90 },
      { exerciseId: 'plank', sets: 3, repsTarget: '45 sec', restSeconds: 45 },
    ],
  },
  {
    id: 'cardio',
    name: 'Cardio Day',
    description: 'Conditioning + light core',
    exercises: [
      { exerciseId: 'rower', sets: 1, repsTarget: '20 min', restSeconds: 0 },
      { exerciseId: 'plank', sets: 3, repsTarget: '60 sec', restSeconds: 30 },
      { exerciseId: 'hanging-knee-raise', sets: 3, repsTarget: '10-12', restSeconds: 45 },
    ],
  },
];

export function templateById(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}
