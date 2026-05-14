import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Activity, Scale, UtensilsCrossed, Cloud, Plus, Trophy, Coffee, TrendingUp, TrendingDown, Minus, Moon } from 'lucide-react';
import useStore from '../store/useStore.js';
import useWorkout from '../hooks/useWorkout.js';
import useNutrition from '../hooks/useNutrition.js';
import useStreak from '../hooks/useStreak.js';
import { LineProgress } from '../components/ProgressChart.jsx';
import { QUOTES } from '../utils/constants.js';
import { formatRelative, dateKey, epley1RM } from '../utils/calculations.js';
import { formatWeight } from '../utils/units.js';
import PRCelebration from '../components/PRCelebration.jsx';

// ── Helpers used by weekly summary + rest-day detection ────────────
function startOfWeek(d = new Date()) {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  // Treat Monday as day 0 of the training week
  const dow = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dow);
  return x;
}
function inWindow(date, start, end) {
  const t = new Date(date).getTime();
  return t >= start.getTime() && t < end.getTime();
}
function trendArrow(delta) {
  if (delta > 0) return { Icon: TrendingUp, color: 'var(--success)' };
  if (delta < 0) return { Icon: TrendingDown, color: 'var(--danger)' };
  return { Icon: Minus, color: 'var(--text-mute)' };
}
function consecutiveDaysTrained(workouts, today = new Date()) {
  const days = new Set(
    workouts
      .filter((w) => w.completed_at)
      .map((w) => dateKey(new Date(w.completed_at)))
  );
  let streak = 0;
  const cursor = new Date(today); cursor.setHours(0, 0, 0, 0);
  while (days.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Dashboard() {
  const profile = useStore((s) => s.profile);
  const lastSyncedAt = useStore((s) => s.lastSyncedAt);
  const bodyWeight = useStore((s) => s.bodyWeight);
  const logFood = useStore((s) => s.logFood);
  const pushToast = useStore((s) => s.pushToast);
  const { todayPlan, weekCount, workouts, sets } = useWorkout();
  const { totals, targets } = useNutrition();
  const { current } = useStreak();

  const quote = useMemo(() => {
    const idx = new Date().getDate() % QUOTES.length;
    return QUOTES[idx];
  }, []);

  const trend = useMemo(() => {
    return [...sets].slice(0, 30).reverse().map((s, i) => ({
      i, oneRM: Math.round((Number(s.weight) || 0) * (1 + (Number(s.reps) || 0) / 30)),
    }));
  }, [sets]);

  // Weekly summary — this week vs last week
  const weekly = useMemo(() => {
    const thisStart = startOfWeek();
    const lastStart = new Date(thisStart); lastStart.setDate(thisStart.getDate() - 7);
    const nextStart = new Date(thisStart); nextStart.setDate(thisStart.getDate() + 7);
    const thisW = workouts.filter((w) => w.completed_at && inWindow(w.completed_at, thisStart, nextStart));
    const lastW = workouts.filter((w) => w.completed_at && inWindow(w.completed_at, lastStart, thisStart));
    const thisSets = sets.filter((s) => s.completed_at && inWindow(s.completed_at, thisStart, nextStart));
    const lastSets = sets.filter((s) => s.completed_at && inWindow(s.completed_at, lastStart, thisStart));
    const vol = (rows) => rows.reduce((a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
    const prs = (rows) => rows.filter((s) => s.is_pr).length;
    return {
      sessions: thisW.length,
      sessionsDelta: thisW.length - lastW.length,
      volume: vol(thisSets),
      volumeDelta: vol(thisSets) - vol(lastSets),
      prs: prs(thisSets),
      prsDelta: prs(thisSets) - prs(lastSets),
    };
  }, [workouts, sets]);

  const restDayNudge = consecutiveDaysTrained(workouts) >= 4;

  const [quickCals, setQuickCals] = useState('');

  const quickLog = () => {
    const cal = Number(quickCals);
    if (!cal) return;
    logFood({ name: 'Quick log', calories: cal, protein: 0, carbs: 0, fats: 0 });
    setQuickCals('');
    pushToast(`Logged ${cal} cal`, 'success');
  };

  return (
    <div className="fade-in">
      <div className="row-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="h2" style={{ marginTop: 6 }}>Welcome back{profile?.name ? `, ${profile.name}` : ''}.</h1>
        </div>
        <Link to="/workout" className="btn btn-gold">Start workout <ArrowRight size={14} /></Link>
      </div>

      {restDayNudge && (
        <div className="card mb-4" style={{
          padding: 14,
          background: 'linear-gradient(180deg, rgba(96,165,250,0.08), transparent), var(--surface)',
          border: '1px solid rgba(96,165,250,0.3)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Moon size={18} style={{ color: '#60a5fa', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>You've trained 4+ days in a row.</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Consider a mobility day or light cardio today. Your gains happen on rest days.
            </div>
          </div>
        </div>
      )}

      <div className="card-row cols-4 mb-6">
        <Stat icon={Scale} label="Weight" value={bodyWeight[0]?.weight ? formatWeight(bodyWeight[0].weight, profile?.units || 'metric') : '—'} sub={bodyWeight[0]?.logged_at ? formatRelative(bodyWeight[0].logged_at) : 'No log yet'} />
        <Stat icon={Activity} label="Workouts this week" value={weekCount} sub={weekCount >= 4 ? 'On pace' : `${4 - weekCount} to hit goal`} />
        <Stat icon={Flame} gold label="Streak" value={`${current}`} sub={current === 0 ? 'Start today' : 'days in a row'} />
        <Stat icon={UtensilsCrossed} label="Calories today" value={Math.round(totals.calories)} sub={`/ ${targets.calories || '—'} target`} />
      </div>

      <div className="card-row cols-2 mb-6" style={{ alignItems: 'stretch' }}>
        <div className="card hover" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Today's workout</div>
          <div className="h3" style={{ marginBottom: 4 }}>Day {todayPlan.day} — {todayPlan.name}</div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
            {todayPlan.exercises.length} exercises · approx. 50 minutes
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayPlan.exercises.map((e) => (
              <li key={e.name} style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                <span>{e.name}</span><span className="muted mono">{e.sets} sets</span>
              </li>
            ))}
          </ul>
          <Link to="/workout" className="btn btn-gold btn-block" style={{ marginTop: 18 }}>Begin Day {todayPlan.day}</Link>
        </div>

        <div className="card hover" style={{ padding: 24 }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <div className="eyebrow">Strength trend</div>
            <Link to="/progress" className="muted" style={{ fontSize: 12 }}>View all →</Link>
          </div>
          {trend.length > 1 ? (
            <LineProgress data={trend} dataKey="oneRM" height={200} />
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', height: 200, color: 'var(--text-mute)', fontSize: 13 }}>
              Track a workout to start your trend.
            </div>
          )}
        </div>
      </div>

      {/* Weekly summary */}
      <div className="card mb-6" style={{ padding: 20 }}>
        <div className="row-between mb-4">
          <div>
            <div className="eyebrow">This week</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              Vs. last week · resets Monday
            </div>
          </div>
          <Link to="/progress" className="muted" style={{ fontSize: 12 }}>View all →</Link>
        </div>
        <div className="card-row cols-3" style={{ gap: 12 }}>
          <WeeklyStat
            icon={Activity}
            label="Sessions"
            value={weekly.sessions}
            delta={weekly.sessionsDelta}
            unit=""
          />
          <WeeklyStat
            icon={TrendingUp}
            label="Total volume"
            value={weekly.volume.toLocaleString()}
            delta={weekly.volumeDelta}
            unit=""
          />
          <WeeklyStat
            icon={Trophy}
            label="PRs broken"
            value={weekly.prs}
            delta={weekly.prsDelta}
            unit=""
          />
        </div>
      </div>

      <div className="card-row cols-2 mb-6">
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Quick calorie log</div>
          <div className="row gap-2">
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="kcal"
              value={quickCals}
              onChange={(e) => setQuickCals(e.target.value)}
            />
            <button className="btn btn-gold" onClick={quickLog}><Plus size={14} />Add</button>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Today: {Math.round(totals.calories)} / {targets.calories || '—'} kcal · {Math.round(totals.protein)}g protein
          </div>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="eyebrow">Today</div>
            <div className="h3" style={{ marginTop: 4, marginBottom: 6 }}>"{quote}"</div>
            <div className="muted" style={{ fontSize: 12 }}>Daily reminder · {dateKey()}</div>
          </div>
        </div>
      </div>

      <div className="row-between" style={{ marginTop: 20, color: 'var(--text-mute)', fontSize: 12 }}>
        <span className="row gap-2"><Cloud size={12} /> {lastSyncedAt ? `Last synced ${formatRelative(lastSyncedAt)}` : 'Local mode'}</span>
        <span>v1.0.0</span>
      </div>

      <PRCelebration />
    </div>
  );
}

function WeeklyStat({ icon: Icon, label, value, delta, unit = '' }) {
  const { Icon: ArrowIcon, color } = trendArrow(delta);
  const showDelta = delta !== 0 && Number.isFinite(delta);
  return (
    <div style={{
      padding: 14, borderRadius: 12,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
    }}>
      <div className="row-between mb-2">
        <Icon size={14} style={{ color: 'var(--text-mute)' }} />
        {showDelta && (
          <div className="row" style={{ gap: 4, color }}>
            <ArrowIcon size={12} />
            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>
              {delta > 0 ? '+' : ''}{Math.abs(delta).toLocaleString()}{unit}
            </span>
          </div>
        )}
      </div>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
        {value}{unit}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, gold }) {
  return (
    <div className="card hover" style={{ padding: 18 }}>
      <div className="row-between" style={{ marginBottom: 12 }}>
        <Icon size={16} style={{ color: gold ? 'var(--gold)' : 'var(--text-mute)' }} />
      </div>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: gold ? 'var(--gold)' : 'var(--text)' }}>
        {value}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>
    </div>
  );
}
