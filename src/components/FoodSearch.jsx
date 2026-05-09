import { useEffect, useRef, useState } from 'react';
import { Search, ScanBarcode, X, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';
import useStore from '../store/useStore.js';

// Open Food Facts search with debounced typing + optional barcode scanner.
// Calls onPick(food) where food matches the row schema in nutrition_log.
export default function FoodSearch({ onPick }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const debouncer = useRef();

  useEffect(() => {
    clearTimeout(debouncer.current);
    if (q.trim().length < 2) { setResults([]); return; }
    debouncer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const { results: r } = await api.searchFoods(q);
        setResults(r || []);
      } catch {
        setResults([]);
      } finally {
        setBusy(false);
      }
    }, 280);
    return () => clearTimeout(debouncer.current);
  }, [q]);

  const pickResult = (r, useServing) => {
    const macros = useServing && r.perServing ? r.perServing : r.per100;
    const label = useServing && r.perServing
      ? r.perServing.servingLabel
      : '100g';
    onPick({
      food_name: [r.brand, r.name].filter(Boolean).join(' · ') + ` (${label})`,
      calories: Math.round(macros.calories || 0),
      protein: macros.protein || 0,
      carbs: macros.carbs || 0,
      fats: macros.fats || 0,
    });
    setQ(''); setResults([]);
  };

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
            placeholder="Search 2M+ foods (Open Food Facts)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 38, paddingRight: q ? 38 : 12 }}
          />
          {q && (
            <button
              onClick={() => { setQ(''); setResults([]); }}
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

      {busy && (
        <div className="muted row gap-2" style={{ marginTop: 10, fontSize: 12 }}>
          <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Searching…
        </div>
      )}

      {results.length > 0 && (
        <div style={{
          marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6,
          maxHeight: 360, overflow: 'auto',
        }} className="no-scrollbar">
          {results.map((r, i) => (
            <FoodResult key={(r.code || r.name) + i} food={r} onPick={pickResult} />
          ))}
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
                pickResult(result, !!result.perServing);
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

function FoodResult({ food, onPick }) {
  const has100 = !!food.per100?.calories;
  const hasServing = !!food.perServing;
  return (
    <div style={{
      display: 'flex', gap: 10, padding: 10,
      background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 8, flexShrink: 0,
        background: '#0e0e0e',
        backgroundImage: food.image ? `url(${food.image})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        border: '1px solid var(--border)',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {food.name}
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
          {food.brand || '—'} · {food.per100?.calories || 0} kcal/100g
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
      // Feature detection — BarcodeDetector is available natively on Chrome
      // for Android, recent Chrome desktop, and some Edge builds.
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
          {/* Targeting overlay */}
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
