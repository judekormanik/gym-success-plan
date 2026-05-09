import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, X, Plus, Minus } from 'lucide-react';

// Floating rest timer. Shown at the bottom of the workout screen, above the
// finish session button. When the parent flags `triggerKey` (any new value),
// the timer auto-starts a fresh countdown of `defaultSeconds` (or whatever
// the user last tweaked it to).
export default function RestTimer({ defaultSeconds = 60, triggerKey, onComplete }) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const audioRef = useRef(null);
  const lastTrigger = useRef(triggerKey);

  // Auto-start when parent fires triggerKey
  useEffect(() => {
    if (triggerKey == null) return;
    if (triggerKey === lastTrigger.current) return;
    lastTrigger.current = triggerKey;
    setRemaining(seconds);
    setRunning(true);
  }, [triggerKey]);

  // Tick
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          setRunning(false);
          beep();
          onComplete?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
      // Vibrate on phones
      navigator.vibrate?.([100, 60, 100]);
    } catch {}
  };

  const isVisible = running || remaining > 0 || true;
  if (!isVisible) return null;

  const pct = seconds > 0 ? Math.max(0, Math.min(100, (remaining / seconds) * 100)) : 0;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');

  const adjust = (delta) => {
    setSeconds((s) => Math.max(15, Math.min(600, s + delta)));
    if (running) setRemaining((r) => Math.max(0, r + delta));
  };

  const start = () => {
    setRemaining(seconds);
    setRunning(true);
  };
  const stop = () => { setRunning(false); setRemaining(0); };

  return (
    <div style={{
      position: 'sticky',
      bottom: 'calc(8px + env(safe-area-inset-bottom))',
      marginTop: 12, marginLeft: 'auto', marginRight: 'auto',
      maxWidth: 720,
      background: 'var(--surface)',
      border: '1px solid ' + (running ? 'rgba(212,175,55,0.4)' : 'var(--border-strong)'),
      borderRadius: 14,
      padding: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
      zIndex: 25,
    }}>
      {/* Progress ring + countdown */}
      <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
        <svg width={56} height={56} viewBox="0 0 56 56">
          <circle cx={28} cy={28} r={24} stroke="rgba(255,255,255,0.08)" strokeWidth={3} fill="none" />
          <circle
            cx={28} cy={28} r={24}
            stroke="var(--gold)"
            strokeWidth={3}
            fill="none"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={(1 - pct / 100) * 2 * Math.PI * 24}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
            style={{ transition: 'stroke-dashoffset 800ms linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', placeItems: 'center',
          fontWeight: 700, fontSize: 13, fontVariantNumeric: 'tabular-nums',
          color: running ? 'var(--gold)' : 'var(--text)',
        }}>
          {running || remaining > 0 ? `${mm}:${ss}` : '⏱'}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 4 }}>
          <span className="eyebrow">Rest timer</span>
          {running && <span className="pill gold" style={{ padding: '2px 8px', fontSize: 10 }}>Running</span>}
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
          Set duration: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </div>
      </div>

      <div className="row gap-1" style={{ flexShrink: 0 }}>
        <button onClick={() => adjust(-15)} className="icon-btn" style={{ width: 36, height: 36 }} aria-label="-15s">
          <Minus size={14} />
        </button>
        <button onClick={() => adjust(15)} className="icon-btn" style={{ width: 36, height: 36 }} aria-label="+15s">
          <Plus size={14} />
        </button>
        {running ? (
          <button onClick={stop} className="icon-btn" style={{ width: 38, height: 38, color: 'var(--gold)' }} aria-label="Stop">
            <X size={16} />
          </button>
        ) : (
          <button onClick={start} className="icon-btn" style={{ width: 38, height: 38, color: 'var(--gold)' }} aria-label="Start">
            <Play size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
