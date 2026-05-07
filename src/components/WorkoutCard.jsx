import { ChevronRight } from 'lucide-react';

export default function WorkoutCard({ day, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card hover"
      style={{
        textAlign: 'left',
        cursor: 'pointer',
        borderColor: active ? 'rgba(212,175,55,0.5)' : 'var(--border)',
        background: active ? 'linear-gradient(180deg, rgba(212,175,55,0.06), transparent), var(--surface)' : 'var(--surface)',
        padding: 18,
      }}
    >
      <div className="row-between" style={{ marginBottom: 8 }}>
        <span className="eyebrow">Day {day.day}</span>
        <ChevronRight size={16} style={{ color: 'var(--text-mute)' }} />
      </div>
      <div className="h3" style={{ marginBottom: 10 }}>{day.name}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {day.exercises.slice(0, 3).map((ex) => (
          <li key={ex.name} className="muted" style={{ fontSize: 12 }}>
            {ex.name} · {ex.sets} sets
          </li>
        ))}
        {day.exercises.length > 3 && (
          <li className="muted" style={{ fontSize: 12 }}>+{day.exercises.length - 3} more</li>
        )}
      </ul>
    </button>
  );
}
