import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronLeft, Check, Plus, BookOpen, Trash2 } from 'lucide-react';
import useWorkout from '../hooks/useWorkout.js';
import useStore from '../store/useStore.js';
import WorkoutCard from '../components/WorkoutCard.jsx';
import ExerciseRow from '../components/ExerciseRow.jsx';
import ExerciseTile from '../components/ExerciseTile.jsx';
import { PLAN } from '../utils/constants.js';
import { exerciseById } from '../utils/exerciseLibrary.js';
import { isPersonalRecord } from '../utils/calculations.js';
import PRCelebration from '../components/PRCelebration.jsx';

export default function WorkoutPage() {
  const { todayPlan, lastSession, saveWorkout } = useWorkout();
  const sets = useStore((s) => s.sets);
  const customWorkouts = useStore((s) => s.customWorkouts);
  const deleteCustomWorkout = useStore((s) => s.deleteCustomWorkout);
  const logPR = useStore((s) => s.logPR);
  const pushToast = useStore((s) => s.pushToast);

  const [tab, setTab] = useState('plan'); // plan | mine
  const [activeDay, setActiveDay] = useState(todayPlan.day);
  const [activeCustomId, setActiveCustomId] = useState(null);
  const [session, setSession] = useState(false);
  const [start, setStart] = useState(null);
  const [collected, setCollected] = useState([]);
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);

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
      const exercises = (cw.exercises || []).map((row) => {
        const ex = exerciseById(row.exerciseId);
        return ex ? { name: ex.name, sets: row.sets, exercise: ex } : null;
      }).filter(Boolean);
      return { day: 0, name: cw.name, kind: 'custom', exercises, customId: cw.id };
    }
    const p = PLAN.find((p) => p.day === activeDay) || todayPlan;
    return {
      day: p.day, name: p.name, kind: 'default',
      exercises: p.exercises.map((e) => ({ ...e, exercise: null })),
    };
  }, [tab, activeCustomId, activeDay, customWorkouts, todayPlan]);

  const begin = () => {
    if (!activeSession || !activeSession.exercises.length) {
      pushToast('Pick a workout first', 'error');
      return;
    }
    setSession(true); setStart(Date.now()); setCollected([]); setElapsed(0);
  };

  const onCompleteSet = (data) => {
    const prev = sets.filter((s) => s.exercise_name === data.exercise);
    const isPR = isPersonalRecord(prev, Number(data.weight), Number(data.reps));
    const row = { ...data, isPR };
    setCollected((c) => [...c, row]);
    pushToast(isPR ? `New PR · ${data.exercise}` : 'Set saved', isPR ? 'success' : 'default');
    if (isPR) logPR({ exercise_name: data.exercise, weight: Number(data.weight), reps: Number(data.reps) });
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
                <Timer size={14} style={{ color: 'var(--gold)' }} />
                <span className="mono" style={{ fontWeight: 600 }}>{formatTime(elapsed)}</span>
              </div>
            </div>

            <div className="eyebrow" style={{ marginBottom: 4 }}>
              {activeSession.kind === 'custom' ? 'Custom workout' : `Day ${activeSession.day}`}
            </div>
            <h2 className="h2" style={{ marginBottom: 18 }}>{activeSession.name}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeSession.exercises.map((ex) => (
                <div key={ex.name}>
                  {ex.exercise && (
                    <div style={{ marginBottom: 8 }}>
                      <ExerciseTile exercise={ex.exercise} size="sm" />
                    </div>
                  )}
                  <ExerciseRow
                    exercise={{ name: ex.name, sets: ex.sets, optional: ex.optional }}
                    previous={lastSession(ex.name)}
                    onCompleteSet={onCompleteSet}
                  />
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16, marginTop: 16 }}>
              <label className="label">Session notes</label>
              <textarea className="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" />
            </div>

            <button onClick={finish} className="btn btn-gold btn-lg btn-block" style={{ marginTop: 18 }}>
              <Check size={16} /> Finish session ({collected.length} set{collected.length === 1 ? '' : 's'})
            </button>
          </motion.div>
        </AnimatePresence>
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
                    onDelete={() => deleteCustomWorkout(cw.id)}
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

function CustomCard({ workout, active, onPick, onDelete }) {
  const exs = (workout.exercises || []).slice(0, 3).map((row) => exerciseById(row.exerciseId)).filter(Boolean);
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
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="icon-btn"
          style={{ width: 28, height: 28 }}
          aria-label="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="h3" style={{ marginBottom: 10 }}>{workout.name}</div>
      {exs.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(3, exs.length)}, 1fr)`,
          gap: 6, marginBottom: 10,
        }}>
          {exs.map((ex) => <ExerciseTile key={ex.id} exercise={ex} size="sm" />)}
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
