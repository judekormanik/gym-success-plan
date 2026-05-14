import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ScanBarcode, X, Loader2, BadgeCheck, Globe } from 'lucide-react';
import { api } from '../lib/api.js';
import useStore from '../store/useStore.js';
import { searchVerified } from '../utils/verifiedFoods.js';

// Two-tier food search:
//   1. Verified (curated USDA-accurate) — instant, ranked first, shows ✓ badge
//   2. Community (Open Food Facts) — millions of packaged foods, ranked after
// Both tiers feed into the same onPick callback.
export default function FoodSearch({ onPick }) {
  const [q, setQ] = useState('');
  const [offResults, setOffResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const debouncer = useRef();

  // Verified results are instant (in-bundle) — no debounce needed.
  const verified = useMemo(() => searchVerified(q, 12), [q]);

  // Open Food Facts results are debounced.
  useEffect(() => {
    clearTimeout(debouncer.current);
    if (q.trim().length < 2) { setOffResults([]); return; }
    debouncer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const { results: r } = await api.searchFoods(q);
        setOffResults(r || []);
      } catch {
        setOffResults([]);
      } finally {
        setBusy(false);
      }
    }, 280);
    return () => clearTimeout(debouncer.current);
  }, [q]);

  const pickVerified = (f) => {
    onPick({
      food_name: `${f.name} (${f.serving.label})`,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fats: f.fats,
      meal_type: f.meal,
    });
    setQ(''); setOffResults([]);
  };

  const pickOFF = (r, useServing) => {
    const macros = useServing && r.perServing ? r.perServing : r.per100;
    const label = useServing && r.perServing ? r.perServing.servingLabel : '100g';
    onPick({
      food_name: [r.brand, r.name].filter(Boolean).join(' · ') + ` (${label})`,
      calories: Math.round(macros.calories || 0),
      protein: macros.protein || 0,
      carbs: macros.carbs || 0,
      fats: macros.fats || 0,
    });
    setQ(''); setOffResults([]);
  };

  const showResults = q.trim().length >= 2;
  const hasAny = verified.length > 0 || offResults.length > 0;

  return (
    <div>
      <div className="row gap-2" style={{ alignItems: 'stretch' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-mute)', pointerEvents: 'none',
          }} />
          <input
            className="input"
            placeholder="Search foods · verified ✓ first"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 38, paddingRight: q ? 38 : 12 }}
          />
          {q && (
            <button
              onClick={() => { setQ(''); setOffResults([]); }}
              className="icon-btn"
              style={{ position: 'absolute', right: 4, top: 4, width: 36, height: 36 }}
              aria-label="Clear"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          className="btn btn-quiet"
          onClick={() => setScannerOpen(true)}
          title="Scan barcode"
          aria-label="Scan barcode"
          style={{ minWidth: 44, padding: '0 14px' }}
        >
          <ScanBarcode size={16} />
        </button>
      </div>

      {showResults && (
        <div style={{ marginTop: 10 }}>
          {/* Verified tier */}
          {verified.length > 0 && (
            <SectionHeader
              icon={BadgeCheck}
              label="Verified"
              count={verified.length}
              accent="var(--gold)"
              sub="Curated · USDA-accurate"
            />
          )}
          {verified.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {verified.map((f) => <VerifiedRow key={f.id} food={f} onPick={pickVerified} />)}
            </div>
          )}

          {/* Open Food Facts tier */}
          {(offResults.length > 0 || busy) && (
            <SectionHeader
              icon={Globe}
              label="Community database"
              count={offResults.length}
              accent="var(--text-mute)"
              sub="Open Food Facts · packaged products"
              right={busy ? (
                <span className="muted row gap-2" style={{ fontSize: 11 }}>
                  <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> searching…
                </span>
              ) : null}
            />
          )}
          {offResults.length > 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              maxHeight: 320, overflow: 'auto',
            }} className="no-scrollbar">
              {offResults.map((r, i) => (
                <OFFRow key={(r.code || r.name) + i} food={r} onPick={pickOFF} />
              ))}
            </div>
          )}

          {!hasAny && !busy && (
            <div className="muted" style={{ padding: '20px 8px', textAlign: 'center', fontSize: 13 }}>
              No matches. Try a different spelling or use the Quick log grid.
            </div>
          )}
        </div>
      )}

      {scannerOpen && (
        <BarcodeScanner
          onClose={() => setScannerOpen(false)}
          onResult={async (code) => {
            try {
              const { found, result } = await api.lookupBarcode(code);
              if (found && result) {
                useStore.getState().pushToast(`Found: ${result.name}`, 'success');
                pickOFF(result, !!result.perServing);
              } else {
                useStore.getState().pushToast('Product not found', 'error');
              }
            } catch {
              useStore.getState().pushToast('Lookup failed', 'error');
            }
            setScannerOpen(false);
          }}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────
function SectionHeader({ icon: Icon, label, count, sub, accent, right }) {
  return (
    <div className="row-between" style={{ marginBottom: 8, paddingTop: 4 }}>
      <div className="row gap-2">
        <Icon size={12} style={{ color: accent }} />
        <span className="eyebrow" style={{ color: accent }}>{label}</span>
        {count > 0 && <span className="muted mono" style={{ fontSize: 11 }}>· {count}</span>}
        {sub && <span className="muted" style={{ fontSize: 10, marginLeft: 4 }}>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

function VerifiedRow({ food, onPick }) {
  return (
    <button
      onClick={() => onPick(food)}
      className="row gap-3"
      style={{
        padding: '10px 12px',
        background: 'var(--surface-2)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 10,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 160ms, border-color 160ms',
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 99,
        background: 'var(--gold-bg)',
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <BadgeCheck size={14} style={{ color: 'var(--gold)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {food.name}
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
          {food.serving.label} · {food.category}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="mono" style={{ fontWeight: 700, fontSize: 14 }}>{food.calories}</div>
        <div className="muted mono" style={{ fontSize: 10, marginTop: 2 }}>
          {food.protein}P · {food.carbs}C · {food.fats}F
        </div>
      </div>
    </button>
  );
}

function OFFRow({ food, onPick }) {
  const has100 = !!food.per100?.calories;
  const hasServing = !!food.perServing;
  return (
    <div style={{
      display: 'flex', gap: 10, padding: 10,
      background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
        background: '#0e0e0e',
        backgroundImage: food.image ? `url(${food.image})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        border: '1px solid var(--border)',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {food.name}
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {food.brand || 'unbranded'} · {food.per100?.calories || 0} kcal/100g
        </div>
        <div className="row gap-2" style={{ marginTop: 6, flexWrap: 'wrap' }}>
          {hasServing && (
            <button
              onClick={() => onPick(food, true)}
              className="pill"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold)', borderColor: 'rgba(212,175,55,0.3)', cursor: 'pointer' }}
            >
              + Serving ({food.perServing.calories} kcal)
            </button>
          )}
          {has100 && (
            <button
              onClick={() => onPick(food, false)}
              className="pill"
              style={{ cursor: 'pointer' }}
            >
              + 100g ({food.per100.calories} kcal)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BarcodeScanner({ onClose, onResult }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Initialising…');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    let stream = null;
    let raf = null;
    let detector = null;
    let cancelled = false;

    (async () => {
      if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
        setSupported(false);
        setStatus('Barcode scanning not supported on this browser. Try Chrome on Android.');
        return;
      }
      try {
        detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
        });
      } catch {
        setSupported(false);
        setStatus('Could not initialise the scanner.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStatus('Point at a barcode…');

        const tick = async () => {
          if (cancelled) return;
          try {
            const codes = await detector.detect(video);
            if (codes && codes.length) {
              const raw = String(codes[0].rawValue || '').replace(/\D/g, '');
              if (raw) {
                onResult(raw);
                return;
              }
            }
          } catch {}
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        setStatus('Camera access denied.');
      }
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
      display: 'grid', placeItems: 'center', zIndex: 200, padding: 16,
    }}>
      <div className="card slide-up" style={{ width: '100%', maxWidth: 420, padding: 16 }}>
        <div className="row-between mb-4">
          <div>
            <div className="eyebrow">Barcode scanner</div>
            <div className="h3" style={{ marginTop: 2 }}>Find your food</div>
          </div>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>
        <div style={{
          width: '100%', aspectRatio: '4/3',
          background: '#000', borderRadius: 12, overflow: 'hidden',
          position: 'relative',
        }}>
          {supported && (
            <video
              ref={videoRef}
              playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {supported && (
            <div style={{
              position: 'absolute', inset: '20% 10%',
              border: '2px solid rgba(212,175,55,0.7)',
              borderRadius: 12, pointerEvents: 'none',
              boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
            }} />
          )}
        </div>
        <div className="muted" style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
          {status}
        </div>
      </div>
    </div>
  );
}
