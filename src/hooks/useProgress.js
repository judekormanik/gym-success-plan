import { useMemo } from 'react';
import useStore from '../store/useStore.js';
import { epley1RM, dateKey } from '../utils/calculations.js';

export default function useProgress() {
  const sets = useStore((s) => s.sets);
  const personalRecords = useStore((s) => s.personalRecords);
  const bodyWeight = useStore((s) => s.bodyWeight);
  const workouts = useStore((s) => s.workouts);

  const exercises = useMemo(() => Array.from(new Set(sets.map((s) => s.exercise_name))).sort(), [sets]);

  const seriesFor = (exercise) =>
    sets
      .filter((s) => s.exercise_name === exercise)
      .map((s) => ({
        date: dateKey(new Date(s.completed_at)),
        oneRM: epley1RM(Number(s.weight), Number(s.reps)),
        weight: Number(s.weight),
      }))
      .reverse();

  const bodyWeightSeries = useMemo(
    () =>
      [...bodyWeight]
        .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at))
        .map((b) => ({ date: dateKey(new Date(b.logged_at)), weight: Number(b.weight) })),
    [bodyWeight]
  );

  const weeklyVolume = useMemo(() => {
    const weeks = {};
    sets.forEach((s) => {
      const d = new Date(s.completed_at);
      const start = new Date(d); start.setDate(d.getDate() - d.getDay());
      const key = dateKey(start);
      weeks[key] = (weeks[key] || 0) + (Number(s.weight) || 0) * (Number(s.reps) || 0);
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-8)
      .map(([date, volume]) => ({ date, volume }));
  }, [sets]);

  return { exercises, seriesFor, bodyWeightSeries, weeklyVolume, personalRecords, workouts };
}
