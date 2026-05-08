import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import useStore from '../store/useStore.js';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const profile = useStore((s) => s.profile);

  useEffect(() => {
    // The real Stripe webhook activates subscription_status server-side. We
    // intentionally don't PATCH it from here — /api/profile blocks self-set
    // of subscription fields (security). For preview purposes, we set local
    // store state without persisting it.
    if (!user) return;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    useStore.setState((s) => ({
      profile: {
        ...(s.profile || {}),
        subscription_status: 'active',
        subscription_expires: expires.toISOString(),
      },
    }));
  }, [user]);

  const goNext = () => {
    if (!user) {
      navigate('/');
      return;
    }
    navigate(profile?.onboarded ? '/dashboard' : '/onboarding');
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
      <div className="card slide-up text-center" style={{ maxWidth: 420, width: '100%', padding: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: 'var(--gold)', color: '#0a0a0a',
          display: 'grid', placeItems: 'center', margin: '0 auto 16px',
        }}>
          <Check size={28} strokeWidth={3} />
        </div>
        <div className="h2" style={{ marginBottom: 8 }}>You're in.</div>
        <div className="muted" style={{ marginBottom: 24, fontSize: 15 }}>
          Welcome to The Gym Success Plan. {user ? "Let's get your profile set up." : 'Sign in to start training.'}
        </div>
        <button className="btn btn-gold btn-block btn-lg" onClick={goNext}>
          {!user ? 'Back home' : profile?.onboarded ? 'Open dashboard' : 'Continue to setup'}
        </button>
      </div>
    </div>
  );
}
