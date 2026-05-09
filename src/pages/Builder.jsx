import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Plus, X, Check, Search, Save } from 'lucide-react';
import useStore from '../store/useStore.js';
import { EXERCISES, MUSCLE_GROUPS, exerciseById } from '../utils/exerciseLibrary.js';
import ExerciseTile from '../components/ExerciseTile.jsx';

export default function Builder() {
  const navigate = useNavigate();
  const location = useLocation();
  const saveCustomWorkout = useStore((s) => s.saveCustomWorkout);
  const pushToast = useStore((s) => s.pushToast);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [picks, setPicks] = useState([]); // [{exerciseId, sets}]
  const [pickerOpen, setPickerOpen] = useState(false);

  // If we got here from the Library "Add to a custom workout" button, prefill.
  useEffect(() => {
    const id = location.state?.addExerciseId;
    if (id && !picks.find((p) => p.exerciseId === id)) {
      const ex = exerciseById(id);
      if (ex) setPicks((p) => [...p, { exerciseId: id, sets: ex.defaultSets || 3 }]);
    }
  }, [location.state]);

  const addExercise = (exerciseId) => {
    if (picks.find((p) => p.exerciseId === exerciseId)) return;
    const ex = exerciseById(exerciseId);
    setPicks((p) => [...p, { exerciseId, sets: ex?.defaultSets || 3 }]);
  };
  const removeExercise = (exerciseId) => setPicks((p) => p.filter((x) => x.exerciseId !== exerciseId));
  const updateSets = (exerciseId, sets) => setPicks((p) => p.map((x) => x.exerciseId === exerciseId ? { ...x, sets } : x));

  const submit = async () => {
    if (!name.trim()) { pushToast('Give your workout a name', 'error'); return; }
    if (picks.length === 0) { pushToast('Add at least one exercise', 'error'); return; }
    await saveCustomWorkout({ name: name.trim(), description: description.trim(), exercises: picks });
    pushToast('Workout saved', 'success');
    navigate('/workout');
  };

  return (
    <div className="fade-in">
      <div className="row-between mb-4">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ChevronLeft size={14} /> Back
        </button>
        <button className="btn btn-gold btn-sm" onClick={submit}>
          <Save size={14} /> Save
        </button>
      </div>

      <div className="eyebrow">Builder</div>
      <h1 className="h2" style={{ marginTop: 4, marginBottom: 16 }}>Build your own workout</h1>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <label className="label">Workout name</label>
        <input
          className="input"
          placeholder="e.g. Push Day, Legs Heavy, Sunday Burn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="label" style={{ marginTop: 12 }}>Notes (optional)</label>
        <textarea
          className="textarea"
          rows={2}
          placeholder="Anything you want to remember about this session"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="row-between mb-4">
          <div className="eyebrow">Exercises ({picks.length})</div>
          <button className="btn btn-quiet btn-sm" onClick={() => setPickerOpen(true)}>
            <Plus size={14} /> Add exercise
          </button>
        </div>

        {picks.length === 0 ? (
          <div className="muted" style={{ padding: '32px 8px', textAlign: 'center', fontSize: 14 }}>
            No exercises yet. Tap <b>Add exercise</b> to browse the library.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {picks.map((p, i) => {
              const ex = exerciseById(p.exerciseId);
              if (!ex) return null;
              return (
                <div key={p.exerciseId} className="row gap-3" style={{
                  padding: 10, borderRadius: 12, background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}>
                  <span className="mono muted" style={{ width: 18, textAlign: 'center' }}>{i + 1}</span>
                  <div style={{ width: 64, flexShrink: 0 }}>
                    <ExerciseTile exercise={ex} size="sm" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{ex.name}</div>
                    <div className="muted" style={{ fontSize: 11, textTransform: 'capitalize', marginTop: 2 }}>
                      {ex.muscle} · {ex.equipment}
                    </div>
                  </div>
                  <div className="row gap-2">
                    <button
                      className="icon-btn"
                      onClick={() => updateSets(p.exerciseId, Math.max(1, p.sets - 1))}
                      style={{ width: 32, height: 32 }}
                    >−</button>
                    <span className="mono" style={{ minWidth: 38, textAlign: 'center', fontWeight: 600 }}>
                      {p.sets} sets
                    </span>
                    <button
                      className="icon-btn"
                      onClick={() => updateSets(p.exerciseId, Math.min(10, p.sets + 1))}
                      style={{ width: 32, height: 32 }}
                    >+</button>
                  </div>
                  <button onClick={() => removeExercise(p.exerciseId)} className="icon-btn" style={{ width: 32, height: 32 }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pickerOpen && (
        <ExercisePicker
          existing={picks.map((p) => p.exerciseId)}
          onClose={() => setPickerOpen(false)}
          onPick={(id) => { addExercise(id); setPickerOpen(false); }}
        />
      )}
    </div>
  );
}

function ExercisePicker({ existing, onClose, onPick }) {
  const [muscle, setMuscle] = useState('all');
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return EXERCISES.filter((e) =>
      (muscle === 'all' || e.muscle === muscle) &&
      (!ql || e.name.toLowerCase().includes(ql))
    );
  }, [muscle, q]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 100, padding: 0,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="slide-up" style={{
        width: '100%', maxWidth: 720,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-strong)',
        borderTopLeftRadius: 18, borderTopRightRadius: 18,
        padding: 16, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
      }}>
        <div className="row-between mb-2">
          <div>
            <div className="eyebrow">Library</div>
            <div className="h3" style={{ marginTop: 2 }}>Pick an exercise</div>
          </div>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>

        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-mute)',
          }} />
          <input
            className="input"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 38 }}
            autoFocus
          />
        </div>

        <div className="row" style={{ gap: 6, marginBottom: 12, overflowX: 'auto', flexWrap: 'wrap' }}>
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
                padding: '5px 10px', fontSize: 11,
              }}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div style={{
          flex: 1, overflow: 'auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8,
        }}>
          {filtered.map((ex) => (
            <ExerciseTile
              key={ex.id}
              exercise={ex}
              size="sm"
              onClick={() => onPick(ex.id)}
              selected={existing.includes(ex.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
