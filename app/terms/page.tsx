export const dynamic = 'force-dynamic';
import Link from 'next/link';

const LINE = 'rgba(255,255,255,0.10)';
const MUTED = '#9B9B96';
const MUTED2 = '#6E6E69';
const ACCENT = '#C8FF34';

export const metadata = {
  title: 'Terms of Service — Iupiter',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#F4F3EE', marginBottom: 14, letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0B', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
      <nav style={{ borderBottom: `1px solid ${LINE}`, padding: '20px clamp(20px,4vw,64px)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 11, textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#ECEBE6' }}>
          <span style={{ width: 28, height: 28, borderRadius: 7, background: ACCENT, color: '#16210A', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 15 }}>I</span>
          Iupiter
        </Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,4vw,32px)' }}>
        <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED2, marginBottom: 12 }}>
          Last updated: June 22, 2026
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,4vw,44px)', letterSpacing: '-0.03em', color: '#F4F3EE', marginBottom: 36, lineHeight: 1.05 }}>
          Terms of Service
        </h1>

        <Section title="1. Agreement">
          <p>
            These Terms govern your use of Iupiter, an AI receptionist platform operated by{' '}
            <strong style={{ color: '#F4F3EE' }}>[Your Legal Entity Name]</strong> (&quot;Iupiter,&quot; &quot;we,&quot; &quot;us&quot;).
            By creating an account or using the service, you agree to these Terms. If you do not agree, do not
            use Iupiter.
          </p>
        </Section>

        <Section title="2. What Iupiter does">
          <p>
            Iupiter lets you configure an AI agent that responds to customer messages on your behalf via web
            chat widget, WhatsApp, Instagram, Messenger, and optionally books appointments to a connected
            Google Calendar and syncs leads to a connected CRM. Replies are generated using a third-party AI
            model (Google Gemini). AI-generated replies may be inaccurate, incomplete, or inappropriate in
            some cases — you are responsible for reviewing your agent&apos;s configuration and monitoring its
            output.
          </p>
        </Section>

        <Section title="3. Your account and responsibilities">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for the content of your agent&apos;s system prompt and business description, and for ensuring it does not mislead, defraud, or harm your customers.</li>
            <li>You are the data controller for your own end-customers&apos; personal data collected through your agent. You are responsible for having your own privacy notice and lawful basis to collect that data, and for complying with applicable law (including TCPA for SMS messaging and GDPR/CCPA where applicable to your customers).</li>
            <li>You may not use Iupiter to send unsolicited bulk messages (spam), to harass, deceive, or impersonate, or for any unlawful purpose.</li>
            <li>You are responsible for keeping your account credentials secure.</li>
          </ul>
        </Section>

        <Section title="4. AI limitations &amp; no warranty on outputs">
          <p>
            Iupiter uses third-party large language models to generate conversational replies and may use
            function calls to take actions like booking a calendar event based on what a customer says in
            chat. We do not guarantee that AI-generated content will be accurate, will not be manipulated by
            a user attempting to abuse the chat (for example, prompt injection), or will always behave as
            intended. You should not rely on Iupiter for situations requiring guaranteed accuracy (medical,
            legal, financial, or emergency advice) and should configure your agent accordingly.
          </p>
        </Section>

        <Section title="5. Fees and billing">
          <p>
            Pricing is as published on our pricing page or as agreed in writing for your plan. Fees are
            non-refundable except as required by law or as we agree in writing. We may change pricing for
            future billing periods with notice.
          </p>
        </Section>

        <Section title="6. Third-party services">
          <p>
            Iupiter integrates with third-party services (Clerk, Supabase, Google, Twilio, Resend, Meta,
            Follow Up Boss, Vercel) to operate. Your use of features that rely on these services is also
            subject to those providers&apos; own terms. We are not responsible for outages, changes, or
            failures of third-party services outside our control.
          </p>
        </Section>

        <Section title="7. Termination">
          <p>
            You may stop using Iupiter and request account deletion at any time. We may suspend or terminate
            your account if you violate these Terms, misuse the service, or fail to pay applicable fees.
          </p>
        </Section>

        <Section title="8. Disclaimer of warranties">
          <p>
            Iupiter is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind, express
            or implied, including merchantability, fitness for a particular purpose, and non-infringement.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the maximum extent permitted by law, Iupiter and its operators will not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or for any loss of profits,
            revenue, data, or business opportunity, arising from your use of the service — including damages
            arising from AI-generated content, missed or incorrect bookings, or third-party service failures.
            Our total liability for any claim relating to the service will not exceed the amount you paid us
            in the 3 months preceding the claim.
          </p>
        </Section>

        <Section title="10. Indemnification">
          <p>
            You agree to indemnify and hold Iupiter harmless from claims arising out of your use of the
            service, your agent&apos;s configuration or content, your handling of your own customers&apos; data, or
            your violation of these Terms or applicable law.
          </p>
        </Section>

        <Section title="11. Governing law">
          <p>
            These Terms are governed by the laws of <strong style={{ color: '#F4F3EE' }}>[Insert governing jurisdiction]</strong>,
            without regard to conflict-of-law principles.
          </p>
        </Section>

        <Section title="12. Changes to these Terms">
          <p>
            We may update these Terms from time to time. Continued use of Iupiter after a change means you
            accept the updated Terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these Terms: <strong style={{ color: '#F4F3EE' }}>[Insert contact email]</strong>.
          </p>
        </Section>
      </div>

      <div style={{ borderTop: `1px solid ${LINE}`, padding: '20px clamp(20px,4vw,64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 13, color: MUTED2 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>Iupiter</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/privacy" style={{ color: MUTED2, textDecoration: 'none' }}>Privacy Policy</Link>
          <span>© 2026 Iupiter</span>
        </div>
      </div>
    </main>
  );
}
