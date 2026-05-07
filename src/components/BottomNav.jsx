import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, LineChart, Apple, Users } from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/workout', label: 'Train', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/nutrition', label: 'Food', icon: Apple },
  { to: '/community', label: 'Community', icon: Users },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <n.icon size={20} />
          {n.label}
        </NavLink>
      ))}
    </nav>
  );
}
