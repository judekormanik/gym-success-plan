import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import useStore from '../store/useStore.js';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const saveProfile = useStore((s) => s.saveProfile);

  useEffect(() => {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    saveProfile({
      subscription_status: 'active',
      subscription_expires: expires.toISOString(),
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card slide-up text-center" style={{ maxWidth: 420, padding: 36 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: 'var(--gold)', color: '#0a0a0a',
          display: 'grid', placeItems: 'center', margin: '0 auto 16px',
        }}>
          <Check size={28} strokeWidth={3} />
        </div>
        <div className="h2" style={{ marginBottom: 8 }}>You're in.</div>
        <div className="muted" style={{ marginBottom: 24 }}>
          Welcome to The Gym Success Plan. Let's get your profile set up.
        </div>
        <button className="btn btn-gold btn-block btn-lg" onClick={() => navigate(profile?.onboarded ? '/dashboard' : '/onboarding')}>
          {profile?.onboarded ? 'Open dashboard' : 'Continue to setup'}
        </button>
      </div>
    </div>
  );
}
