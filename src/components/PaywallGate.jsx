import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSubscription from '../hooks/useSubscription.js';

export default function PaywallGate({ children }) {
  const { isActive } = useSubscription();
  if (isActive) return children;

  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: 'var(--gold-bg)',
        color: 'var(--gold)', display: 'grid', placeItems: 'center', margin: '0 auto 12px',
      }}>
        <Lock size={20} />
      </div>
      <div className="h3" style={{ marginBottom: 8 }}>Premium feature</div>
      <div className="muted" style={{ marginBottom: 20, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
        Unlock the full Gym Success Plan — workouts, progress, nutrition, community.
      </div>
      <Link to="/checkout" className="btn btn-gold">Get Started · $19.99 / year</Link>
    </div>
  );
}
