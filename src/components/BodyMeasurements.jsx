import { useState } from 'react';
import { Plus, Ruler, X } from 'lucide-react';
import useStore from '../store/useStore.js';
import EmptyState from './EmptyState.jsx';
import { formatLength, toMetricLength, LENGTH_UNIT_LABEL } from '../utils/units.js';
import { formatRelative } from '../utils/calculations.js';

const FIELDS = [
  { id: 'chest',       label: 'Chest' },
  { id: 'waist',       label: 'Waist' },
  { id: 'hips',        label: 'Hips' },
  { id: 'left_arm',    label: 'Left arm' },
  { id: 'right_arm',   label: 'Right arm' },
  { id: 'left_thigh',  label: 'Left thigh' },
  { id: 'right_thigh', label: 'Right thigh' },
  { id: 'neck',        label: 'Neck' },
  { id: 'calf',        label: 'Calf' },
];

export default function BodyMeasurements() {
  const measurements = useStore((s) => s.measurements);
  const units = useStore((s) => s.profile?.units || 'metric');
  const logMeasurement = useStore((s) => s.logMeasurement);
  const pushToast = useStore((s) => s.pushToast);
  const [open, setOpen] = useState(false);

  const latest = measurements[0];

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row-between mb-4">
        <div className="row gap-2">
          <Ruler size={14} style={{ color: 'var(--gold)' }} />
          <div className="eyebrow">Body measurements</div>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-quiet btn-sm">
          <Plus size={14} /> Log
        </button>
      </div>

      {!latest ? (
        <EmptyState
          title="Track your transformation"
          body="Log every couple of weeks to see waist, chest, arms move."
        />
      ) : (
        <>
          <div className="muted" style={{ fontSize: 11, marginBottom: 10 }}>
            Latest · {formatRelative(latest.logged_at)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
            {FIELDS.filter((f) => latest[f.id] != null).map((f) => {
              const earlier = measurements.slice(1).find((m) => m[f.id] != null);
              const delta = earlier ? Number(latest[f.id]) - Number(earlier[f.id]) : null;
              return (
                <div key={f.id} style={{
                  padding: 10, background: 'var(--surface-2)',
                  borderRadius: 10, border: '1px solid var(--border)',
                }}>
                  <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>
                    {formatLength(Number(latest[f.id]), units)}
                  </div>
                  {delta != null && delta !== 0 && (
                    <div style={{
                      fontSize: 11, marginTop: 2,
                      color: Math.abs(delta) < 0.5 ? 'var(--text-mute)' : delta > 0 ? '#22c55e' : '#f87171',
                    }}>
                      {delta > 0 ? '+' : ''}{formatLength(Math.abs(delta), units)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {open && <MeasureModal units={units} onClose={() => setOpen(false)} onSubmit={(payload) => {
        logMeasurement(payload);
        pushToast('Measurements logged', 'success');
        setOpen(false);
      }} />}
    </div>
  );
}

function MeasureModal({ units, onClose, onSubmit }) {
  const [vals, setVals] = useState({});
  const [notes, setNotes] = useState('');
  const submit = () => {
    const payload = {};
    FIELDS.forEach((f) => {
      const v = vals[f.id];
      if (v !== '' && v != null) {
        const cm = toMetricLength(v, units);
        if (cm != null && cm > 0) payload[f.id] = Number(cm.toFixed(2));
      }
    });
    if (notes) payload.notes = notes;
    if (Object.keys(payload).length === 0) return;
    onSubmit(payload);
  };
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card slide-up" style={{
        width: '100%', maxWidth: 480, padding: 18, maxHeight: '85vh', overflow: 'auto',
      }}>
        <div className="row-between mb-4">
          <div>
            <div className="eyebrow">Body measurements</div>
            <div className="h3" style={{ marginTop: 2 }}>Log today</div>
          </div>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
          Skip any you don't measure today. Values in {LENGTH_UNIT_LABEL(units)}.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {FIELDS.map((f) => (
            <div key={f.id}>
              <label className="label">{f.label}</label>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                placeholder={LENGTH_UNIT_LABEL(units)}
                value={vals[f.id] ?? ''}
                onChange={(e) => setVals((v) => ({ ...v, [f.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <label className="label" style={{ marginTop: 12 }}>Notes (optional)</label>
        <textarea
          className="textarea"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything worth remembering"
        />
        <button onClick={submit} className="btn btn-gold btn-block btn-lg" style={{ marginTop: 14 }}>
          Save measurements
        </button>
      </div>
    </div>
  );
}
