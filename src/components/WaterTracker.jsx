import { Droplets, Plus, Minus } from 'lucide-react';
import useStore from '../store/useStore.js';
import { formatVolume, mlToFloz } from '../utils/units.js';

const QUICK_ADDS_METRIC = [250, 500, 750];
const QUICK_ADDS_IMPERIAL = [240, 360, 500]; // ~8oz, 12oz, 16oz

export default function WaterTracker() {
  const today = useStore((s) => s.waterTodayMl);
  const target = useStore((s) => s.profile?.water_target_ml || 2500);
  const units = useStore((s) => s.profile?.units || 'metric');
  const logWater = useStore((s) => s.logWater);

  const pct = Math.min(100, target > 0 ? (today / target) * 100 : 0);
  const adds = units === 'imperial' ? QUICK_ADDS_IMPERIAL : QUICK_ADDS_METRIC;

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row-between mb-4">
        <div className="row gap-2">
          <Droplets size={14} style={{ color: '#60a5fa' }} />
          <div className="eyebrow">Water</div>
        </div>
        <div className="mono" style={{ fontWeight: 600, fontSize: 13 }}>
          {formatVolume(today, units)} <span className="muted">/ {formatVolume(target, units)}</span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: '#0e0e0e', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
          transition: 'width 400ms cubic-bezier(.2,.8,.2,1)',
        }} />
      </div>
      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        {adds.map((ml) => (
          <button
            key={ml}
            onClick={() => logWater(ml)}
            className="btn btn-quiet btn-sm"
            style={{ flex: '1 1 80px', minWidth: 80 }}
          >
            <Plus size={14} /> {units === 'imperial' ? `${Math.round(mlToFloz(ml))}oz` : `${ml}ml`}
          </button>
        ))}
        <button
          onClick={() => logWater(-(adds[0] || 250))}
          className="btn btn-ghost btn-sm"
          title="Undo last quick add"
          style={{ minWidth: 38 }}
        >
          <Minus size={14} />
        </button>
      </div>
    </div>
  );
}
