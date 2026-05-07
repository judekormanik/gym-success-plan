function Ring({ label, value, target, color }) {
  const pct = Math.min(100, target > 0 ? (value / target) * 100 : 0);
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <circle
          cx="36" cy="36" r={r}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1)' }}
        />
        <text x="36" y="34" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{Math.round(value)}</text>
        <text x="36" y="48" textAnchor="middle" fill="#a3a3a3" fontSize="9">/ {Math.round(target)}g</text>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  );
}

export default function MacroRings({ totals, targets }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <Ring label="Protein" value={totals.protein} target={targets.protein} color="#d4af37" />
      <Ring label="Carbs" value={totals.carbs} target={targets.carbs} color="#9ca3af" />
      <Ring label="Fats" value={totals.fats} target={targets.fats} color="#6b7280" />
    </div>
  );
}
