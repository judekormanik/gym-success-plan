import { useEffect, useState } from 'react';
import useStore from '../store/useStore.js';
import { verifySubscription } from '../utils/stripe.js';

export default function useSubscription() {
  const user = useStore((s) => s.user);
  const profile = useStore((s) => s.profile);
  const [status, setStatus] = useState({ status: profile?.subscription_status || 'none', expires: profile?.subscription_expires });

  useEffect(() => {
    let cancelled = false;
    if (!user?.email) return;
    verifySubscription(user.email).then((res) => {
      if (cancelled) return;
      setStatus(res);
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  const isActive =
    status.status === 'active' ||
    profile?.subscription_status === 'active' ||
    (profile?.subscription_expires && new Date(profile.subscription_expires) > new Date());

  return { status, isActive };
}
