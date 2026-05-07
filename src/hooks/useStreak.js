import { useMemo } from 'react';
import useStore from '../store/useStore.js';
import { calcStreak } from '../utils/calculations.js';

export default function useStreak() {
  const workouts = useStore((s) => s.workouts);
  const profile = useStore((s) => s.profile);

  const calculated = useMemo(() => calcStreak(workouts), [workouts]);
  const current = profile?.current_streak ?? calculated.current;
  const longest = Math.max(profile?.longest_streak || 0, calculated.longest);
  return { current, longest };
}
