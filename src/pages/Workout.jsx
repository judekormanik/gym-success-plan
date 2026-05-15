import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronLeft, Check, Plus, BookOpen, Trash2, Pencil, Calculator, Shuffle, X } from 'lucide-react';
import useWorkout from '../hooks/useWorkout.js';
import useStore from '../store/useStore.js';
import WorkoutCard from '../components/WorkoutCard.jsx';
import ExerciseRow from '../components/ExerciseRow.jsx';
import ExerciseTile from '../components/ExerciseTile.jsx';
import RestTimer from '../components/RestTimer.jsx';
import PlateCalculator from '../components/PlateCalculator.jsx';
import { PLAN } from '../utils/constants.js';
import { exerciseById } from '../utils/exerciseLibrary.js';
import useExerciseLibrary from '../hooks/useExerciseLibrary.js';
import { isPersonalRecord } from '../utils/calculations.js';
import { suggestNext } from '../utils/progression.js';
import PRCelebration from '../components/PRCelebration.jsx';
import ProgressionHint from '../components/ProgressionHint.jsx';

export default function WorkoutPage() {
  const navigate = useNavigate();
  const { todayPlan, lastSession, saveWorkout } = useWorkout();
  const sets = useStore((s) => s.sets);
  const customWorkouts = useStore((s) => s.customWorkouts);
  const deleteCustomWorkout = useStore((s) => s.deleteCustomWorkout);
  const logPR = useStore((s) => s.logPR);
  const pushToast = useStore((s) => s.pushToast);

  const profile = useStore((s) => s.profile);
  const { exercises: fullLibrary } = useExerciseLibrary();

  const [tab, setTab] = useState('plan'); // plan | mine
  const [activeDay, setActiveDay] = useState(todayPlan.day);
  const [activeCustomId, setActiveCustomId] = useState(null);
  const [session, setSession] = useState(false);
  const [start, setStart] = useState(null);
  const [collected, setCollected] = useState([]);
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [restKey, setRestKey] = useState(0);   // increments on every set complete
  const [restSeconds, setRestSeconds] = useState(60);
  const [plateOpen, setPlateOpen] = useState(false);
  // Per-displayKey override: e.g. swap "Barbell bench press" -> "Dumbbell bench press"
  // Only lives for this session — doesn't mutate the saved workout.
  const [swapsByKey, setSwapsByKey] = useState({});
  const [swapOpenKey, setSwapOpenKey] = useState(null);

  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [session, start]);

  // Build the active session payload — either a default day or a custom workout
  const activeSession = useMemo(() => {
    if (tab === 'mine' && activeCustomId) {
      const cw = customWorkouts.find((w) => w.id === activeCustomId);
      if (!cw) return null;
      const exercises = (cw.exercises || []).map((row, i) => {
        const ex = exerciseById(row.exerciseId);
        return ex ? {
          // Use a stable per-instance name so duplicate exercises don't merge
          // when ExerciseRow keys / set look-ups happen.
          name: ex.name,
          displayKey: `${row.exerciseId}-${i}`,
          sets: row.sets,
          exercise: ex,
          repsTarget: row.repsTarget || '',
          restSeconds: row.restSeconds,
          notes: row.notes || '',
        } : null;
      }).filter(Boolean);
      return { day: 0, name: cw.name, kind: 'custom', exercises, customId: cw.id };
    }
    const p = PLAN.find((p) => p.day === activeDay) || todayPlan;
    // Resolve each Foundation Plan exercise by name so we can show photo tiles +
    // detail in the active session, matching the custom-workout experience.
    const nameMatch = (name, e) => {
      const a = name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
      const b = e.name.toLowerCase();
      return a === b || b.startsWith(a) || a.includes(b) || b.includes(a.split(' ')[0]);
    };
    return {
      day: p.day, name: p.name, kind: 'default',
      exercises: p.exercises.map((e, i) => ({
        ...e,
        displayKey: `${e.name}-${i}`,
        exercise: fullLibrary.find((lib) => nameMatch(e.name, lib)) || null,
      })),
    };
  }, [tab, activeCustomId, activeDay, customWorkouts, todayPlan, fullLibrary]);

  const begin = () => {
    if (!activeSession || !activeSession.exercises.length) {
      pushToast('Pick a workout first', 'error');
      return;
    }
    setSession(true); setStart(Date.now()); setCollected([]); setElapsed(0);
  };

  // Apply per-session swap overrides over the active session's exercise list
  const effectiveExercises = useMemo(() => {
    if (!activeSession) return [];
    return activeSession.exercises.map((ex) => {
      const swapId = swapsByKey[ex.displayKey];
      if (!swapId) return ex;
      const swap = exerciseById(swapId) || fullLibrary.find((e) => e.id === swapId);
      if (!swap) return ex;
      return { ...ex, name: swap.name, exercise: swap };
    });
  }, [activeSession, swapsByKey, fullLibrary]);

  // Session progress: an exercise is "complete" when its expected set count is logged
  const exerciseProgress = useMemo(() => {
    const out = {};
    effectiveExercises.forEach((ex) => {
      const done = collected.filter((c) => c.exercise === ex.name).length;
      out[ex.displayKey] = { done, total: ex.sets, complete: done >= ex.sets };
    });
    return out;
  }, [effectiveExercises, collected]);

  const completedCount = effectiveExercises.filter((ex) => exerciseProgress[ex.displayKey]?.complete).length;
  const totalCount = effectiveExercises.length;
  const upNextIdx = effectiveExercises.findIndex((ex) => !exerciseProgress[ex.displayKey]?.complete);
  const upNext = upNextIdx >= 0 ? effectiveExercises[upNextIdx] : null;

  // Swap-target finder: same muscle group, different equipment ranked first,
  // then any same-muscle alternative.
  const findAlternates = (ex) => {
    if (!ex?.exercise) return [];
    const base = ex.exercise;
    const same = fullLibrary.filter((e) => e.id !== base.id && e.muscle === base.muscle);
    const diffEquip = same.filter((e) => e.equipment !== base.equipment);
    return [...diffEquip, ...same.filter((e) => !diffEquip.includes(e))].slice(0, 12);
  };

  const onCompleteSet = (data) => {
    const prev = sets.filter((s) => s.exercise_name === data.exercise);
    const isPR = isPersonalRecord(prev, Number(data.weight), Number(data.reps));
    const row = { ...data, isPR };
    setCollected((c) => [...c, row]);
    pushToast(isPR ? `New PR · ${data.exercise}` : 'Set saved', isPR ? 'success' : 'default');
    if (isPR) logPR({ exercise_name: data.exercise, weight: Number(data.weight), reps: Number(data.reps) });

    // Auto-start rest timer. Use the per-exercise rest if set, else default.
    const ex = effectiveExercises.find((e) => e.name === data.exercise);
    if (ex && ex.restSeconds != null && Number(ex.restSeconds) > 0) {
      setRestSeconds(Number(ex.restSeconds));
    }
    setRestKey((k) => k + 1);
  };

  const finish = async () => {
    if (!collected.length) { pushToast('Log at least one set first', 'error'); return; }
    await saveWorkout({
      dayNumber: activeSession.kind === 'custom' ? 0 : activeSession.day,
      dayName: activeSession.name,
      durationMinutes: Math.max(1, Math.round(elapsed / 60)),
      notes,
      sets: collected,
    });
    pushToast(`${activeSession.name} saved`, 'success');
    setSession(false); setCollected([]); setNotes(''); setElapsed(0); setStart(null);
    setSwapsByKey({});
  };

  // ─── Active session view ───
  if (session && activeSession) {
    return (
      <div className="fade-in">
        <PRCelebration />
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <button onClick={() => setSession(false)} className="btn btn-ghost btn-sm">
                <ChevronLeft size={14} /> Cancel
              </button>
              <div className="row gap-2">
                <button onClick={() => setPlateOpen(true)} className="btn btn-quiet btn-sm" title="Plate calculator">
                  <Calculator size={14} /> Plates
                </button>
                <div className="row gap-2" style={{ background: 'var(--surface)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <Timer size={14} style={{ color: 'var(--gold)' }} />
                  <span className="mono" style={{ fontWeight: 600 }}>{formatTime(elapsed)}</span>
                </div>
              </div>
            </div>

            <div className="eyebrow" style={{ marginBottom: 4 }}>
              {activeSession.kind === 'custom' ? 'Custom workout' : `Day ${activeSession.day}`}
            </div>
            <h2 className="h2" style={{ marginBottom: 12 }}>{activeSession.name}</h2>

            {/* Progress strip + Up next */}
            <div className="card" style={{ padding: 14, marginBottom: 14 }}>
              <div className="row-between mb-2">
                <div className="eyebrow">
                  Progress · {completedCount} of {totalCount}
                </div>
                {upNext ? (
                  <div className="muted" style={{ fontSize: 12 }}>
                    Up next: <b style={{ color: 'var(--gold)' }}>{upNext.name}</b>
                  </div>
                ) : (
                  <div className="muted" style={{ fontSize: 12, color: 'var(--success)' }}>
                    All exercises complete · finish below
                  </div>
                )}
              </div>
              <div style={{ height: 6, borderRadius: 999, background: '#0e0e0e', overflow: 'hidden' }}>
                <div style={{
                  width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--gold), var(--gold-soft))',
                  transition: 'width 400ms cubic-bezier(.2,.8,.2,1)',
                }} />
              </div>
              <div className="row" style={{ gap: 3, marginTop: 8, flexWrap: 'wrap' }}>
                {effectiveExercises.map((ex) => {
                  const p = exerciseProgress[ex.displayKey] || { done: 0, total: ex.sets };
                  const pct = p.total > 0 ? p.done / p.total : 0;
                  const isUpNext = ex.displayKey === upNext?.displayKey;
                  return (
                    <div key={ex.displayKey} style={{
                      flex: '1 1 auto',
                      minWidth: 18, height: 4, borderRadius: 2,
                      background: pct >= 1
                        ? 'var(--gold)'
                        : pct > 0
                          ? 'linear-gradient(90deg, var(--gold) ' + (pct * 100) + '%, rgba(255,255,255,0.08) ' + (pct * 100) + '%)'
                          : isUpNext ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)',
                    }} />
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {effectiveExercises.map((ex, i) => {
                const p = exerciseProgress[ex.displayKey] || { done: 0, total: ex.sets };
                const isUpNext = ex.displayKey === upNext?.displayKey;
                return (
                  <div key={ex.displayKey || ex.name} style={{
                    opacity: p.complete ? 0.65 : 1,
                    border: isUpNext ? '1px solid rgba(212,175,55,0.35)' : 'none',
                    borderRadius: isUpNext ? 16 : 0,
                    padding: isUpNext ? 8 : 0,
                    background: isUpNext ? 'linear-gradient(180deg, rgba(212,175,55,0.04), transparent)' : 'none',
                    transition: 'opacity 200ms, background 200ms',
                  }}>
                    {ex.exercise && (
                      <div className="row-between" style={{ marginBottom: 8, gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <ExerciseTile exercise={ex.exercise} size="sm" />
                        </div>
                        <button
                          onClick={() => setSwapOpenKey(ex.displayKey)}
                          className="btn btn-quiet btn-sm"
                          style={{ flexShrink: 0 }}
                          title="Swap exercise"
                        >
                          <Shuffle size={12} /> Swap
                        </button>
                      </div>
                    )}
                    {(ex.repsTarget || (ex.restSeconds != null && ex.restSeconds > 0) || ex.notes) && (
                      <div className="muted" style={{
                        fontSize: 12, padding: '6px 12px',
                        background: 'var(--surface-2)', borderRadius: 8, marginBottom: 8,
                        display: 'flex', flexWrap: 'wrap', gap: 12,
                      }}>
                        {ex.repsTarget && <span><b style={{ color: 'var(--gold)' }}>Target:</b> {ex.repsTarget} reps</span>}
                        {ex.restSeconds != null && ex.restSeconds > 0 &&
                          <span><b style={{ color: 'var(--gold)' }}>Rest:</b> {ex.restSeconds}s</span>}
                        {ex.notes && <span style={{ flexBasis: '100%' }}><b style={{ color: 'var(--gold)' }}>Notes:</b> {ex.notes}</span>}
                      </div>
                    )}
                    <ProgressionHint
                      suggestion={suggestNext({
                        history: sets.filter((s) => s.exercise_name === ex.name),
                        repsTarget: ex.repsTarget,
                        units: profile?.units || 'metric',
                        exerciseName: ex.name,
                      })}
                      units={profile?.units || 'metric'}
                      compound={ex.exercise?.mechanic === 'compound'}
                    />
                    <ExerciseRow
                      exercise={{ name: ex.name, sets: ex.sets, optional: ex.optional }}
                      previous={lastSession(ex.name)}
                      onCompleteSet={onCompleteSet}
                    />
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ padding: 16, marginTop: 16 }}>
              <label className="label">Session notes</label>
              <textarea className="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" />
            </div>

            <button onClick={finish} className="btn btn-gold btn-lg btn-block" style={{ marginTop: 18 }}>
              <Check size={16} /> Finish session ({collected.length} set{collected.length === 1 ? '' : 's'})
            </button>

            <RestTimer
              defaultSeconds={restSeconds}
              triggerKey={restKey}
              onComplete={() => pushToast('Rest done — next set!', 'success')}
            />
          </motion.div>
        </AnimatePresence>

        <PlateCalculator
          open={plateOpen}
          onClose={() => setPlateOpen(false)}
          units={profile?.units || 'metric'}
        />

        {swapOpenKey && (() => {
          const target = effectiveExercises.find((ex) => ex.displayKey === swapOpenKey);
          if (!target) return null;
          const alternates = findAlternates(target);
          return (
            <div onClick={() => setSwapOpenKey(null)} style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              zIndex: 200, padding: 0,
            }}>
              <div onClick={(e) => e.stopPropagation()} className="slide-up" style={{
                width: '100%', maxWidth: 540,
                background: 'var(--surface)',
                borderTopLeftRadius: 18, borderTopRightRadius: 18,
                padding: 16, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
              }}>
                <div className="row-between mb-4">
                  <div>
                    <div className="eyebrow">Swap exercise</div>
                    <div className="h3" style={{ marginTop: 2 }}>{target.name}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      Pick a similar exercise (this session only — your workout stays unchanged).
                    </div>
                  </div>
                  <button onClick={() => setSwapOpenKey(null)} className="icon-btn" aria-label="Close"><X size={16} /></button>
                </div>

                {/* Revert swap if one is in place */}
                {swapsByKey[swapOpenKey] && (
                  <button
                    onClick={() => {
                      setSwapsByKey(({ [swapOpenKey]: _, ...rest }) => rest);
                      setSwapOpenKey(null);
                    }}
                    className="btn btn-ghost btn-sm mb-4"
                  >
                    Revert to original
                  </button>
                )}

                <div style={{
                  overflow: 'auto', flex: 1,
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8,
                }}>
                  {alternates.map((alt) => (
                    <ExerciseTile
                      key={alt.id}
                      exercise={alt}
                      size="sm"
                      onClick={() => {
                        setSwapsByKey((m) => ({ ...m, [swapOpenKey]: alt.id }));
                        setSwapOpenKey(null);
                        pushToast(`Swapped to ${alt.name}`, 'success');
                      }}
                    />
                  ))}
                  {alternates.length === 0 && (
                    <div className="muted" style={{ padding: 20, textAlign: 'center', gridColumn: '1 / -1' }}>
                      No alternates found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ─── Picker view ───
  return (
    <div className="fade-in">
      <PRCelebration />
      <div className="row-between mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow">Workout</div>
          <h1 className="h2" style={{ marginTop: 4 }}>Pick your day</h1>
        </div>
        <div className="row gap-2">
          <Link to="/workout/library" className="btn btn-ghost btn-sm">
            <BookOpen size={14} /> Library
          </Link>
          <Link to="/workout/build" className="btn btn-gold btn-sm">
            <Plus size={14} /> Build
          </Link>
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setTab('plan')}
          className="pill"
          style={{
            cursor: 'pointer',
            background: tab === 'plan' ? 'var(--gold)' : 'var(--surface-2)',
            color: tab === 'plan' ? '#0a0a0a' : 'var(--text-dim)',
            borderColor: tab === 'plan' ? 'var(--gold)' : 'var(--border)',
            fontWeight: 600, padding: '6px 14px',
          }}
        >Foundation Plan</button>
        <button
          onClick={() => setTab('mine')}
          className="pill"
          style={{
            cursor: 'pointer',
            background: tab === 'mine' ? 'var(--gold)' : 'var(--surface-2)',
            color: tab === 'mine' ? '#0a0a0a' : 'var(--text-dim)',
            borderColor: tab === 'mine' ? 'var(--gold)' : 'var(--border)',
            fontWeight: 600, padding: '6px 14px',
          }}
        >My Workouts ({customWorkouts.length})</button>
      </div>

      {tab === 'plan' ? (
        <>
          <div className="card-row cols-2 mb-6">
            {PLAN.map((p) => (
              <WorkoutCard
                key={p.day}
                day={p}
                active={p.day === activeDay}
                onClick={() => { setActiveDay(p.day); setActiveCustomId(null); }}
              />
            ))}
          </div>
          <button className="btn btn-gold btn-lg btn-block" onClick={begin}>
            Start Day {activeDay} — {PLAN.find((p) => p.day === activeDay)?.name}
          </button>
        </>
      ) : (
        <>
          {customWorkouts.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div className="h3" style={{ marginBottom: 8 }}>No custom workouts yet</div>
              <div className="muted" style={{ marginBottom: 18, fontSize: 14 }}>
                Build your own from 60+ exercises in the library.
              </div>
              <Link to="/workout/build" className="btn btn-gold">
                <Plus size={14} /> Build your first
              </Link>
            </div>
          ) : (
            <>
              <div className="card-row cols-2 mb-6">
                {customWorkouts.map((cw) => (
                  <CustomCard
                    key={cw.id}
                    workout={cw}
                    active={activeCustomId === cw.id}
                    onPick={() => setActiveCustomId(cw.id)}
                    onEdit={() => navigate(`/workout/build/${cw.id}`)}
                    onDelete={() => {
                      if (confirm(`Delete "${cw.name}"?`)) deleteCustomWorkout(cw.id);
                    }}
                  />
                ))}
              </div>
              {activeCustomId && (
                <button className="btn btn-gold btn-lg btn-block" onClick={begin}>
                  Start {customWorkouts.find((c) => c.id === activeCustomId)?.name}
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function CustomCard({ workout, active, onPick, onEdit, onDelete }) {
  const exs = (workout.exercises || []).slice(0, 3).map((row, i) => ({
    ex: exerciseById(row.exerciseId),
    key: `${row.exerciseId}-${i}`,
  })).filter((x) => x.ex);
  const totalSets = (workout.exercises || []).reduce((a, e) => a + (Number(e.sets) || 0), 0);
  return (
    <div
      className="card hover"
      onClick={onPick}
      style={{
        cursor: 'pointer',
        borderColor: active ? 'rgba(212,175,55,0.5)' : 'var(--border)',
        background: active ? 'linear-gradient(180deg, rgba(212,175,55,0.06), transparent), var(--surface)' : 'var(--surface)',
        padding: 16,
      }}
    >
      <div className="row-between" style={{ marginBottom: 10 }}>
        <span className="eyebrow">Custom</span>
        <div className="row gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="h3" style={{ marginBottom: 10 }}>{workout.name}</div>
      {exs.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(3, exs.length)}, 1fr)`,
          gap: 6, marginBottom: 10,
        }}>
          {exs.map(({ ex, key }) => <ExerciseTile key={key} exercise={ex} size="sm" />)}
        </div>
      )}
      <div className="muted" style={{ fontSize: 12 }}>
        {(workout.exercises || []).length} exercises · {totalSets} sets
      </div>
    </div>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}
