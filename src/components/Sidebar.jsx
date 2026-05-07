import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, LineChart, Apple, Users, User, Cloud, CloudOff } from 'lucide-react';
import useStore from '../store/useStore.js';
import StreakBadge from './StreakBadge.jsx';
import { formatRelative } from '../utils/calculations.js';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const lastSyncedAt = useStore((s) => s.lastSyncedAt);
  const syncing = useStore((s) => s.syncing);
  const online = useStore((s) => s.online);

  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="brand">
        <div className="brand-mark">G</div>
        <div>
          <div style={{ fontSize: 14 }}>The Gym</div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 500 }}>Success Plan</div>
        </div>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <n.icon className="nav-icon" />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 16, padding: 12, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <StreakBadge />
      </div>

      <div className="sidebar-footer">
        {online ? <Cloud size={14} style={{ color: 'var(--success)' }} /> : <CloudOff size={14} style={{ color: 'var(--danger)' }} />}
        <span>{syncing ? 'Syncing…' : lastSyncedAt ? `Synced ${formatRelative(lastSyncedAt)}` : 'Local only'}</span>
      </div>
    </aside>
  );
}
