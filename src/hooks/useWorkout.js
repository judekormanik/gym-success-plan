import { useMemo } from 'react';
import useStore from '../store/useStore.js';
import { PLAN } from '../utils/constants.js';
import { dateKey } from '../utils/calculations.js';

export default function useWorkout() {
  const workouts = useStore((s) => s.workouts);
  const sets = useStore((s) => s.sets);
  const saveWorkout = useStore((s) => s.saveWorkout);

  const todayPlan = useMemo(() => {
    const lastDay = workouts[0]?.day_number || 0;
    const next = lastDay >= 4 ? 1 : lastDay + 1;
    return PLAN.find((p) => p.day === next) || PLAN[0];
  }, [workouts]);

  const weekCount = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return workouts.filter((w) => new Date(w.completed_at) >= start).length;
  }, [workouts]);

  const lastSession = (exerciseName) => {
    const found = sets
      .filter((s) => s.exercise_name === exerciseName)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
    return found.slice(0, 4);
  };

  return { todayPlan, weekCount, workouts, sets, saveWorkout, lastSession };
}
