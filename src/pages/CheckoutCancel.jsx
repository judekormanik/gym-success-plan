import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function CheckoutCancel() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card slide-up text-center" style={{ maxWidth: 420, padding: 36 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: 'var(--surface-2)', color: 'var(--text-mute)',
          display: 'grid', placeItems: 'center', margin: '0 auto 16px',
        }}>
          <X size={24} />
        </div>
        <div className="h2" style={{ marginBottom: 8 }}>No charge made.</div>
        <div className="muted" style={{ marginBottom: 24 }}>You cancelled the payment. Whenever you're ready, the system is here.</div>
        <div className="row gap-2" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-ghost">Back home</Link>
          <Link to="/checkout" className="btn btn-gold">Try again</Link>
        </div>
      </div>
    </div>
  );
}
