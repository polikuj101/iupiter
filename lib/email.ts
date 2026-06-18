import { Resend } from 'resend';

// Lazy init — avoids crash when RESEND_API_KEY is not set at build time
let _resend: Resend | null = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendLeadNotification(params: {
  toEmail:      string;
  agentName:    string;
  contactName:  string;
  firstMessage: string;
  conversationUrl: string;
}) {
  const resend = getResend();
  if (!resend) return; // silently skip if not configured

  const { toEmail, agentName, contactName, firstMessage, conversationUrl } = params;

  await resend.emails.send({
    from:    'Iupiter <notifications@iupiter.ai>',
    to:      toEmail,
    subject: `New lead from ${agentName}: ${contactName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <div style="background:#2563EB;border-radius:12px;padding:20px 24px;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">
            New lead via ${agentName}
          </h1>
        </div>

        <p style="color:#374151;font-size:15px;margin:0 0 8px">
          <strong>${contactName}</strong> just started a conversation on your website.
        </p>

        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:20px 0">
          <p style="color:#6B7280;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em">
            Their first message
          </p>
          <p style="color:#111827;font-size:15px;margin:0;line-height:1.5">
            "${firstMessage}"
          </p>
        </div>

        <a href="${conversationUrl}"
           style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-top:8px">
          View conversation →
        </a>

        <p style="color:#9CA3AF;font-size:12px;margin-top:32px">
          Iupiter · AI agents for your business
        </p>
      </div>
    `,
  });
}

export async function sendZapierWebhook(webhookUrl: string, payload: {
  contactName:  string;
  firstMessage: string;
  agentName:    string;
  platform:     string;
  timestamp:    string;
}) {
  try {
    await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[zapier webhook] failed:', err);
  }
}
