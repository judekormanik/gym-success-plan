import { useEffect, useMemo } from 'react';
import useStore from '../store/useStore.js';
import { Trophy } from 'lucide-react';

export default function PRCelebration() {
  const pr = useStore((s) => s.prCelebration);
  const pieces = useMemo(() => Array.from({ length: 60 }), []);
  if (!pr) return null;
  return (
    <>
      <div className="confetti">
        {pieces.map((_, i) => (
          <span
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${1.6 + Math.random() * 1.6}s`,
              animationDelay: `${Math.random() * 0.4}s`,
              background: i % 3 === 0 ? '#fff' : i % 3 === 1 ? 'var(--gold)' : '#b08820',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
      <div className="toast-stack">
        <div className="toast" style={{ background: 'var(--gold)', color: '#0a0a0a', borderColor: 'transparent', fontWeight: 700 }}>
          <Trophy size={14} />
          New PR · {pr.exercise_name} · {pr.weight}kg × {pr.reps}
        </div>
      </div>
    </>
  );
}
