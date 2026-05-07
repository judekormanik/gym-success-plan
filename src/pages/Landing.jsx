import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell, LineChart, Users, ShieldCheck, Smartphone, Check, ArrowRight, Star, ChevronDown,
} from 'lucide-react';
import useStore from '../store/useStore.js';
import { APP_NAME, APP_TAGLINE, PRICE_USD, MONTHLY_EQ } from '../utils/constants.js';

export default function Landing() {
  return (
    <div>
      <Header />
      <Hero />
      <Logos />
      <Features />
      <PWAStrip />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,10,0.7)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark" style={{ width: 28, height: 28, fontSize: 13 }}>G</div>
          <div style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>The Gym Success Plan</div>
        </Link>
        <nav className="row gap-4" style={{ fontSize: 14, color: 'var(--text-dim)' }}>
          <a href="#features" className="hide-sm">Features</a>
          <a href="#pricing" className="hide-sm">Pricing</a>
          <a href="#faq" className="hide-sm">FAQ</a>
        </nav>
        <div className="row gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>Login</button>
          <Link to="/checkout" className="btn btn-gold btn-sm">Get Started</Link>
        </div>
      </div>
      {open && <LoginModal onClose={() => setOpen(false)} />}
    </header>
  );
}

function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const signIn = useStore((s) => s.signInWithEmail);
  const signUp = useStore((s) => s.signUpWithEmail);
  const magic = useStore((s) => s.signInWithMagicLink);
  const pushToast = useStore((s) => s.pushToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const res = await fn(email, password);
    setBusy(false);
    if (res.ok) {
      pushToast(mode === 'signin' ? 'Welcome back' : 'Account created', 'success');
      onClose();
      navigate('/onboarding');
    } else {
      pushToast(res.error || 'Something went wrong', 'error');
    }
  };

  const sendMagic = async () => {
    if (!email) return;
    setBusy(true);
    const res = await magic(email);
    setBusy(false);
    pushToast(res.ok ? 'Magic link sent — check your email' : 'Could not send link', res.ok ? 'success' : 'error');
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card slide-up" style={{ width: '100%', maxWidth: 380, padding: 28 }}>
        <div className="h2" style={{ marginBottom: 6 }}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</div>
        <div className="muted" style={{ marginBottom: 20, fontSize: 13 }}>
          {mode === 'signin' ? 'Sign in to continue your plan.' : 'Get instant access to the full system.'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <button disabled={busy} className="btn btn-gold btn-block" style={{ marginTop: 6 }}>
            {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', color: 'var(--text-mute)', fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />or<div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <button onClick={sendMagic} disabled={busy} className="btn btn-ghost btn-block">Email me a magic link</button>
        <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ marginTop: 14, width: '100%', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
          {mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <div className="pill gold" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--gold)' }} /> The system that actually works
        </div>
        <h1 className="h1">{APP_NAME}.</h1>
        <p className="muted" style={{ fontSize: 18, maxWidth: 620, margin: '20px auto 0' }}>
          A complete fitness operating system. Plan, train, track, and progress — every workout, every meal, every PR — in one premium app.
        </p>
        <div className="row gap-3" style={{ justifyContent: 'center', marginTop: 28 }}>
          <Link to="/checkout" className="btn btn-gold btn-lg">Get Started · ${PRICE_USD}/yr</Link>
          <a href="#features" className="btn btn-ghost btn-lg">See how it works</a>
        </div>
        <div className="muted" style={{ marginTop: 14, fontSize: 12 }}>
          One plan · Cancel anytime · Works offline
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
        style={{ marginTop: 64 }}
      >
        <PreviewMock />
      </motion.div>
    </section>
  );
}

function PreviewMock() {
  return (
    <div style={{
      maxWidth: 920, margin: '0 auto', borderRadius: 22,
      border: '1px solid var(--border-strong)',
      background: 'linear-gradient(180deg, rgba(212,175,55,0.08), transparent 30%), #0d0d0d',
      padding: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    }}>
      <div style={{
        borderRadius: 14, background: '#0a0a0a', padding: 24,
        border: '1px solid var(--border)',
        display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        <MockTile label="Today's session" big="Day 2 — Chest & Shoulders" sub="6 exercises · 22 sets" />
        <MockTile label="Streak" big="14 days" sub="Next milestone: 30" gold />
        <MockTile label="Bench press" big="92.5 kg × 5" sub="↑ from last week" />
        <MockTile label="Calories today" big="2,140 / 2,400" sub="Protein 168g" />
      </div>
    </div>
  );
}
function MockTile({ label, big, sub, gold }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: gold ? 'var(--gold)' : 'var(--text)' }}>{big}</div>
      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Logos() {
  const items = ['Built for serious lifters', 'Featured in fitness press', 'Trusted by 10,000+ members'];
  return (
    <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-around', gap: 16, flexWrap: 'wrap' }}>
        {items.map((i) => <div key={i} className="muted" style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{i}</div>)}
      </div>
    </div>
  );
}

function Features() {
  const features = [
    { icon: Dumbbell, t: 'Track every set', b: 'A 4-day program built into the app. Log weight, reps, drop sets — see PRs the moment they happen.' },
    { icon: LineChart, t: 'See your progress', b: '1-rep-max, body weight, weekly volume — every chart that actually moves the needle.' },
    { icon: Users, t: 'Real community', b: 'No influencer noise. Just members shipping work. Weekly challenges and a live leaderboard.' },
  ];
  return (
    <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="text-center" style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Features</div>
        <h2 className="h2">Everything you need. Nothing you don't.</h2>
      </div>
      <div className="card-row cols-3">
        {features.map((f) => (
          <div key={f.t} className="card hover" style={{ padding: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--gold-bg)', color: 'var(--gold)',
              display: 'grid', placeItems: 'center', marginBottom: 14,
            }}><f.icon size={18} /></div>
            <div className="h3" style={{ marginBottom: 6 }}>{f.t}</div>
            <div className="muted" style={{ fontSize: 14 }}>{f.b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PWAStrip() {
  return (
    <section style={{ padding: '40px 24px' }}>
      <div className="card" style={{
        maxWidth: 1100, margin: '0 auto', padding: 28,
        background: 'linear-gradient(180deg, rgba(212,175,55,0.08), transparent), var(--surface)',
        border: '1px solid rgba(212,175,55,0.25)',
        display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
      }}>
        <Smartphone size={28} style={{ color: 'var(--gold)' }} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="h3">Works as a native app on any device</div>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>Install with one tap. Full offline support. No App Store gatekeepers.</div>
        </div>
        <div className="pill gold">PWA Ready</div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" style={{ padding: '80px 24px' }}>
      <div className="text-center" style={{ marginBottom: 40 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Pricing</div>
        <h2 className="h2">One plan. One price. No upsells.</h2>
      </div>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <motion.div whileHover={{ y: -2 }}
          className="card" style={{
            padding: 32, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.4)',
            background: 'linear-gradient(180deg, rgba(212,175,55,0.08), transparent), var(--surface)',
          }}
        >
          <div className="eyebrow gold" style={{ color: 'var(--gold)', marginBottom: 8 }}>Annual Plan</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em' }}>${PRICE_USD}</div>
            <div className="muted">/ year</div>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>That's just ${MONTHLY_EQ} a month.</div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Full 4-day workout system',
              'Unlimited workout & set tracking',
              'Progress charts & 1RM analytics',
              'Nutrition + macros',
              'Community & weekly challenges',
              'Installable PWA · works offline',
            ].map((b) => (
              <li key={b} className="row gap-2" style={{ fontSize: 14 }}>
                <Check size={16} style={{ color: 'var(--gold)' }} />{b}
              </li>
            ))}
          </ul>

          <Link to="/checkout" className="btn btn-gold btn-lg btn-block">Get Started <ArrowRight size={16} /></Link>
          <div className="row gap-2 muted" style={{ justifyContent: 'center', marginTop: 14, fontSize: 12 }}>
            <ShieldCheck size={14} /> Secure payment via Stripe
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: 'Marcus T.', role: 'Down 6kg', quote: 'I stopped guessing. My lifts went up while my waist went down.' },
    { name: 'Sara K.', role: '+11kg bench', quote: 'The progression model is the reason I broke a 2-year plateau.' },
    { name: 'Devon R.', role: '90-day streak', quote: 'The streak system kept me showing up when motivation didn\'t.' },
  ];
  return (
    <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="text-center" style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Members</div>
        <h2 className="h2">Real results from real lifters.</h2>
      </div>
      <div className="card-row cols-3">
        {items.map((t) => (
          <div key={t.name} className="card" style={{ padding: 24 }}>
            <div className="row gap-2" style={{ marginBottom: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="none" />)}
            </div>
            <div style={{ fontSize: 15, marginBottom: 14 }}>"{t.quote}"</div>
            <div className="row gap-2">
              <div style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
                {t.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                <div className="muted" style={{ fontSize: 11 }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: 'How does billing work?', a: 'A single annual charge of $19.99. You can cancel any time inside your profile via the Stripe customer portal.' },
    { q: 'Is there a free trial?', a: 'No. The pricing is intentionally low — the first session pays for the year.' },
    { q: 'Can I cancel?', a: 'Yes. One click in your profile. Access continues until your year ends, then it lapses with no further charges.' },
    { q: 'Does it work offline?', a: 'Yes — install the PWA and you can train without a signal. Data syncs the moment you\'re back online.' },
    { q: 'Do I keep my data if I cancel?', a: 'Yes. You can export everything to CSV in the Progress section any time.' },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" style={{ padding: '60px 24px 100px', maxWidth: 760, margin: '0 auto' }}>
      <div className="text-center" style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>FAQ</div>
        <h2 className="h2">Common questions.</h2>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {items.map((it, i) => (
          <div key={it.q} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <button onClick={() => setOpen(open === i ? -1 : i)}
              style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{it.q}</span>
              <ChevronDown size={16} style={{ color: 'var(--text-mute)', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
            </button>
            {open === i && (
              <div className="muted" style={{ padding: '0 20px 20px', fontSize: 14 }}>{it.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div className="row gap-2">
          <div className="brand-mark" style={{ width: 26, height: 26, fontSize: 12 }}>G</div>
          <div className="muted" style={{ fontSize: 13 }}>© {new Date().getFullYear()} The Gym Success Plan</div>
        </div>
        <div className="row gap-4 muted" style={{ fontSize: 13 }}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="mailto:hello@gymsuccessplan.app">Support</a>
        </div>
      </div>
    </footer>
  );
}
