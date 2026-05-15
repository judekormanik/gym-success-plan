import { ChevronRight } from 'lucide-react';
import ExerciseTile from './ExerciseTile.jsx';
import { EXERCISES as CURATED } from '../utils/exerciseLibrary.js';
import useExerciseLibrary from '../hooks/useExerciseLibrary.js';

// Match Foundation-Plan exercise names (e.g. "Rack pulls") against the
// curated library + full DB by name so we can render proper photo tiles.
function findExerciseByName(name, fullLibrary) {
  if (!name) return null;
  const n = name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
  const matchers = [
    (e) => e.name.toLowerCase() === n,
    (e) => e.name.toLowerCase().startsWith(n),
    (e) => n.includes(e.name.toLowerCase()),
    (e) => e.name.toLowerCase().includes(n.split(' ')[0]),
  ];
  for (const m of matchers) {
    const c = CURATED.find(m);
    if (c) return c;
    const f = (fullLibrary || []).find(m);
    if (f) return f;
  }
  return null;
}

export default function WorkoutCard({ day, active, onClick }) {
  const { exercises: fullLib } = useExerciseLibrary();
  const totalSets = day.exercises.reduce((a, e) => a + (Number(e.sets) || 0), 0);

  // Resolve up to 3 preview tiles by name
  const previews = day.exercises.slice(0, 3)
    .map((row, i) => ({ key: row.name + i, ex: findExerciseByName(row.name, fullLib) }))
    .filter((p) => p.ex);

  return (
    <button
      onClick={onClick}
      className="card hover"
      style={{
        textAlign: 'left',
        cursor: 'pointer',
        borderColor: active ? 'rgba(212,175,55,0.5)' : 'var(--border)',
        background: active ? 'linear-gradient(180deg, rgba(212,175,55,0.06), transparent), var(--surface)' : 'var(--surface)',
        padding: 16,
      }}
    >
      <div className="row-between" style={{ marginBottom: 10 }}>
        <span className="eyebrow">Day {day.day}</span>
        <ChevronRight size={16} style={{ color: 'var(--text-mute)' }} />
      </div>
      <div className="h3" style={{ marginBottom: 10 }}>{day.name}</div>

      {/* Photo tile previews — match the look of CustomCard */}
      {previews.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(3, previews.length)}, 1fr)`,
          gap: 6,
          marginBottom: 10,
        }}>
          {previews.map(({ key, ex }) => <ExerciseTile key={key} exercise={ex} size="sm" />)}
        </div>
      )}

      {/* Exercise list (compact) */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {day.exercises.slice(0, 4).map((ex, i) => (
          <li key={ex.name + i} className="muted" style={{ fontSize: 12 }}>
            {ex.name} · {ex.sets} sets
          </li>
        ))}
        {day.exercises.length > 4 && (
          <li className="muted" style={{ fontSize: 12 }}>+{day.exercises.length - 4} more</li>
        )}
      </ul>

      <div className="muted" style={{ fontSize: 11, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        {day.exercises.length} exercises · {totalSets} sets
      </div>
    </button>
  );
}
