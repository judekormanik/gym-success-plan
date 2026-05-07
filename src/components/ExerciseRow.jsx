import { useState } from 'react';
import { Check, Zap } from 'lucide-react';

export default function ExerciseRow({ exercise, onCompleteSet, previous }) {
  const sets = Array.from({ length: exercise.sets });

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{exercise.name}</div>
          {exercise.optional && <div className="pill" style={{ marginTop: 6 }}>Optional</div>}
        </div>
        <span className="muted mono" style={{ fontSize: 12 }}>{exercise.sets} sets</span>
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
  const [weight, setWeight] = useState(previous?.weight || '');
  const [reps, setReps] = useState(previous?.reps || '');
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
        gridTemplateColumns: '32px 1fr 1fr auto auto',
        gap: 8,
        alignItems: 'center',
        padding: '8px 4px',
        borderRadius: 10,
        background: done ? 'rgba(34,197,94,0.06)' : 'transparent',
        transition: 'background 200ms',
      }}
    >
      <div className="mono muted" style={{ fontSize: 12, textAlign: 'center', width: 28 }}>#{index + 1}</div>
      <div>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          placeholder={previous?.weight ? `${previous.weight}` : 'kg'}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{ height: 38, padding: '8px 10px', fontSize: 13 }}
          disabled={done}
        />
        {previous?.weight && <div className="muted mono" style={{ fontSize: 10, marginTop: 2 }}>last {previous.weight}kg</div>}
      </div>
      <div>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          placeholder={previous?.reps ? `${previous.reps}` : 'reps'}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          style={{ height: 38, padding: '8px 10px', fontSize: 13 }}
          disabled={done}
        />
        {previous?.reps && <div className="muted mono" style={{ fontSize: 10, marginTop: 2 }}>× {previous.reps}</div>}
      </div>
      <button
        onClick={() => setDrop((v) => !v)}
        title="Drop set"
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: drop ? 'var(--gold-bg)' : 'transparent',
          border: '1px solid var(--border-strong)',
          color: drop ? 'var(--gold)' : 'var(--text-mute)',
        }}
        disabled={done}
      >
        <Zap size={14} />
      </button>
      <button
        onClick={submit}
        className={done ? 'checkbox checked' : 'checkbox'}
        title="Complete set"
        disabled={done}
      >
        <Check size={14} />
      </button>
    </div>
  );
}
