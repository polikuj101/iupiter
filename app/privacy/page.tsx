export const dynamic = 'force-dynamic';
import Link from 'next/link';

const LINE = 'rgba(255,255,255,0.10)';
const MUTED = '#9B9B96';
const MUTED2 = '#6E6E69';
const ACCENT = '#C8FF34';

export const metadata = {
  title: 'Privacy Policy — Iupiter',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#F4F3EE', marginBottom: 14, letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>

        <Section title="Who we are">
          <p>
            Iupiter (&quot;Iupiter,&quot; &quot;we,&quot; &quot;us&quot;) operates an AI receptionist platform that helps businesses
            answer customer inquiries, book appointments, and manage leads across web chat, WhatsApp,
            Instagram, and Messenger.
          </p>
          <p style={{ marginTop: 12 }}>
            Operated by: <strong style={{ color: '#F4F3EE' }}>Nurbolat Mirash</strong>, an individual operating as an
            unincorporated business based in <strong style={{ color: '#F4F3EE' }}>Kazakhstan</strong>.<br />
            Contact: <strong style={{ color: '#F4F3EE' }}>bo.mirash@gmail.com</strong>
          </p>
        </Section>

        <Section title="Two kinds of data we handle">
          <p>
            <strong style={{ color: '#F4F3EE' }}>Account data</strong> — information about you, the business owner using
            Iupiter: name, email, organization, billing details, and agent configuration (system prompts,
            business description, widget settings).
          </p>
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: '#F4F3EE' }}>End-customer data</strong> — information about the people who message
            your AI agent: name, phone number, email (if given), and the content of their conversation. For this
            data, you (the business) are the data controller and Iupiter acts as a data processor on your behalf.
            You are responsible for having a lawful basis to collect this data from your own customers and for
            your own privacy notice to them.
          </p>
        </Section>

        <Section title="What we collect and why">
          <p>We collect and process:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: '#F4F3EE' }}>Identity &amp; account data</strong> via Clerk (our authentication provider) — email, name, organization membership.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Conversation data</strong> — chat messages sent through the website widget, WhatsApp, Instagram, or Messenger, stored in our database (Supabase) to maintain conversation history and generate replies.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Contact data</strong> — name, phone number, and email of end-customers who message an agent, used to follow up, send SMS notifications, and sync with your calendar or CRM if you connect one.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Calendar data</strong> — if you connect Google Calendar, we request the <code>calendar.events</code> scope to create appointment events on your behalf. We do not read your full calendar history beyond what is needed to book and manage appointments created through Iupiter.</li>
            <li><strong style={{ color: '#F4F3EE' }}>SMS &amp; phone data</strong> — if you enable SMS notifications, we send messages via Twilio using the phone number an end-customer provides in chat. We do not sell or share phone numbers with third parties for marketing.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Usage &amp; technical data</strong> — IP address, browser type, and basic analytics needed to operate and secure the service.</li>
          </ul>
        </Section>

        <Section title="AI processing">
          <p>
            Conversation content is sent to Google&apos;s Gemini API to generate replies. We do not use your
            conversation data to train Google&apos;s or our own foundation models. Conversation data is retained
            to provide the service (history, context, lead records) and is deleted on request as described
            below.
          </p>
        </Section>

        <Section title="Third parties we share data with">
          <p>We use the following subprocessors to operate Iupiter. Each only receives the data needed to perform its function:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: '#F4F3EE' }}>Clerk</strong> — authentication and account management.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Supabase</strong> — database hosting (contacts, conversations, messages).</li>
            <li><strong style={{ color: '#F4F3EE' }}>Google</strong> — Gemini API (AI replies) and Calendar API (appointment booking, if connected).</li>
            <li><strong style={{ color: '#F4F3EE' }}>Twilio</strong> — SMS delivery, if enabled.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Resend</strong> — transactional email notifications.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Meta (WhatsApp Business Platform, Instagram, Messenger)</strong> — message delivery for connected social channels.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Follow Up Boss</strong> — CRM sync, if you connect this integration.</li>
            <li><strong style={{ color: '#F4F3EE' }}>Vercel</strong> — application hosting.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            We do not sell personal data. We do not share data with third parties for their own advertising
            purposes.
          </p>
        </Section>

        <Section title="Data retention">
          <p>
            We retain account and conversation data for as long as your account is active, plus a reasonable
            period afterward for backups and legal compliance. You can request deletion of your account and
            associated data at any time by contacting us.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            If you are a resident of California, Virginia, Colorado, Connecticut, Utah, or another U.S.
            state with a comprehensive privacy law, you may have the right to know what personal data we hold
            about you, request a copy, correct it, delete it, and opt out of certain processing. If you are
            in the EU/EEA or UK, you have similar rights under GDPR/UK GDPR, plus the right to lodge a
            complaint with your local data protection authority. To exercise these rights, contact us at
            the address above. If you are a business using Iupiter to handle your own customers&apos; data, you
            are responsible for honoring similar requests from your own customers and may ask us to assist.
          </p>
        </Section>

        <Section title="SMS consent">
          <p>
            If SMS notifications are enabled for an agent, an end-customer who provides their phone number in
            chat consents to receive text messages related to their inquiry (for example, confirmations and
            follow-ups). Message frequency varies based on the conversation. Message and data rates may
            apply. Consent to receive SMS is not a condition of purchasing any service. Customers can opt out
            at any time by replying <strong style={{ color: '#F4F3EE' }}>STOP</strong>, and can reply{' '}
            <strong style={{ color: '#F4F3EE' }}>HELP</strong> for assistance. We do not share mobile phone
            numbers with third parties for marketing purposes. Businesses using Iupiter to message their own
            customers are responsible for obtaining and documenting proper consent under the U.S. Telephone
            Consumer Protection Act (TCPA) and any other applicable law before enabling SMS for an agent.
          </p>
        </Section>

        <Section title="Security">
          <p>
            We use industry-standard measures (encrypted connections, access controls, tenant isolation by
            organization) to protect data. No system is perfectly secure, and we cannot guarantee absolute
            security.
          </p>
        </Section>

        <Section title="Children">
          <p>Iupiter is intended for business use and is not directed at children under 16.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy from time to time. Material changes will be reflected by updating the
            &quot;Last updated&quot; date above.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy or your data: <strong style={{ color: '#F4F3EE' }}>bo.mirash@gmail.com</strong>.
          </p>
        </Section>
      </div>

      <div style={{ borderTop: `1px solid ${LINE}`, padding: '20px clamp(20px,4vw,64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 13, color: MUTED2 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>Iupiter</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/terms" style={{ color: MUTED2, textDecoration: 'none' }}>Terms of Service</Link>
          <span>© 2026 Iupiter</span>
        </div>
      </div>
    </main>
  );
}
