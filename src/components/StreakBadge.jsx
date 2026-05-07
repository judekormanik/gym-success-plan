import { Flame, Trophy } from 'lucide-react';
import useStreak from '../hooks/useStreak.js';
import { STREAK_MILESTONES } from '../utils/constants.js';

export default function StreakBadge({ compact = false }) {
  const { current, longest } = useStreak();
  const nextMilestone = STREAK_MILESTONES.find((m) => m > current) || (current + 7);
  const progress = Math.min(100, (current / nextMilestone) * 100);

  if (compact) {
    return (
      <span className="flame">
        <Flame size={14} className="flame-icon" />
        <span className="mono">{current}</span>
      </span>
    );
  }

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 8 }}>
        <div className="row gap-2">
          <Flame size={16} style={{ color: 'var(--gold)' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Streak</span>
        </div>
        <Trophy size={14} style={{ color: 'var(--text-mute)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 28, fontWeight: 800 }}>{current}</span>
        <span className="muted" style={{ fontSize: 12 }}>day{current === 1 ? '' : 's'}</span>
      </div>
      <div style={{ height: 4, background: '#0e0e0e', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)' }} />
      </div>
      <div className="muted" style={{ fontSize: 11 }}>
        Next milestone: {nextMilestone} days · longest {longest}
      </div>
    </div>
  );
}
