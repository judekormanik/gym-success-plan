import { useState } from 'react';
import { Check, Zap } from 'lucide-react';

export default function ExerciseRow({ exercise, onCompleteSet, previous }) {
  const sets = Array.from({ length: exercise.sets });

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row-between" style={{ marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>{exercise.name}</div>
          {exercise.optional && <div className="pill" style={{ marginTop: 6 }}>Optional</div>}
        </div>
        <span className="muted mono" style={{ fontSize: 12, flexShrink: 0 }}>{exercise.sets} sets</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sets.map((_, i) => (
          <SetRow
            key={i}
            index={i}
            previous={previous?.[i]}
            onComplete={(data) => onCompleteSet({ exercise: exercise.name, setNumber: i + 1, ...data })}
          />
        ))}
      </div>
    </div>
  );
}

function SetRow({ index, previous, onComplete }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [drop, setDrop] = useState(false);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!weight || !reps) return;
    setDone(true);
    onComplete({ weight, reps, isDropSet: drop });
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr 1fr 40px 44px',
        gap: 6,
        alignItems: 'center',
        padding: '6px 0',
        borderRadius: 10,
        background: done ? 'rgba(34,197,94,0.06)' : 'transparent',
        transition: 'background 200ms',
      }}
    >
      <div className="mono muted" style={{ fontSize: 12, textAlign: 'center' }}>#{index + 1}</div>

      <div>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          placeholder={previous?.weight ? `${previous.weight}` : 'kg'}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{ minHeight: 44, padding: '8px 10px' }}
          disabled={done}
        />
        {previous?.weight ? (
          <div className="muted mono" style={{ fontSize: 10, marginTop: 2 }}>last {previous.weight}kg</div>
        ) : null}
      </div>

      <div>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          placeholder={previous?.reps ? `${previous.reps}` : 'reps'}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          style={{ minHeight: 44, padding: '8px 10px' }}
          disabled={done}
        />
        {previous?.reps ? (
          <div className="muted mono" style={{ fontSize: 10, marginTop: 2 }}>× {previous.reps}</div>
        ) : null}
      </div>

      <button
        onClick={() => setDrop((v) => !v)}
        title="Drop set"
        aria-label="Toggle drop set"
        style={{
          width: 40, height: 40, borderRadius: 8,
          background: drop ? 'var(--gold-bg)' : 'transparent',
          border: '1px solid var(--border-strong)',
          color: drop ? 'var(--gold)' : 'var(--text-mute)',
          display: 'grid',
          placeItems: 'center',
        }}
        disabled={done}
      >
        <Zap size={16} />
      </button>

      <button
        onClick={submit}
        className={done ? 'checkbox checked' : 'checkbox'}
        title="Complete set"
        aria-label="Complete set"
        disabled={done}
        style={{ width: 44, height: 44 }}
      >
        <Check size={18} />
      </button>
    </div>
  );
}
