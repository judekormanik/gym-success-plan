import { useEffect } from 'react';
import useStore from '../store/useStore.js';
import { calcBMR, calcCalorieTarget } from '../utils/calculations.js';

export default function useProfile() {
  const profile = useStore((s) => s.profile);
  const saveProfile = useStore((s) => s.saveProfile);

  useEffect(() => {
    if (!profile?.weight || !profile?.height || !profile?.goal) return;
    const bmr = calcBMR({ weightKg: Number(profile.weight), heightCm: Number(profile.height), age: Number(profile.age) || 30 });
    const target = calcCalorieTarget(bmr, profile.goal);
    if (profile.bmr !== bmr || profile.calorie_target !== target) {
      saveProfile({ bmr, calorie_target: target });
    }
  }, [profile?.weight, profile?.height, profile?.goal, profile?.age]);

  return profile;
}
