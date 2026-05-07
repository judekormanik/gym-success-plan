import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronLeft, Check } from 'lucide-react';
import useWorkout from '../hooks/useWorkout.js';
import useStore from '../store/useStore.js';
import WorkoutCard from '../components/WorkoutCard.jsx';
import ExerciseRow from '../components/ExerciseRow.jsx';
import { PLAN } from '../utils/constants.js';
import { isPersonalRecord } from '../utils/calculations.js';
import PRCelebration from '../components/PRCelebration.jsx';

export default function WorkoutPage() {
  const { todayPlan, lastSession, saveWorkout } = useWorkout();
  const sets = useStore((s) => s.sets);
  const logPR = useStore((s) => s.logPR);
  const pushToast = useStore((s) => s.pushToast);

  const [activeDay, setActiveDay] = useState(todayPlan.day);
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

  const day = useMemo(() => PLAN.find((p) => p.day === activeDay) || todayPlan, [activeDay, todayPlan]);

  const begin = () => {
    setSession(true);
    setStart(Date.now());
    setCollected([]);
    setElapsed(0);
  };

  const onCompleteSet = (data) => {
    const prev = sets.filter((s) => s.exercise_name === data.exercise);
    const isPR = isPersonalRecord(prev, Number(data.weight), Number(data.reps));
    const row = { ...data, isPR };
    setCollected((c) => [...c, row]);
    pushToast(isPR ? `New PR · ${data.exercise}` : 'Set saved', isPR ? 'success' : 'default');
    if (isPR) {
      logPR({ exercise_name: data.exercise, weight: Number(data.weight), reps: Number(data.reps) });
    }
  };

  const finish = async () => {
    if (!collected.length) {
      pushToast('Log at least one set first', 'error');
      return;
    }
    await saveWorkout({
      dayNumber: day.day,
      dayName: day.name,
      durationMinutes: Math.max(1, Math.round(elapsed / 60)),
      notes,
      sets: collected,
    });
    pushToast(`Day ${day.day} saved`, 'success');
    setSession(false); setCollected([]); setNotes(''); setElapsed(0); setStart(null);
  };

  return (
    <div className="fade-in">
      <PRCelebration />

      {!session ? (
        <>
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div>
              <div className="eyebrow">Workout</div>
              <h1 className="h2" style={{ marginTop: 6 }}>Pick your day</h1>
            </div>
          </div>
          <div className="card-row cols-2 mb-6">
            {PLAN.map((p) => (
              <WorkoutCard key={p.day} day={p} active={p.day === activeDay} onClick={() => setActiveDay(p.day)} />
            ))}
          </div>
          <button className="btn btn-gold btn-lg btn-block" onClick={begin}>
            Start Day {day.day} — {day.name}
          </button>
        </>
      ) : (
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

            <div className="eyebrow" style={{ marginBottom: 4 }}>Day {day.day}</div>
            <h2 className="h2" style={{ marginBottom: 18 }}>{day.name}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {day.exercises.map((ex) => (
                <ExerciseRow
                  key={ex.name}
                  exercise={ex}
                  previous={lastSession(ex.name)}
                  onCompleteSet={onCompleteSet}
                />
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
      )}
    </div>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}
