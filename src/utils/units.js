// Unit conversion + display helpers. Internal storage is always metric
// (kg, cm, ml). Anything that touches the UI goes through these helpers.

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;
export const ML_PER_FLOZ = 29.5735;

export function kgToLb(kg) { return Number(kg) / KG_PER_LB; }
export function lbToKg(lb) { return Number(lb) * KG_PER_LB; }
export function cmToIn(cm) { return Number(cm) / CM_PER_IN; }
export function inToCm(inches) { return Number(inches) * CM_PER_IN; }
export function mlToFloz(ml) { return Number(ml) / ML_PER_FLOZ; }
export function flozToMl(floz) { return Number(floz) * ML_PER_FLOZ; }

export function formatWeight(kg, units = 'metric', { decimals = 1 } = {}) {
  if (kg == null || kg === '') return '—';
  const n = Number(kg);
  if (!Number.isFinite(n)) return '—';
  if (units === 'imperial') return `${kgToLb(n).toFixed(decimals)} lb`;
  return `${n.toFixed(decimals)} kg`;
}

export function formatHeight(cm, units = 'metric') {
  if (cm == null || cm === '') return '—';
  const n = Number(cm);
  if (!Number.isFinite(n)) return '—';
  if (units === 'imperial') {
    const totalIn = cmToIn(n);
    const ft = Math.floor(totalIn / 12);
    const inches = Math.round(totalIn - ft * 12);
    return `${ft}′${inches}″`;
  }
  return `${Math.round(n)} cm`;
}

export function formatLength(cm, units = 'metric') {
  if (cm == null || cm === '') return '—';
  const n = Number(cm);
  if (!Number.isFinite(n)) return '—';
  if (units === 'imperial') return `${cmToIn(n).toFixed(1)} in`;
  return `${n.toFixed(1)} cm`;
}

export function formatVolume(ml, units = 'metric') {
  if (ml == null) return '—';
  const n = Number(ml);
  if (!Number.isFinite(n)) return '—';
  if (units === 'imperial') return `${mlToFloz(n).toFixed(0)} fl oz`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} L`;
  return `${Math.round(n)} ml`;
}

// User enters a value in the active unit; we return metric for storage.
export function toMetricWeight(value, units) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return units === 'imperial' ? lbToKg(n) : n;
}

export function toMetricLength(value, units) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return units === 'imperial' ? inToCm(n) : n;
}

export const WEIGHT_UNIT_LABEL = (u) => (u === 'imperial' ? 'lb' : 'kg');
export const LENGTH_UNIT_LABEL = (u) => (u === 'imperial' ? 'in' : 'cm');
export const HEIGHT_UNIT_LABEL = (u) => (u === 'imperial' ? 'ft / in' : 'cm');
