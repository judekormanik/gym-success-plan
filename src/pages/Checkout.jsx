import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import { startCheckout } from '../utils/stripe.js';
import { PRICE_USD, MONTHLY_EQ } from '../utils/constants.js';
import useStore from '../store/useStore.js';

export default function Checkout() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const pushToast = useStore((s) => s.pushToast);
  const [email, setEmail] = useState(user?.email || '');
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (!email) {
      pushToast('Email required', 'error');
      return;
    }
    setBusy(true);
    await startCheckout(email);
    setBusy(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card slide-up" style={{ maxWidth: 460, width: '100%', padding: 32 }}>
        <Link to="/" className="muted row gap-2" style={{ fontSize: 12, marginBottom: 14 }}>
          <ArrowLeft size={12} /> Back
        </Link>
        <div className="eyebrow gold" style={{ color: 'var(--gold)', marginBottom: 6 }}>Checkout</div>
        <div className="h2">Get The Gym Success Plan.</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em' }}>${PRICE_USD}</span>
          <span className="muted">/ year — about ${MONTHLY_EQ}/mo</span>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Full app · workouts, progress, nutrition, community', 'Installable PWA · works offline', 'Cancel anytime · keep your data'].map((b) => (
            <li key={b} className="row gap-2" style={{ fontSize: 14 }}>
              <Check size={14} style={{ color: 'var(--gold)' }} />{b}
            </li>
          ))}
        </ul>

        <label className="label">Email</label>
        <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

        <button onClick={go} disabled={busy} className="btn btn-gold btn-lg btn-block" style={{ marginTop: 14 }}>
          {busy ? 'Redirecting to secure checkout…' : 'Pay with Stripe'}
        </button>

        <div className="row gap-2 muted" style={{ justifyContent: 'center', marginTop: 12, fontSize: 12 }}>
          <ShieldCheck size={12} /> Payment is processed by Stripe. We never see your card.
        </div>
      </div>
    </div>
  );
}
