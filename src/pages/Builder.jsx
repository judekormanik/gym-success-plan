import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ChevronLeft, Plus, X, Search, Save, ArrowUp, ArrowDown,
  Trash2, ChevronDown, ChevronRight, Copy, Sparkles, Clock, ListPlus,
  Star, SlidersHorizontal,
} from 'lucide-react';
import useStore from '../store/useStore.js';
import { MUSCLE_GROUPS, EQUIPMENT_FILTERS, exerciseById } from '../utils/exerciseLibrary.js';
import useExerciseLibrary from '../hooks/useExerciseLibrary.js';
import { TEMPLATES } from '../utils/workoutTemplates.js';
import ExerciseTile from '../components/ExerciseTile.jsx';

const newInstanceId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'ex-' + Math.random().toString(36).slice(2);

// Each row in the builder gets a stable instanceId so we can have duplicates
// of the same exercise (e.g. squats twice with different rep targets).
function rowFromExercise(exerciseId, overrides = {}) {
  const ex = exerciseById(exerciseId);
  return {
    instanceId: newInstanceId(),
    exerciseId,
    sets: overrides.sets ?? ex?.defaultSets ?? 3,
    repsTarget: overrides.repsTarget ?? '',
    restSeconds: overrides.restSeconds ?? 60,
    notes: overrides.notes ?? '',
    expanded: false,
  };
}

// Convert builder rows -> the shape the API expects (drops instanceId/expanded).
function rowsToPayload(rows) {
  return rows.map((r) => {
    const out = { exerciseId: r.exerciseId, sets: r.sets };
    if (r.repsTarget) out.repsTarget = r.repsTarget;
    if (r.restSeconds != null && r.restSeconds !== '') out.restSeconds = Number(r.restSeconds) || 0;
    if (r.notes) out.notes = r.notes;
    return out;
  });
}

export default function Builder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: editingId } = useParams();
  const customWorkouts = useStore((s) => s.customWorkouts);
  const saveCustomWorkout = useStore((s) => s.saveCustomWorkout);
  const updateCustomWorkout = useStore((s) => s.updateCustomWorkout);
  const pushToast = useStore((s) => s.pushToast);

  const isEdit = !!editingId;
  const existing = useMemo(
    () => (editingId ? customWorkouts.find((cw) => cw.id === editingId) : null),
    [editingId, customWorkouts]
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rows, setRows] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Initial load: edit mode | template-from-state | from-library state | empty
  useEffect(() => {
    if (isEdit && existing) {
      setName(existing.name || '');
      setDescription(existing.description || '');
      setRows((existing.exercises || []).map((e) => ({
        instanceId: newInstanceId(),
        exerciseId: e.exerciseId,
        sets: e.sets || 3,
        repsTarget: e.repsTarget || '',
        restSeconds: e.restSeconds ?? 60,
        notes: e.notes || '',
        expanded: false,
      })));
      setDirty(false);
      return;
    }
    // Template path: navigate to /workout/build with state.template = 'ppl-push'
    const tplId = location.state?.template;
    const tpl = tplId ? TEMPLATES.find((t) => t.id === tplId) : null;
    if (tpl) {
      setName(tpl.name);
      setDescription(tpl.description || '');
      setRows(tpl.exercises.map((e) => rowFromExercise(e.exerciseId, e)));
      setDirty(true);
      // Clear state so a refresh doesn't re-apply the template
      window.history.replaceState({}, '');
      return;
    }
    // Single-exercise jump from library
    const addId = location.state?.addExerciseId;
    if (addId && exerciseById(addId)) {
      setRows([rowFromExercise(addId)]);
      setDirty(true);
      window.history.replaceState({}, '');
    }
  }, [isEdit, existing, location.state]);

  // Beforeunload guard for unsaved work
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const markDirty = () => { if (!dirty) setDirty(true); };

  // ── Row mutators ──
  const addRow = (exerciseId) => {
    setRows((rs) => [...rs, rowFromExercise(exerciseId)]);
    markDirty();
  };
  const removeRow = (instanceId) => {
    setRows((rs) => rs.filter((r) => r.instanceId !== instanceId));
    markDirty();
  };
  const moveRow = (instanceId, dir) => {
    setRows((rs) => {
      const i = rs.findIndex((r) => r.instanceId === instanceId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= rs.length) return rs;
      const next = rs.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    markDirty();
  };
  const duplicateRow = (instanceId) => {
    setRows((rs) => {
      const idx = rs.findIndex((r) => r.instanceId === instanceId);
      if (idx < 0) return rs;
      const orig = rs[idx];
      const copy = { ...orig, instanceId: newInstanceId(), expanded: false };
      return [...rs.slice(0, idx + 1), copy, ...rs.slice(idx + 1)];
    });
    markDirty();
  };
  const patchRow = (instanceId, patch) => {
    setRows((rs) => rs.map((r) => r.instanceId === instanceId ? { ...r, ...patch } : r));
    markDirty();
  };

  // ── Counts for picker badges ──
  const countsByExerciseId = useMemo(() => {
    const m = {};
    rows.forEach((r) => { m[r.exerciseId] = (m[r.exerciseId] || 0) + 1; });
    return m;
  }, [rows]);

  // ── Estimated duration ──
  const estimatedMinutes = useMemo(() => {
    const setSeconds = rows.reduce((acc, r) => {
      const restPerSet = Number(r.restSeconds) || 60;
      const workPerSet = 35; // approximate working time per set
      return acc + r.sets * (workPerSet + restPerSet);
    }, 0);
    return Math.max(0, Math.round(setSeconds / 60));
  }, [rows]);

  const totalSets = rows.reduce((a, r) => a + r.sets, 0);

  // ── Submit ──
  const submit = async () => {
    if (!name.trim()) { pushToast('Give your workout a name', 'error'); return; }
    if (rows.length === 0) { pushToast('Add at least one exercise', 'error'); return; }
    setBusy(true);
    try {
      const payload = rowsToPayload(rows);
      if (isEdit) {
        await updateCustomWorkout(editingId, { name: name.trim(), description: description.trim(), exercises: payload });
        pushToast('Workout updated', 'success');
      } else {
        await saveCustomWorkout({ name: name.trim(), description: description.trim(), exercises: payload });
        pushToast('Workout saved', 'success');
      }
      setDirty(false);
      navigate('/workout');
    } catch (e) {
      pushToast(e.message || 'Save failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    if (dirty && !confirm('Discard unsaved changes?')) return;
    navigate(-1);
  };

  return (
    <div className="fade-in">
      <div className="row-between mb-4" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack}>
          <ChevronLeft size={14} /> Back
        </button>
        <div className="row gap-2">
          <button
            type="button"
            disabled={busy}
            className="btn btn-gold btn-sm"
            onClick={submit}
            title={isEdit ? 'Save changes' : 'Save workout'}
          >
            <Save size={14} /> {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Save'}
          </button>
        </div>
      </div>

      <div className="eyebrow">{isEdit ? 'Editing' : 'Builder'}</div>
      <h1 className="h2" style={{ marginTop: 4, marginBottom: 4 }}>
        {isEdit ? (existing?.name || 'Edit workout') : 'Build your own workout'}
      </h1>
      <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
        {rows.length === 0
          ? 'Start from a template, jump into the library, or build from scratch.'
          : `${rows.length} exercise${rows.length === 1 ? '' : 's'} · ${totalSets} sets · ~${estimatedMinutes} min`}
      </div>

      {/* Templates row — only show in create mode and when blank */}
      {!isEdit && rows.length === 0 && (
        <div className="card mb-4" style={{ padding: 16 }}>
          <div className="row gap-2 mb-4">
            <Sparkles size={14} style={{ color: 'var(--gold)' }} />
            <div className="eyebrow">Start from a template</div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 8,
          }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setName(t.name);
                  setDescription(t.description || '');
                  setRows(t.exercises.map((e) => rowFromExercise(e.exerciseId, e)));
                  setDirty(true);
                }}
                className="card hover"
                style={{ padding: 12, textAlign: 'left', cursor: 'pointer', background: 'var(--surface-2)' }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{t.description}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>{t.exercises.length} exercises</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workout meta */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <label className="label">Workout name</label>
        <input
          className="input"
          placeholder="e.g. Push Day, Heavy Legs, Sunday Burn"
          value={name}
          onChange={(e) => { setName(e.target.value); markDirty(); }}
          maxLength={80}
        />
        <label className="label" style={{ marginTop: 12 }}>Notes (optional)</label>
        <textarea
          className="textarea"
          rows={2}
          placeholder="Anything you want to remember about this session"
          value={description}
          onChange={(e) => { setDescription(e.target.value); markDirty(); }}
          maxLength={500}
        />
      </div>

      {/* Exercises */}
      <div className="card" style={{ padding: 16 }}>
        <div className="row-between mb-4">
          <div className="eyebrow">Exercises ({rows.length})</div>
          <button className="btn btn-quiet btn-sm" onClick={() => setPickerOpen(true)}>
            <ListPlus size={14} /> Add exercise
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="muted" style={{ padding: '32px 8px', textAlign: 'center', fontSize: 14 }}>
            No exercises yet. Tap <b>Add exercise</b> to browse the library.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((row, i) => (
              <ExerciseRow
                key={row.instanceId}
                row={row}
                index={i}
                isFirst={i === 0}
                isLast={i === rows.length - 1}
                onChange={(patch) => patchRow(row.instanceId, patch)}
                onRemove={() => removeRow(row.instanceId)}
                onMove={(dir) => moveRow(row.instanceId, dir)}
                onDuplicate={() => duplicateRow(row.instanceId)}
              />
            ))}
            <button
              onClick={() => setPickerOpen(true)}
              className="btn btn-ghost"
              style={{ marginTop: 4 }}
            >
              <Plus size={14} /> Add another exercise
            </button>
          </div>
        )}
      </div>

      {pickerOpen && (
        <ExercisePicker
          counts={countsByExerciseId}
          onClose={() => setPickerOpen(false)}
          onPick={(id) => { addRow(id); /* keep modal open for batch picking */ }}
        />
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Single exercise row (with collapse/expand for advanced options)
// ───────────────────────────────────────────────────────────
function ExerciseRow({ row, index, isFirst, isLast, onChange, onRemove, onMove, onDuplicate }) {
  const ex = exerciseById(row.exerciseId);
  if (!ex) return null;
  const expanded = !!row.expanded;

  return (
    <div style={{
      borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)',
    }}>
      <div className="row gap-3" style={{ padding: 10, alignItems: 'center' }}>
        <span className="mono muted" style={{ width: 18, textAlign: 'center', flexShrink: 0 }}>{index + 1}</span>
        <div style={{ width: 56, flexShrink: 0 }}>
          <ExerciseTile exercise={ex} size="sm" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ex.name}
          </div>
          <div className="muted" style={{ fontSize: 11, textTransform: 'capitalize', marginTop: 2 }}>
            {ex.muscle} · {ex.equipment}
            {row.repsTarget && ` · ${row.repsTarget}`}
            {row.restSeconds != null && row.restSeconds !== '' && Number(row.restSeconds) > 0 && ` · rest ${row.restSeconds}s`}
          </div>
        </div>
        <div className="row gap-1" style={{ alignItems: 'center', flexShrink: 0 }}>
          <button
            className="icon-btn" style={{ width: 30, height: 30 }}
            onClick={() => onChange({ sets: Math.max(1, row.sets - 1) })}
            aria-label="Decrement sets"
          >−</button>
          <span className="mono" style={{ minWidth: 36, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
            {row.sets} sets
          </span>
          <button
            className="icon-btn" style={{ width: 30, height: 30 }}
            onClick={() => onChange({ sets: Math.min(20, row.sets + 1) })}
            aria-label="Increment sets"
          >+</button>
        </div>
      </div>

      <div className="row gap-1" style={{ padding: '4px 10px 8px', justifyContent: 'flex-end' }}>
        <button
          className="icon-btn" style={{ width: 30, height: 30 }}
          onClick={() => onMove(-1)} disabled={isFirst}
          aria-label="Move up"
        ><ArrowUp size={14} /></button>
        <button
          className="icon-btn" style={{ width: 30, height: 30 }}
          onClick={() => onMove(1)} disabled={isLast}
          aria-label="Move down"
        ><ArrowDown size={14} /></button>
        <button
          className="icon-btn" style={{ width: 30, height: 30 }}
          onClick={onDuplicate}
          aria-label="Duplicate"
        ><Copy size={14} /></button>
        <button
          className="icon-btn" style={{ width: 30, height: 30 }}
          onClick={() => onChange({ expanded: !expanded })}
          aria-label="Toggle details"
        >{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>
        <button
          className="icon-btn" style={{ width: 30, height: 30, color: 'var(--danger)' }}
          onClick={onRemove}
          aria-label="Remove"
        ><Trash2 size={14} /></button>
      </div>

      {expanded && (
        <div style={{
          padding: '12px 12px 14px', borderTop: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          <div>
            <label className="label">Target reps</label>
            <input
              className="input"
              placeholder="e.g. 8-10"
              value={row.repsTarget}
              onChange={(e) => onChange({ repsTarget: e.target.value })}
              maxLength={24}
            />
          </div>
          <div>
            <label className="label">Rest (sec)</label>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min={0} max={900}
              value={row.restSeconds}
              onChange={(e) => onChange({ restSeconds: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Notes / cues</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Tempo, form notes, anything you want to remember"
              value={row.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              maxLength={500}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Exercise picker — supports duplicates, shows count badge, stays open
// ───────────────────────────────────────────────────────────
function ExercisePicker({ counts, onClose, onPick }) {
  const { exercises, ready } = useExerciseLibrary();
  const favorites = useStore((s) => s.favoriteIds);
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const [muscle, setMuscle] = useState('all');
  const [equipment, setEquipment] = useState('all');
  const [q, setQ] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [flash, setFlash] = useState(null);
  const flashTimer = useRef();

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let out = exercises.filter((e) => {
      if (muscle !== 'all' && e.muscle !== muscle) return false;
      if (equipment !== 'all' && e.equipment !== equipment) return false;
      if (favOnly && !favSet.has(e.id)) return false;
      if (ql && !e.name.toLowerCase().includes(ql)) return false;
      return true;
    });
    // Curated first when no filters active
    if (muscle === 'all' && equipment === 'all' && !favOnly && !ql) {
      out = [...out].sort((a, b) => {
        if (a.curated && !b.curated) return -1;
        if (!a.curated && b.curated) return 1;
        return a.name.localeCompare(b.name);
      });
    }
    return out;
  }, [exercises, muscle, equipment, favOnly, favSet, q]);

  const pick = (id) => {
    onPick(id);
    setFlash(id);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 700);
  };

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
            <div className="h3" style={{ marginTop: 2 }}>Pick exercises</div>
          </div>
          <button onClick={onClose} className="btn btn-quiet btn-sm">Done</button>
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

        <div className="row" style={{ gap: 6, marginBottom: 8, overflowX: 'auto', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFavOnly((v) => !v)}
            className="pill"
            title="Show only favorites"
            style={{
              cursor: 'pointer',
              background: favOnly ? 'var(--gold)' : 'var(--surface-2)',
              color: favOnly ? '#0a0a0a' : 'var(--text-dim)',
              borderColor: favOnly ? 'var(--gold)' : 'var(--border)',
              fontWeight: favOnly ? 600 : 500,
              padding: '5px 10px', fontSize: 11,
            }}
          ><Star size={11} fill={favOnly ? '#0a0a0a' : 'transparent'} /></button>
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
            >{g.label}</button>
          ))}
        </div>
        <div className="row" style={{ gap: 6, marginBottom: 12, overflowX: 'auto', flexWrap: 'wrap' }}>
          {EQUIPMENT_FILTERS.map((g) => (
            <button
              key={g.id}
              onClick={() => setEquipment(g.id)}
              className="pill"
              style={{
                cursor: 'pointer',
                background: equipment === g.id ? 'var(--gold)' : 'var(--surface-2)',
                color: equipment === g.id ? '#0a0a0a' : 'var(--text-dim)',
                borderColor: equipment === g.id ? 'var(--gold)' : 'var(--border)',
                fontWeight: equipment === g.id ? 600 : 500,
                padding: '5px 10px', fontSize: 11,
              }}
            >{g.label}</button>
          ))}
        </div>

        <div style={{
          flex: 1, overflow: 'auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8,
        }}>
          {filtered.map((ex) => {
            const c = counts[ex.id] || 0;
            const isFlashing = flash === ex.id;
            return (
              <div key={ex.id} style={{ position: 'relative' }}>
                <ExerciseTile exercise={ex} size="sm" onClick={() => pick(ex.id)} favorited={favSet.has(ex.id)} />
                {(c > 0 || isFlashing) && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 8,
                    minWidth: 22, height: 22, padding: '0 6px',
                    borderRadius: 999,
                    background: 'var(--gold)', color: '#0a0a0a',
                    fontWeight: 700, fontSize: 11,
                    display: 'grid', placeItems: 'center',
                    boxShadow: '0 4px 12px rgba(212,175,55,0.4)',
                    transition: 'transform 200ms',
                    transform: isFlashing ? 'scale(1.25)' : 'scale(1)',
                  }}>{isFlashing ? '+' : c}</div>
                )}
              </div>
            );
          })}
          {!ready && filtered.length === 0 && (
            <div className="muted" style={{ padding: 24, textAlign: 'center', gridColumn: '1 / -1', fontSize: 13 }}>
              Loading library…
            </div>
          )}
          {ready && !filtered.length && (
            <div className="muted" style={{ padding: 24, textAlign: 'center', gridColumn: '1 / -1', fontSize: 13 }}>
              No matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
