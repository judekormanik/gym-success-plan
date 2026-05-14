import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div style={{
      minHeight: '100dvh',
      padding: '24px 20px',
      paddingTop: 'calc(24px + env(safe-area-inset-top))',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link to="/" className="muted row gap-2" style={{ fontSize: 13, marginBottom: 16 }}>
          <ChevronLeft size={14} /> Back home
        </Link>
        <div className="eyebrow">Legal</div>
        <h1 className="h2" style={{ marginTop: 8, marginBottom: 8 }}>Privacy Policy</h1>
        <div className="muted" style={{ fontSize: 13, marginBottom: 32 }}>
          Last updated: {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        <Section title="What we collect">
          <p>
            When you create an account, we store your email and a password hash. When you use the app, we store the
            data you enter — workouts, sets, body weight, measurements, nutrition logs, custom workouts, photos,
            community posts, favorites, and water intake. All of this is your data; we use it only to make the app
            work.
          </p>
          <p>
            We do not sell your data. We do not share it with third parties for advertising. We do not run third-party
            analytics or tracking pixels on this site.
          </p>
        </Section>

        <Section title="Where it lives">
          <p>
            Your data is stored in Cloudflare D1 (Cloudflare's managed SQLite database) and the application runs on
            Cloudflare Pages. Cloudflare may process your data on our behalf as a sub-processor.
          </p>
          <p>
            Payments are processed by Stripe. We never see your card details — Stripe sends us a customer ID and a
            subscription status only.
          </p>
        </Section>

        <Section title="Cookies and sessions">
          <p>
            We set a single HttpOnly, Secure session cookie (<code>gsp_session</code>) so you stay signed in. It expires
            after 30 days of inactivity. We do not use cookies for advertising or third-party tracking.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can export everything we've stored about you at any time from the <Link to="/profile">Profile</Link>
            page — workouts, sets, nutrition, measurements, body weight, photos, water and personal records. The
            export is a plain CSV file.
          </p>
          <p>
            You can permanently delete your account at any time, also from Profile. Deletion is immediate and cascades
            to all related rows; we retain no backup beyond Cloudflare's standard infrastructure-level redundancy.
          </p>
        </Section>

        <Section title="Children">
          <p>
            The Gym Success Plan is not directed to anyone under 13 (under 16 in the EU). Don't sign up if you're
            under those ages.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about privacy? Email <a href="mailto:hello@gymsuccessplan.app">hello@gymsuccessplan.app</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 className="h3" style={{ marginBottom: 10 }}>{title}</h2>
      <div className="muted" style={{ fontSize: 15, lineHeight: 1.65 }}>
        {children}
      </div>
    </section>
  );
}
