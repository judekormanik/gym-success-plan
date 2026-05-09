import { useMemo, useState } from 'react';
import { Download, Plus, Trophy, Camera, Share2, Flame } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import useStore from '../store/useStore.js';
import EmptyState from '../components/EmptyState.jsx';
import BodyMeasurements from '../components/BodyMeasurements.jsx';
import { LineProgress, BarVolume } from '../components/ProgressChart.jsx';
import { downloadCSV, exportToCSV, formatRelative, epley1RM } from '../utils/calculations.js';
import { formatWeight, toMetricWeight, WEIGHT_UNIT_LABEL, kgToLb } from '../utils/units.js';

export default function ProgressPage() {
  const { exercises, seriesFor, bodyWeightSeries, weeklyVolume, personalRecords, workouts } = useProgress();
  const sets = useStore((s) => s.sets);
  const photos = useStore((s) => s.photos);
  const addPhoto = useStore((s) => s.addPhoto);
  const logBodyWeight = useStore((s) => s.logBodyWeight);
  const pushToast = useStore((s) => s.pushToast);
  const units = useStore((s) => s.profile?.units || 'metric');

  const [exercise, setExercise] = useState(exercises[0] || '');
  const [bw, setBw] = useState('');

  const topPRs = useMemo(() => {
    const byExercise = {};
    personalRecords.forEach((pr) => {
      const score = epley1RM(Number(pr.weight), Number(pr.reps));
      if (!byExercise[pr.exercise_name] || byExercise[pr.exercise_name].score < score) {
        byExercise[pr.exercise_name] = { ...pr, score };
      }
    });
    return Object.values(byExercise).sort((a, b) => b.score - a.score).slice(0, 3);
  }, [personalRecords]);

  const sharePR = async (pr) => {
    const text = `🏋️ New PR: ${pr.exercise_name} · ${formatWeight(pr.weight, units)} × ${pr.reps} (est ${formatWeight(pr.score, units, { decimals: 0 })} 1RM)`;
    if (navigator.share) {
      try { await navigator.share({ title: 'PR', text }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      pushToast('Copied to clipboard', 'success');
    } catch {
      pushToast(text, 'default');
    }
  };

  const series = useMemo(() => (exercise ? seriesFor(exercise) : []), [exercise, seriesFor]);

  const exportAll = () => {
    const rows = [
      ...workouts.map((w) => ({ kind: 'workout', date: w.completed_at, day: w.day_name, duration: w.duration_minutes })),
      ...sets.map((s) => ({ kind: 'set', date: s.completed_at, exercise: s.exercise_name, weight: s.weight, reps: s.reps, drop_set: s.is_drop_set, pr: s.is_pr })),
      ...personalRecords.map((p) => ({ kind: 'pr', date: p.achieved_at, exercise: p.exercise_name, weight: p.weight, reps: p.reps })),
      ...bodyWeightSeries.map((b) => ({ kind: 'body_weight', date: b.date, weight: b.weight })),
    ];
    if (!rows.length) {
      pushToast('Nothing to export yet', 'error');
      return;
    }
    downloadCSV(`gym-success-export-${Date.now()}.csv`, exportToCSV(rows));
    pushToast('Export downloaded', 'success');
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addPhoto({ photoUrl: reader.result, notes: '' });
      pushToast('Photo saved', 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fade-in">
      <div className="row-between mb-6">
        <div>
          <div className="eyebrow">Progress</div>
          <h1 className="h2" style={{ marginTop: 6 }}>Your data, charted.</h1>
        </div>
        <button onClick={exportAll} className="btn btn-ghost"><Download size={14} /> Export CSV</button>
      </div>

      {/* Top PR hero strip */}
      {topPRs.length > 0 && (
        <div className="card-row cols-3 mb-6">
          {topPRs.map((pr) => (
            <div key={pr.id} className="card hover" style={{
              padding: 18,
              background: 'linear-gradient(180deg, rgba(212,175,55,0.08), transparent), var(--surface)',
              border: '1px solid rgba(212,175,55,0.25)',
            }}>
              <div className="row-between mb-2">
                <div className="row gap-2">
                  <Trophy size={14} style={{ color: 'var(--gold)' }} />
                  <span className="eyebrow gold" style={{ color: 'var(--gold)' }}>Top PR</span>
                </div>
                <button onClick={() => sharePR(pr)} className="icon-btn" style={{ width: 28, height: 28 }} aria-label="Share">
                  <Share2 size={14} />
                </button>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{pr.exercise_name}</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: 'var(--gold)' }}>
                {formatWeight(pr.weight, units, { decimals: 1 })}
                <span style={{ color: 'var(--text)', fontSize: 16, fontWeight: 600 }}> × {pr.reps}</span>
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                est 1RM {formatWeight(pr.score, units, { decimals: 0 })} · {formatRelative(pr.achieved_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card-row cols-2 mb-6">
        <div className="card" style={{ padding: 20 }}>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div className="eyebrow">Exercise 1RM trend</div>
            {exercises.length > 0 && (
              <select className="select" style={{ height: 32, padding: '4px 8px', maxWidth: 220 }} value={exercise} onChange={(e) => setExercise(e.target.value)}>
                {exercises.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            )}
          </div>
          {series.length > 1 ? (
            <LineProgress data={series} />
          ) : (
            <EmptyState icon={Trophy} title="No data yet" body="Log a few sets to see your strength trend appear here." />
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Weekly volume</div>
          {weeklyVolume.length ? <BarVolume data={weeklyVolume} /> : (
            <EmptyState icon={Trophy} title="Volume builds with reps" body="Finish a session and your weekly volume will show here." />
          )}
        </div>
      </div>

      <div className="card-row cols-2 mb-6">
        <div className="card" style={{ padding: 20 }}>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div className="eyebrow">Body weight</div>
            <div className="row gap-2">
              <input
                className="input"
                style={{ height: 32, padding: '4px 10px', width: 90 }}
                type="number" inputMode="decimal"
                placeholder={WEIGHT_UNIT_LABEL(units)}
                value={bw}
                onChange={(e) => setBw(e.target.value)}
              />
              <button className="btn btn-gold btn-sm" onClick={() => {
                if (!bw) return;
                const kg = toMetricWeight(bw, units);
                if (kg != null) { logBodyWeight(kg); setBw(''); pushToast('Logged', 'success'); }
              }}><Plus size={14} /></button>
            </div>
          </div>
          {bodyWeightSeries.length > 1 ? (
            <LineProgress
              data={units === 'imperial'
                ? bodyWeightSeries.map((p) => ({ date: p.date, weight: Number(kgToLb(p.weight).toFixed(1)) }))
                : bodyWeightSeries}
              dataKey="weight"
              label={WEIGHT_UNIT_LABEL(units)}
            />
          ) : (
            <EmptyState title="Log to start a chart" body="Track your body weight a few times a week for a clean trend line." />
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Personal records</div>
          {personalRecords.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflow: 'auto' }} className="no-scrollbar">
              {personalRecords.map((p) => (
                <div key={p.id} className="row-between" style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.exercise_name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{formatRelative(p.achieved_at)}</div>
                  </div>
                  <div className="mono" style={{ fontWeight: 700, color: 'var(--gold)' }}>{p.weight}kg × {p.reps}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Trophy} title="No PRs yet" body="Push past a previous best to add it here." />
          )}
        </div>
      </div>

      <BodyMeasurements />

      <div className="mt-6" />

      <WorkoutHistory workouts={workouts} />

      <div className="mt-6" />

      <div className="card" style={{ padding: 20 }}>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div className="eyebrow">Progress photos</div>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            <Camera size={14} /> Upload
            <input type="file" accept="image/*" hidden onChange={onPhoto} />
          </label>
        </div>
        {photos.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {photos.map((p) => (
              <div key={p.id} style={{
                position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                border: '1px solid var(--border)',
              }}>
                <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Camera} title="Track your transformation" body="Upload a photo every few weeks to see your visual progress." />
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────
// Workout history with calendar heatmap and most-recent list
// ───────────────────────────────────────────────────────
function WorkoutHistory({ workouts }) {
  const days = useMemo(() => {
    // Last 12 weeks (84 days) ending today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const map = {};
    workouts.forEach((w) => {
      if (!w.completed_at) return;
      const k = new Date(w.completed_at).toISOString().slice(0, 10);
      map[k] = (map[k] || 0) + 1;
    });
    const out = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      out.push({ key: k, count: map[k] || 0, date: d });
    }
    return out;
  }, [workouts]);

  const recent = useMemo(() => {
    return [...workouts]
      .filter((w) => w.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 8);
  }, [workouts]);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row-between mb-4">
        <div className="row gap-2">
          <Flame size={14} style={{ color: 'var(--gold)' }} />
          <div className="eyebrow">Workout history</div>
        </div>
        <span className="muted" style={{ fontSize: 12 }}>Last 12 weeks</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridAutoRows: 12,
        gap: 3, marginBottom: 16,
      }}>
        {Array.from({ length: 7 }).map((_, row) =>
          Array.from({ length: 12 }).map((__, col) => {
            const idx = col * 7 + row;
            const day = days[idx];
            if (!day) return <div key={`${row}-${col}`} />;
            const intensity = Math.min(1, day.count / 2);
            const bg = day.count === 0
              ? 'rgba(255,255,255,0.04)'
              : `rgba(212, 175, 55, ${0.25 + intensity * 0.65})`;
            return (
              <div
                key={`${row}-${col}`}
                title={`${day.key} · ${day.count} workout${day.count === 1 ? '' : 's'}`}
                style={{ height: 12, borderRadius: 3, background: bg }}
              />
            );
          })
        )}
      </div>

      {recent.length === 0 ? (
        <EmptyState title="Nothing to show yet" body="Finish a session and it'll appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recent.map((w) => (
            <div key={w.id} className="row-between" style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{w.day_name || 'Workout'}</div>
                <div className="muted" style={{ fontSize: 11 }}>
                  {new Date(w.completed_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  {w.duration_minutes ? ` · ${w.duration_minutes} min` : ''}
                </div>
              </div>
              {w.notes && (
                <div className="muted" style={{ fontSize: 12, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {w.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
