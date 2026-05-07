import { useMemo } from 'react';
import useStore from '../store/useStore.js';
import { calcMacroTargets, sumMacros, dateKey } from '../utils/calculations.js';

export default function useNutrition() {
  const profile = useStore((s) => s.profile);
  const nutrition = useStore((s) => s.nutrition);
  const logFood = useStore((s) => s.logFood);
  const removeFood = useStore((s) => s.removeFood);

  const today = dateKey();
  const todays = useMemo(
    () => nutrition.filter((n) => dateKey(new Date(n.logged_at)) === today),
    [nutrition, today]
  );

  const targets = useMemo(
    () =>
      calcMacroTargets({
        calories: profile?.calorie_target || 0,
        weightKg: Number(profile?.weight) || 0,
        goalId: profile?.goal || 'maintain',
      }),
    [profile?.calorie_target, profile?.weight, profile?.goal]
  );

  const totals = useMemo(() => sumMacros(todays), [todays]);

  return { targets, totals, todays, logFood, removeFood, allEntries: nutrition };
}
