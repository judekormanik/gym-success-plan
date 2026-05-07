import { Link } from 'react-router-dom';
import { Flame, Cloud, CloudOff } from 'lucide-react';
import useStore from '../store/useStore.js';
import useStreak from '../hooks/useStreak.js';

export default function Navbar() {
  const profile = useStore((s) => s.profile);
  const syncing = useStore((s) => s.syncing);
  const online = useStore((s) => s.online);
  const { current } = useStreak();

  return (
    <div className="topbar">
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="brand-mark" style={{ width: 28, height: 28, fontSize: 12 }}>G</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>The Gym Success Plan</div>
      </Link>
      <div className="row gap-3">
        <span className="flame">
          <Flame className="flame-icon" size={16} />
          <span className="mono" style={{ fontSize: 13 }}>{current}</span>
        </span>
        {online
          ? <Cloud size={14} style={{ color: syncing ? 'var(--gold)' : 'var(--text-mute)' }} />
          : <CloudOff size={14} style={{ color: 'var(--danger)' }} />}
      </div>
    </div>
  );
}
