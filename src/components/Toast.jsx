import useStore from '../store/useStore.js';
import { Check, AlertCircle } from 'lucide-react';

export default function Toast() {
  const toasts = useStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? <Check size={14} /> : t.type === 'error' ? <AlertCircle size={14} /> : null}
          {t.text}
        </div>
      ))}
    </div>
  );
}
