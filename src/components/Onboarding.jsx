import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Smartphone, ChevronUp, Check } from 'lucide-react';
import useStore from '../store/useStore.js';
import usePWA from '../hooks/usePWA.js';
import { GOALS, EXPERIENCE } from '../utils/constants.js';

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const saveProfile = useStore((s) => s.saveProfile);
  const pushToast = useStore((s) => s.pushToast);
  const { ios, standalone, triggerInstall, pwaInstalled } = usePWA();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile?.name || '');
  const [goal, setGoal] = useState(profile?.goal || '');
  const [weight, setWeight] = useState(profile?.weight || '');
  const [height, setHeight] = useState(profile?.height || '');
  const [experience, setExperience] = useState(profile?.experience || '');

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const finishOnboarding = async () => {
    await saveProfile({
      name, goal, weight: Number(weight), height: Number(height),
      experience, onboarded: true,
    });
    navigate('/dashboard');
  };

  const handleInstall = async () => {
    if (ios) return;
    const ok = await triggerInstall();
    if (ok) {
      pushToast("You're all set, opening your app now", 'success');
      setTimeout(finishOnboarding, 700);
    }
  };

  const skipInstall = () => finishOnboarding();

  if (step === 5 && (standalone || pwaInstalled)) {
    finishOnboarding();
    return null;
  }

  const canAdvance =
    (step === 1 && name.trim()) ||
    (step === 2 && goal) ||
    (step === 3 && weight && height) ||
    (step === 4 && experience) ||
    step === 5;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{ padding: '20px 16px 8px', display: 'flex', justifyContent: 'center', gap: 6 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i + 1 === step ? 28 : 6,
              height: 6,
              borderRadius: 999,
              background: i + 1 <= step ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
              transition: 'all 280ms cubic-bezier(.2,.8,.2,1)',
            }}
          />
        ))}
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px 16px',
        overflow: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 460, paddingBottom: 100 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {step === 1 && (
                <Step title="Welcome" subtitle="Let's set up your plan. What's your name?">
                  <input
                    autoFocus
                    className="input"
                    placeholder="Your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ minHeight: 56, fontSize: 17 }}
                  />
                </Step>
              )}

              {step === 2 && (
                <Step title={`Hi, ${name || 'there'}.`} subtitle="What's your goal right now?">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {GOALS.map((g) => (
                      <ChoiceCard
                        key={g.id}
                        active={goal === g.id}
                        onClick={() => setGoal(g.id)}
                        title={g.label}
                        body={g.desc}
                      />
                    ))}
                  </div>
                </Step>
              )}

              {step === 3 && (
                <Step title="Your stats" subtitle="We'll calibrate your calories from here.">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="label">Weight (kg)</label>
                      <input className="input" type="number" inputMode="decimal" placeholder="80" value={weight} onChange={(e) => setWeight(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Height (cm)</label>
                      <input className="input" type="number" inputMode="decimal" placeholder="180" value={height} onChange={(e) => setHeight(e.target.value)} />
                    </div>
                  </div>
                </Step>
              )}

              {step === 4 && (
                <Step title="Experience" subtitle="So we know how to scale progression.">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {EXPERIENCE.map((e) => (
                      <ChoiceCard
                        key={e.id}
                        active={experience === e.id}
                        onClick={() => setExperience(e.id)}
                        title={e.label}
                        body={e.desc}
                      />
                    ))}
                  </div>
                </Step>
              )}

              {step === 5 && (
                <Step
                  title="Get the full app experience"
                  subtitle="Add The Gym Success Plan to your home screen for instant access, offline tracking, and a native app feel."
                >
                  <div style={{
                    margin: '20px auto',
                    width: 180, height: 240,
                    borderRadius: 28,
                    border: '2px solid rgba(255,255,255,0.1)',
                    background: 'linear-gradient(180deg, #0e0e0e, #141414)',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    position: 'relative',
                  }}>
                    <div className="brand-mark" style={{ width: 56, height: 56, fontSize: 22, borderRadius: 14 }}>G</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Gym Success</div>
                    <div className="pill gold">PWA</div>
                  </div>

                  {ios ? (
                    <div className="card" style={{ padding: 16, marginTop: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>On iPhone</div>
                      <ol style={{ paddingLeft: 18, margin: 0, color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.7 }}>
                        <li>Tap the <b>Share</b> button at the bottom of Safari <ChevronUp size={12} style={{ verticalAlign: 'middle' }} /></li>
                        <li>Scroll down and tap <b>Add to Home Screen</b></li>
                        <li>Tap <b>Add</b> in the top right corner</li>
                      </ol>
                    </div>
                  ) : (
                    <button onClick={handleInstall} className="btn btn-gold btn-lg btn-block">
                      <Smartphone size={16} /> Add to Home Screen
                    </button>
                  )}
                  <button
                    onClick={skipInstall}
                    style={{
                      display: 'block', margin: '14px auto 0',
                      color: 'var(--text-mute)', fontSize: 13, textDecoration: 'underline',
                      padding: 8,
                    }}
                  >
                    Skip for now, I'll use the browser
                  </button>
                </Step>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {step < 5 && (
        <div style={{
          position: 'sticky',
          bottom: 0,
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(180deg, transparent, rgba(10,10,10,0.95) 30%)',
          display: 'flex',
          gap: 10,
          maxWidth: 460,
          width: '100%',
          margin: '0 auto',
        }}>
          {step > 1 && (
            <button className="btn btn-ghost" onClick={back}>Back</button>
          )}
          <button
            disabled={!canAdvance}
            className="btn btn-gold btn-block btn-lg"
            onClick={next}
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function Step({ title, subtitle, children }) {
  return (
    <div>
      <div className="h2" style={{ marginBottom: 8 }}>{title}</div>
      {subtitle && <div className="muted" style={{ marginBottom: 24, fontSize: 15 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function ChoiceCard({ active, onClick, title, body }) {
  return (
    <button
      onClick={onClick}
      className="card hover"
      style={{
        textAlign: 'left',
        padding: 16,
        cursor: 'pointer',
        borderColor: active ? 'rgba(212,175,55,0.6)' : 'var(--border)',
        background: active ? 'linear-gradient(180deg, rgba(212,175,55,0.07), transparent), var(--surface)' : 'var(--surface)',
        minHeight: 64,
      }}
    >
      <div className="row-between">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{body}</div>
        </div>
        {active && <Check size={20} style={{ color: 'var(--gold)', flexShrink: 0 }} />}
      </div>
    </button>
  );
}
