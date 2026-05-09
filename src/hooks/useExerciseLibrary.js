import { useEffect, useState } from 'react';
import { loadFullLibrary, getFullLibrary, EXERCISES as CURATED } from '../utils/exerciseLibrary.js';

// Loads the 873-exercise catalog on first call and caches it for the lifetime
// of the page. Returns { ready, exercises, curated } where `exercises` is the
// merged list (curated first, then deduped by aliased id).
export default function useExerciseLibrary() {
  const [ready, setReady] = useState(!!getFullLibrary());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadFullLibrary().then(() => {
      if (cancelled) return;
      setReady(true);
      setVersion((v) => v + 1);
    });
    return () => { cancelled = true; };
  }, []);

  // Build merged list. Curated entries take precedence over their full-DB
  // counterparts (matched by alias derived from the curated image URL).
  const full = getFullLibrary() || [];
  const aliasOf = (c) => {
    if (!c.image) return null;
    const m = c.image.match(/exercises\/([^/]+)\//);
    return m ? m[1] : null;
  };
  const curatedAliases = new Set(CURATED.map(aliasOf).filter(Boolean));
  const fullDeduped = full.filter((e) => !curatedAliases.has(e.id));
  // Tag curated kebab-case entries so the Library "Featured" section can find
  // them via `e.curated`. The full-DB entries are already tagged at build
  // time, but they're deduped out in favor of the curated ones.
  const curatedWithFlag = CURATED.map((e) => ({ ...e, curated: true }));
  const exercises = [...curatedWithFlag, ...fullDeduped];

  return { ready, exercises, curated: CURATED, _v: version };
}
