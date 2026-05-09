import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Smartphone, ExternalLink, Save, Lock, Trash2, AlertTriangle, Settings as SettingsIcon, Ruler,
} from 'lucide-react';
import useStore from '../store/useStore.js';
import useSubscription from '../hooks/useSubscription.js';
import usePWA from '../hooks/usePWA.js';
import { GOALS, EXPERIENCE } from '../utils/constants.js';
import { ACTIVITY_LEVELS } from '../utils/calculations.js';
import { api } from '../lib/api.js';
import {
  formatWeight, formatHeight, kgToLb, cmToIn,
  toMetricWeight, toMetricLength, WEIGHT_UNIT_LABEL, LENGTH_UNIT_LABEL,
} from '../utils/units.js';

export default function ProfilePage() {
  const profile = useStore((s) => s.profile);
  const user = useStore((s) => s.user);
  const saveProfile = useStore((s) => s.saveProfile);
  const signOut = useStore((s) => s.signOut);
  const pushToast = useStore((s) => s.pushToast);
  const { isActive } = useSubscription();
  const { pwaInstalled, standalone } = usePWA();
  const navigate = useNavigate();

  const units = profile?.units || 'metric';

  // Display values are in the active units; convert to metric on save.
  const [form, setForm] = useState({
    name: profile?.name || '',
    goal: profile?.goal || 'maintain',
    experience: profile?.experience || 'intermediate',
    weight: profile?.weight ? (units === 'imperial' ? kgToLb(profile.weight).toFixed(1) : profile.weight) : '',
    height: profile?.height ? (units === 'imperial' ? cmToIn(profile.height).toFixed(1) : profile.height) : '',
    age: profile?.age || '',
    sex: profile?.sex || 'm',
    activity_level: profile?.activity_level || 'moderate',
    water_target_ml: profile?.water_target_ml || 2500,
  });

  const save = async () => {
    const weightKg = form.weight !== '' ? toMetricWeight(form.weight, units) : null;
    const heightCm = form.height !== '' ? toMetricLength(form.height, units) : null;
    await saveProfile({
      name: form.name,
      goal: form.goal,
      experience: form.experience,
      weight: weightKg != null ? Number(weightKg.toFixed(1)) : null,
      height: heightCm != null ? Number(heightCm.toFixed(1)) : null,
      age: form.age ? Number(form.age) : null,
      sex: form.sex,
      activity_level: form.activity_level,
      water_target_ml: Number(form.water_target_ml) || 2500,
    });
    pushToast('Profile saved', 'success');
  };

  const switchUnits = async (next) => {
    if (next === units) return;
    await saveProfile({ units: next });
    // Re-derive form display values in the new unit
    setForm((f) => ({
      ...f,
      weight: profile?.weight ? (next === 'imperial' ? kgToLb(profile.weight).toFixed(1) : profile.weight) : '',
      height: profile?.height ? (next === 'imperial' ? cmToIn(profile.height).toFixed(1) : profile.height) : '',
    }));
    pushToast(`Switched to ${next === 'imperial' ? 'imperial (lb / in)' : 'metric (kg / cm)'}`, 'success');
  };

  const logout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="fade-in">
      <div className="row-between mb-6">
        <div>
          <div className="eyebrow">Profile</div>
          <h1 className="h2" style={{ marginTop: 6 }}>{profile?.name || 'Member'}</h1>
        </div>
      </div>

      {/* Units segmented control — top-level for visibility */}
      <div className="card mb-4" style={{ padding: 16 }}>
        <div className="row-between">
          <div>
            <div className="eyebrow">Units</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Affects weight, length and water displays</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            {[
              { id: 'metric', label: 'kg / cm' },
              { id: 'imperial', label: 'lb / in' },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => switchUnits(u.id)}
                className="pill"
                style={{
                  cursor: 'pointer', padding: '6px 14px', fontSize: 12,
                  background: units === u.id ? 'var(--gold)' : 'var(--surface-2)',
                  color: units === u.id ? '#0a0a0a' : 'var(--text-dim)',
                  borderColor: units === u.id ? 'var(--gold)' : 'var(--border)',
                  fontWeight: units === u.id ? 600 : 500,
                }}
              >{u.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card-row cols-2 mb-6">
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow mb-4">Edit profile</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Weight ({WEIGHT_UNIT_LABEL(units)})</label>
                <input className="input" type="number" inputMode="decimal" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div>
                <label className="label">Height ({LENGTH_UNIT_LABEL(units)})</label>
                <input className="input" type="number" inputMode="decimal" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
              </div>
              <div>
                <label className="label">Age</label>
                <input className="input" type="number" inputMode="numeric" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </div>
              <div>
                <label className="label">Sex</label>
                <select className="select" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                  <option value="o">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Goal</label>
              <select className="select" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                {GOALS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Activity level</label>
              <select className="select" value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })}>
                {ACTIVITY_LEVELS.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.desc}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Experience</label>
              <select className="select" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
                {EXPERIENCE.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Water target (ml)</label>
              <input className="input" type="number" inputMode="numeric" min={500} max={6000} step={250}
                value={form.water_target_ml} onChange={(e) => setForm({ ...form, water_target_ml: e.target.value })} />
            </div>
            <button className="btn btn-gold mt-2" onClick={save}><Save size={14} /> Save</button>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow mb-4">Account</div>
          <Item label="Email" value={user?.email || '—'} />
          <Item label="Plan" value={isActive ? 'Annual · Active' : 'No active plan'} valueColor={isActive ? 'var(--gold)' : 'var(--text-mute)'} />
          {profile?.subscription_expires && (
            <Item label="Renews / expires" value={new Date(profile.subscription_expires).toLocaleDateString()} />
          )}
          <Item label="Calorie target" value={profile?.calorie_target ? `${profile.calorie_target} kcal` : '—'} />
          <Item label="BMR" value={profile?.bmr ? `${profile.bmr} kcal` : '—'} />
          <Item label="Body weight" value={profile?.weight ? formatWeight(profile.weight, units) : '—'} />
          <Item label="Height" value={profile?.height ? formatHeight(profile.height, units) : '—'} />
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="https://billing.stripe.com/p/login" target="_blank" rel="noreferrer" className="btn btn-ghost">
              <ExternalLink size={14} /> Manage billing
            </a>
            <button className="btn btn-quiet" onClick={logout}><LogOut size={14} /> Sign out</button>
          </div>
        </div>
      </div>

      <Settings />

      <div className="card mt-6" style={{ padding: 20 }}>
        <div className="row-between">
          <div>
            <div className="eyebrow mb-2">App</div>
            <div className="row gap-2">
              <Smartphone size={14} style={{ color: pwaInstalled || standalone ? 'var(--gold)' : 'var(--text-mute)' }} />
              <span style={{ fontSize: 13 }}>{pwaInstalled || standalone ? 'Installed as App' : 'Browser mode'}</span>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>v1.1.0</div>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const pushToast = useStore((s) => s.pushToast);
  const signOut = useStore((s) => s.signOut);
  const navigate = useNavigate();
  const [pwOpen, setPwOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="row gap-2 mb-4">
        <SettingsIcon size={14} style={{ color: 'var(--gold)' }} />
        <div className="eyebrow">Security & data</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-quiet" onClick={() => setPwOpen(true)}>
          <Lock size={14} /> Change password
        </button>
        <button className="btn btn-ghost" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => setDelOpen(true)}>
          <Trash2 size={14} /> Delete account
        </button>
      </div>

      {pwOpen && (
        <ChangePasswordModal onClose={() => setPwOpen(false)} onSuccess={() => {
          pushToast('Password changed', 'success');
          setPwOpen(false);
        }} />
      )}
      {delOpen && (
        <DeleteAccountModal
          onClose={() => setDelOpen(false)}
          onSuccess={async () => {
            pushToast('Account deleted', 'success');
            await signOut();
            navigate('/');
          }}
        />
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose, onSuccess }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (next.length < 6) { setError('New password must be at least 6 characters'); return; }
    setBusy(true);
    try {
      await api.changePassword(current, next);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Could not change password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="Change password" onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label className="label">Current password</label>
          <input className="input" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div>
          <label className="label">New password</label>
          <input className="input" type="password" autoComplete="new-password" minLength={6} value={next} onChange={(e) => setNext(e.target.value)} required />
        </div>
        {error && <ErrorBlock text={error} />}
        <button type="submit" disabled={busy} className="btn btn-gold btn-block btn-lg" style={{ marginTop: 6 }}>
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </ModalShell>
  );
}

function DeleteAccountModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (confirm !== 'DELETE') { setError('Type DELETE to confirm'); return; }
    setBusy(true);
    try {
      await api.deleteAccount(password);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="Delete account" onClose={onClose}>
      <div className="row gap-2 mb-4" style={{
        padding: '10px 12px', borderRadius: 10,
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#fca5a5', fontSize: 13,
      }}>
        <AlertTriangle size={16} />
        <span>This is permanent. Workouts, sets, PRs, photos, and macros are all deleted.</span>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="label">Type DELETE to confirm</label>
          <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" required />
        </div>
        {error && <ErrorBlock text={error} />}
        <button type="submit" disabled={busy} className="btn btn-block btn-lg"
          style={{ marginTop: 6, background: 'var(--danger)', color: '#fff' }}>
          {busy ? 'Deleting…' : 'Permanently delete account'}
        </button>
      </form>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card slide-up" style={{
        width: '100%', maxWidth: 380, padding: 20,
      }}>
        <div className="row-between mb-4">
          <div className="h3">{title}</div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorBlock({ text }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10,
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
      color: '#fca5a5', fontSize: 13,
    }}>{text}</div>
  );
}

function Item({ label, value, valueColor }) {
  return (
    <div className="row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
      <span className="muted">{label}</span>
      <span style={{ fontWeight: 500, color: valueColor || 'var(--text)' }}>{value}</span>
    </div>
  );
}
