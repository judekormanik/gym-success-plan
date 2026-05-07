export const APP_NAME = 'The Gym Success Plan';
export const APP_TAGLINE = 'The system that actually works';
export const PRICE_USD = 19.99;
export const MONTHLY_EQ = (PRICE_USD / 12).toFixed(2);

export const GOALS = [
  { id: 'cut', label: 'Cut', desc: 'Lose body fat while preserving muscle.', delta: -400 },
  { id: 'maintain', label: 'Maintain', desc: 'Hold weight and recomp.', delta: 0 },
  { id: 'bulk', label: 'Bulk', desc: 'Add lean mass with controlled calories.', delta: 400 },
];

export const EXPERIENCE = [
  { id: 'beginner', label: 'Beginner', desc: 'New to consistent training.' },
  { id: 'intermediate', label: 'Intermediate', desc: '6+ months of regular training.' },
  { id: 'advanced', label: 'Advanced', desc: '2+ years and tracking lifts.' },
];

export const QUOTES = [
  'The system that actually works.',
  'Discipline beats motivation. Show up.',
  'Small lifts, stacked daily, become your future.',
  'You don\'t need more, you need consistent.',
  'Train the body. Forge the mind.',
  'Progress is the only proof.',
  'One percent better, every session.',
  'Your future is built one rep at a time.',
];

export const PLAN = [
  {
    day: 1,
    name: 'Back',
    exercises: [
      { name: 'Rack pulls', sets: 4 },
      { name: 'Row variation', sets: 3 },
      { name: 'Lat pulldown or pull-ups', sets: 3 },
      { name: 'Rear delts (superset with traps)', sets: 3 },
      { name: 'Lat pullover', sets: 3 },
    ],
  },
  {
    day: 2,
    name: 'Chest & Shoulders',
    exercises: [
      { name: 'Bench press', sets: 4 },
      { name: 'Incline press', sets: 4 },
      { name: 'Flys', sets: 3 },
      { name: 'Shoulder press', sets: 3 },
      { name: 'Lateral & front flys', sets: 3 },
      { name: 'Weighted push-ups (optional)', sets: 3, optional: true },
    ],
  },
  {
    day: 3,
    name: 'Legs & Abs',
    exercises: [
      { name: 'Hanging knee raises', sets: 3 },
      { name: 'Plank', sets: 3 },
      { name: 'Squats', sets: 4 },
      { name: 'Quad extensions', sets: 4 },
      { name: 'Hamstring curls', sets: 3 },
    ],
  },
  {
    day: 4,
    name: 'Arms & Forearms',
    exercises: [
      { name: 'Close grip bench press', sets: 4 },
      { name: 'Skull crushers', sets: 3 },
      { name: 'Hammer curls', sets: 3 },
      { name: 'Bicep curls', sets: 3 },
      { name: 'Reverse curls', sets: 2 },
    ],
  },
];

export const STREAK_MILESTONES = [7, 30, 90];
