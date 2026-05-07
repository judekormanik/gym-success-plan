import { useEffect, useState } from 'react';
import useStore from '../store/useStore.js';

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);

const isIOS = () =>
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export default function usePWA() {
  const setEvent = useStore((s) => s.setInstallPromptEvent);
  const installEvent = useStore((s) => s.installPromptEvent);
  const markInstalled = useStore((s) => s.markInstalled);
  const pwaInstalled = useStore((s) => s.pwaInstalled);

  const [standalone, setStandalone] = useState(isStandalone());

  useEffect(() => {
    if (isStandalone()) {
      setStandalone(true);
      markInstalled();
    }
    const onPrompt = (e) => {
      e.preventDefault();
      setEvent(e);
    };
    const onInstalled = () => markInstalled();
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [markInstalled, setEvent]);

  const triggerInstall = async () => {
    if (installEvent) {
      installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') {
        markInstalled();
        return true;
      }
      return false;
    }
    return false;
  };

  return {
    standalone,
    ios: isIOS(),
    canPrompt: !!installEvent && !pwaInstalled && !standalone,
    pwaInstalled: pwaInstalled || standalone,
    triggerInstall,
  };
}
