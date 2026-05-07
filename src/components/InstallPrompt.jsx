import { useLocation } from 'react-router-dom';
import { Smartphone, X } from 'lucide-react';
import usePWA from '../hooks/usePWA.js';
import useStore from '../store/useStore.js';

export default function InstallPrompt() {
  const { canPrompt, ios, standalone, pwaInstalled, triggerInstall } = usePWA();
  const dismissed = useStore((s) => s.installBannerDismissed);
  const dismiss = useStore((s) => s.dismissInstallBanner);
  const pushToast = useStore((s) => s.pushToast);
  const { pathname } = useLocation();

  if (standalone || pwaInstalled || dismissed) return null;
  if (pathname !== '/dashboard') return null;
  if (!canPrompt && !ios) return null;

  const handleInstall = async () => {
    if (ios) {
      pushToast('Tap Share, then Add to Home Screen', 'default');
      return;
    }
    const ok = await triggerInstall();
    if (ok) pushToast('Installed. Opening your app…', 'success');
  };

  return (
    <div className="banner slide-up">
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: 'var(--gold-bg)',
        color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <Smartphone size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>Add to home screen</div>
        <div className="muted" style={{ fontSize: 12 }}>For the best experience.</div>
      </div>
      <button onClick={handleInstall} className="btn btn-gold btn-sm">Install</button>
      <button onClick={dismiss} aria-label="Dismiss" style={{ color: 'var(--text-mute)', padding: 4 }}>
        <X size={16} />
      </button>
    </div>
  );
}
