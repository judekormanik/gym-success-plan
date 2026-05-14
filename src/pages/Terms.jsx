import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
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
        <h1 className="h2" style={{ marginTop: 8, marginBottom: 8 }}>Terms of Service</h1>
        <div className="muted" style={{ fontSize: 13, marginBottom: 32 }}>
          Last updated: {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        <Section title="The agreement">
          <p>
            By creating an account on The Gym Success Plan you agree to these terms. If you don't agree, don't use
            the app.
          </p>
        </Section>

        <Section title="Subscription and payment">
          <p>
            Access is $19.99 USD per year. Payment is processed by Stripe. Your subscription gives you access to all
            current features. New features may be added at any time.
          </p>
          <p>
            You can cancel any time from the Profile page (Manage billing). Cancellation stops future charges; access
            continues until the end of the current billing period.
          </p>
          <p>
            We do not offer pro-rated refunds for unused time. If you believe a charge was made in error, email us at
            <a href="mailto:hello@gymsuccessplan.app"> hello@gymsuccessplan.app</a> within 30 days.
          </p>
        </Section>

        <Section title="Not medical advice">
          <p>
            <b>The Gym Success Plan is a tracking app, not a substitute for medical advice.</b> Workouts and calorie
            targets are general suggestions, not prescriptions. Consult a licensed professional before starting any
            exercise or nutrition program — especially if you have a medical condition, are pregnant, or are
            recovering from injury.
          </p>
          <p>
            You assume all risk associated with following any workout or nutrition guidance in the app. We are not
            responsible for injuries.
          </p>
        </Section>

        <Section title="Your content">
          <p>
            You own your data and any content you post to the community. By posting to the community you grant other
            members and the app permission to view, react to, and (where indicated, such as shared workouts) clone
            that content within the app.
          </p>
          <p>
            Don't post anything illegal, harassing, or spammy. We may remove content or accounts at our discretion if
            they violate these terms.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Don't reverse-engineer the app, scrape it programmatically, or try to access other users' data. Don't use
            the app to send unsolicited messages or to defraud anyone.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these terms over time. If we make material changes we'll notify you in-app. Continuing to
            use the app after a change means you accept the new terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? <a href="mailto:hello@gymsuccessplan.app">hello@gymsuccessplan.app</a>.
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
