import { useMemo, useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { kgToLb, lbToKg } from '../utils/units.js';

// Plates available, in kg + lb columns
const KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const LB_PLATES = [45, 35, 25, 10, 5, 2.5];
const KG_PLATE_COLOR = {
  25: '#dc2626', 20: '#1e40af', 15: '#ca8a04', 10: '#374151',
  5: '#374151', 2.5: '#374151', 1.25: '#374151',
};
const LB_PLATE_COLOR = {
  45: '#dc2626', 35: '#1e40af', 25: '#ca8a04', 10: '#374151',
  5: '#374151', 2.5: '#374151',
};

function calcPlates(target, bar, plates) {
  let remaining = target - bar;
  if (remaining <= 0) return { plates: [], leftover: -remaining };
  const perSide = remaining / 2;
  const out = [];
  let left = perSide;
  for (const p of plates) {
    while (left + 1e-6 >= p) {
      out.push(p);
      left -= p;
    }
  }
  return { plates: out, leftover: Math.round(left * 100) / 100 };
}

export default function PlateCalculator({ open, onClose, defaultTarget, units = 'metric' }) {
  const [target, setTarget] = useState(defaultTarget || (units === 'imperial' ? 135 : 60));
  const [bar, setBar] = useState(units === 'imperial' ? 45 : 20);

  const { plates, leftover } = useMemo(() => {
    const t = Number(target) || 0;
    const b = Number(bar) || 0;
    const list = units === 'imperial' ? LB_PLATES : KG_PLATES;
    return calcPlates(t, b, list);
  }, [target, bar, units]);

  const colors = units === 'imperial' ? LB_PLATE_COLOR : KG_PLATE_COLOR;
  const unit = units === 'imperial' ? 'lb' : 'kg';

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 200, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card slide-up" style={{
        width: '100%', maxWidth: 460, padding: 18,
      }}>
        <div className="row-between mb-4">
          <div className="row gap-2">
            <Calculator size={16} style={{ color: 'var(--gold)' }} />
            <div className="eyebrow">Plate calculator</div>
          </div>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label">Target ({unit})</label>
            <input
              className="input"
              type="number" inputMode="decimal" min={0}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Bar weight ({unit})</label>
            <input
              className="input"
              type="number" inputMode="decimal" min={0}
              value={bar}
              onChange={(e) => setBar(e.target.value)}
            />
          </div>
        </div>

        {/* Visual barbell */}
        <div style={{
          marginTop: 18, padding: '20px 8px',
          background: 'var(--surface-2)', borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          minHeight: 110,
        }}>
          {plates.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>
              {leftover > 0 ? `Bar alone (${leftover}${unit} short)` : 'Just the bar.'}
            </div>
          ) : (
            <>
              {plates.slice().reverse().map((p, i) => (
                <Plate key={`l-${i}`} weight={p} color={colors[p] || '#374151'} side="left" />
              ))}
              <div style={{ width: 56, height: 8, background: '#9ca3af', borderRadius: 4 }} />
              {plates.map((p, i) => (
                <Plate key={`r-${i}`} weight={p} color={colors[p] || '#374151'} side="right" />
              ))}
            </>
          )}
        </div>

        <div className="row-between" style={{ marginTop: 14 }}>
          <div className="muted" style={{ fontSize: 12 }}>
            {plates.length > 0 && `Per side: ${plates.join(' + ')} ${unit}`}
            {leftover > 0 && ` (off by ${leftover}${unit} per side)`}
          </div>
          <div className="mono" style={{ fontWeight: 700 }}>
            ={' '}
            {(Number(bar) + plates.reduce((a, p) => a + p, 0) * 2).toFixed(2).replace(/\.?0+$/, '')}{' '}
            {unit}
          </div>
        </div>
      </div>
    </div>
  );
}

function Plate({ weight, color }) {
  // Bigger plates look bigger
  const big = weight >= 15 || weight >= 35;
  const mid = weight >= 5 && !big;
  const h = big ? 90 : mid ? 70 : 48;
  const w = 12 + (big ? 6 : mid ? 4 : 2);
  return (
    <div style={{
      width: w, height: h,
      background: color,
      borderRadius: 4,
      display: 'grid', placeItems: 'center',
      color: '#fff', fontSize: 9, fontWeight: 700,
      writingMode: 'vertical-rl',
      transform: 'rotate(180deg)',
      letterSpacing: '0.04em',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
    }}>{weight}</div>
  );
}

export { calcPlates };
