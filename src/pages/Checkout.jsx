import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import { startCheckout } from '../utils/stripe.js';
import { PRICE_USD, MONTHLY_EQ } from '../utils/constants.js';
import useStore from '../store/useStore.js';

export default function Checkout() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const signUp = useStore((s) => s.signUpWithEmail);
  const pushToast = useStore((s) => s.pushToast);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isSignedIn = !!user;

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!email) { setError('Email is required'); return; }
    if (!isSignedIn && (!password || password.length < 6)) {
      setError('Password must be at least 6 characters');
      return;
    }
    setBusy(true);

    // Create the account first if needed — so checkout always has a real user
    // to attach the subscription to.
    if (!isSignedIn) {
      const res = await signUp(email, password);
      if (!res.ok) {
        setBusy(false);
        if (/exists/i.test(res.error || '')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(res.error || 'Could not create account');
        }
        return;
      }
      pushToast('Account created', 'success');
    }

    // Now start checkout. If Stripe is configured, this redirects to Stripe.
    // If not, the demo fallback in stripe.js redirects to /checkout-success.
    await startCheckout(email);
    setBusy(false);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
      padding: 16,
      paddingTop: 'calc(16px + env(safe-area-inset-top))',
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
    }}>
      <div className="card slide-up" style={{ maxWidth: 460, width: '100%', padding: 24 }}>
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

        <form onSubmit={submit}>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSignedIn}
            required
          />

          {!isSignedIn && (
            <>
              <label className="label" style={{ marginTop: 12 }}>Create a password</label>
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                You'll use this to sign in on any device.
              </div>
            </>
          )}

          {error && (
            <div style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} className="btn btn-gold btn-lg btn-block" style={{ marginTop: 16 }}>
            {busy ? 'One moment…' : isSignedIn ? 'Pay with Stripe' : 'Create account & pay'}
          </button>
        </form>

        <div className="row gap-2 muted" style={{ justifyContent: 'center', marginTop: 12, fontSize: 12, textAlign: 'center', flexWrap: 'wrap' }}>
          <ShieldCheck size={12} /> Payment is processed by Stripe. We never see your card.
        </div>
      </div>
    </div>
  );
}
