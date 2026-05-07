import { useMemo, useState } from 'react';
import { Download, Plus, Trophy, Camera } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import useStore from '../store/useStore.js';
import EmptyState from '../components/EmptyState.jsx';
import { LineProgress, BarVolume } from '../components/ProgressChart.jsx';
import { downloadCSV, exportToCSV, formatRelative } from '../utils/calculations.js';

export default function ProgressPage() {
  const { exercises, seriesFor, bodyWeightSeries, weeklyVolume, personalRecords, workouts } = useProgress();
  const sets = useStore((s) => s.sets);
  const photos = useStore((s) => s.photos);
  const addPhoto = useStore((s) => s.addPhoto);
  const logBodyWeight = useStore((s) => s.logBodyWeight);
  const pushToast = useStore((s) => s.pushToast);

  const [exercise, setExercise] = useState(exercises[0] || '');
  const [bw, setBw] = useState('');

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
              <input className="input" style={{ height: 32, padding: '4px 10px', width: 90 }} type="number" inputMode="decimal" placeholder="kg" value={bw} onChange={(e) => setBw(e.target.value)} />
              <button className="btn btn-gold btn-sm" onClick={() => { if (bw) { logBodyWeight(bw); setBw(''); pushToast('Logged', 'success'); } }}><Plus size={14} /></button>
            </div>
          </div>
          {bodyWeightSeries.length > 1 ? (
            <LineProgress data={bodyWeightSeries} dataKey="weight" label="kg" />
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
