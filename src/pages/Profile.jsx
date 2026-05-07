import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Smartphone, ExternalLink, Save } from 'lucide-react';
import useStore from '../store/useStore.js';
import useSubscription from '../hooks/useSubscription.js';
import usePWA from '../hooks/usePWA.js';
import { GOALS, EXPERIENCE } from '../utils/constants.js';

export default function ProfilePage() {
  const profile = useStore((s) => s.profile);
  const user = useStore((s) => s.user);
  const saveProfile = useStore((s) => s.saveProfile);
  const signOut = useStore((s) => s.signOut);
  const pushToast = useStore((s) => s.pushToast);
  const { isActive, status } = useSubscription();
  const { pwaInstalled, standalone } = usePWA();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: profile?.name || '',
    goal: profile?.goal || 'maintain',
    experience: profile?.experience || 'intermediate',
    weight: profile?.weight || '',
    height: profile?.height || '',
  });

  const save = async () => {
    await saveProfile({ ...form, weight: Number(form.weight), height: Number(form.height) });
    pushToast('Profile saved', 'success');
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

      <div className="card-row cols-2 mb-6">
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow mb-4">Edit profile</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Goal</label>
              <select className="select" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                {GOALS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Experience</label>
              <select className="select" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
                {EXPERIENCE.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Weight (kg)</label>
                <input className="input" type="number" inputMode="decimal" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input className="input" type="number" inputMode="decimal" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
              </div>
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
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="https://billing.stripe.com/p/login" target="_blank" rel="noreferrer" className="btn btn-ghost">
              <ExternalLink size={14} /> Manage billing
            </a>
            <button className="btn btn-quiet" onClick={logout}><LogOut size={14} /> Sign out</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="row-between">
          <div>
            <div className="eyebrow mb-2">App</div>
            <div className="row gap-2">
              <Smartphone size={14} style={{ color: pwaInstalled || standalone ? 'var(--gold)' : 'var(--text-mute)' }} />
              <span style={{ fontSize: 13 }}>{pwaInstalled || standalone ? 'Installed as App' : 'Browser mode'}</span>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>v1.0.0</div>
        </div>
      </div>
    </div>
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
