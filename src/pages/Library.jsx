import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, X, Plus } from 'lucide-react';
import { EXERCISES, MUSCLE_GROUPS } from '../utils/exerciseLibrary.js';
import ExerciseTile from '../components/ExerciseTile.jsx';

export default function Library() {
  const navigate = useNavigate();
  const [muscle, setMuscle] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return EXERCISES.filter((e) =>
      (muscle === 'all' || e.muscle === muscle) &&
      (!ql || e.name.toLowerCase().includes(ql))
    );
  }, [muscle, q]);

  return (
    <div className="fade-in">
      <div className="row gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ChevronLeft size={14} /> Back
        </button>
        <div>
          <div className="eyebrow">Library</div>
          <h1 className="h2" style={{ marginTop: 4 }}>Browse exercises</h1>
        </div>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-mute)',
          }} />
          <input
            className="input"
            placeholder="Search 60+ exercises…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <div className="row" style={{ marginTop: 12, gap: 8, overflowX: 'auto', flexWrap: 'wrap' }}>
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setMuscle(g.id)}
              className="pill"
              style={{
                cursor: 'pointer',
                background: muscle === g.id ? 'var(--gold)' : 'var(--surface-2)',
                color: muscle === g.id ? '#0a0a0a' : 'var(--text-dim)',
                borderColor: muscle === g.id ? 'var(--gold)' : 'var(--border)',
                fontWeight: muscle === g.id ? 600 : 500,
                padding: '6px 12px',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 10,
      }}>
        {filtered.map((ex) => (
          <ExerciseTile
            key={ex.id}
            exercise={ex}
            size="md"
            onClick={() => setSelected(ex)}
          />
        ))}
        {!filtered.length && (
          <div className="muted" style={{ padding: 32, textAlign: 'center', gridColumn: '1 / -1' }}>
            No matches.
          </div>
        )}
      </div>

      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} onAdd={() => {
        navigate('/workout/build', { state: { addExerciseId: selected.id } });
      }} />}
    </div>
  );
}

function ExerciseModal({ exercise, onClose, onAdd }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card slide-up" style={{
        width: '100%', maxWidth: 460, padding: 20, maxHeight: '85vh', overflow: 'auto',
      }}>
        <div className="row-between mb-4">
          <div className="eyebrow">Exercise detail</div>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>
        <ExerciseTile exercise={exercise} size="lg" />
        <div className="h3" style={{ marginTop: 14 }}>{exercise.name}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4, textTransform: 'capitalize' }}>
          {exercise.muscle} · {exercise.equipment}
        </div>
        {exercise.instructions?.length ? (
          <ol style={{ paddingLeft: 18, margin: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            {exercise.instructions.map((step, i) => (
              <li key={i} className="muted">{step}</li>
            ))}
          </ol>
        ) : null}
        <button onClick={onAdd} className="btn btn-gold btn-block btn-lg" style={{ marginTop: 18 }}>
          <Plus size={16} /> Add to a custom workout
        </button>
      </div>
    </div>
  );
}
