import { useState } from 'react';
import { TrendingUp, Flame, History, ChevronDown, ChevronUp } from 'lucide-react';
import { generateWarmup } from '../utils/progression.js';

// Shows the auto-progression suggestion (one line) and a collapsible
// warmup-ladder beneath it, so the lifter walks in knowing their numbers.
export default function ProgressionHint({ suggestion, units = 'metric', compound = true }) {
  const [warmupOpen, setWarmupOpen] = useState(false);
  if (!suggestion) return null;

  const warmups = suggestion.suggestedKg ? generateWarmup(suggestion.suggestedKg, units, { compound }) : [];

  const palette = {
    bump:       { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  Icon: TrendingUp, color: 'var(--success)' },
    repeat:     { bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.3)', Icon: History,    color: 'var(--gold)' },
    'first-time': { bg: 'var(--surface-2)',    border: 'var(--border)',         Icon: Flame,      color: 'var(--text-dim)' },
  }[suggestion.kind] || { bg: 'var(--surface-2)', border: 'var(--border)', Icon: Flame, color: 'var(--text-dim)' };

  return (
    <div style={{
      padding: '10px 12px', marginBottom: 8,
      borderRadius: 10,
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div className="row-between" style={{ gap: 8 }}>
        <div className="row gap-2" style={{ minWidth: 0 }}>
          <palette.Icon size={14} style={{ color: palette.color, flexShrink: 0 }} />
          <div style={{ fontSize: 13, lineHeight: 1.4, minWidth: 0 }}>
            <span style={{ fontWeight: 600 }}>{suggestion.label}</span>
            {suggestion.lastWeightDisplay && suggestion.kind === 'bump' && (
              <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>
                · last: {suggestion.lastWeightDisplay}
              </span>
            )}
          </div>
        </div>
        {warmups.length > 0 && (
          <button
            onClick={() => setWarmupOpen((v) => !v)}
            className="pill"
            style={{
              padding: '3px 9px', fontSize: 10, cursor: 'pointer', flexShrink: 0,
              background: 'transparent', borderColor: 'var(--border-strong)',
              color: 'var(--text-dim)',
            }}
          >
            {warmupOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {warmupOpen ? 'Hide warmup' : 'Warmup ladder'}
          </button>
        )}
      </div>

      {warmupOpen && warmups.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <div className="muted" style={{ fontSize: 10, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Warmup → working
          </div>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {warmups.map((w, i) => (
              <div key={i} style={{
                padding: '4px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px dashed var(--border)',
                fontSize: 12,
              }}>
                <span className="mono" style={{ fontWeight: 600 }}>{w.display}</span>
                <span className="muted" style={{ marginLeft: 6, fontSize: 11 }}>× {w.reps}</span>
                <span className="muted" style={{ marginLeft: 6, fontSize: 9 }}>({w.pct}%)</span>
              </div>
            ))}
            <div style={{
              padding: '4px 10px', borderRadius: 8,
              background: 'var(--gold-bg)', border: '1px solid rgba(212,175,55,0.3)',
              color: 'var(--gold)', fontSize: 12, fontWeight: 700,
            }}>
              <span className="mono">{suggestion.display}</span>
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>× {suggestion.repsHint}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
