/**
 * Talks to the Iupiter Next.js app's service-to-service routes. All
 * Supabase/Google OAuth credentials stay in that repo — this bridge never
 * holds them, it just fetches the pre-built prompt/tools and proxies
 * booking calls through.
 */

export interface FunctionDeclarationJson {
  name: string;
  description?: string;
  parameters?: unknown;
}

export interface VoiceSessionConfig {
  systemInstruction: string;
  forwardPhone: string | null;
  tools: FunctionDeclarationJson[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function appUrl(): string {
  return requireEnv('IUPITER_APP_URL').replace(/\/$/, '');
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${requireEnv('BRIDGE_SHARED_SECRET')}` };
}

export async function fetchVoiceSessionConfig(): Promise<VoiceSessionConfig> {
  const res = await fetch(`${appUrl()}/api/twilio/voice-session-config`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`voice-session-config fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<VoiceSessionConfig>;
}

export interface BookAppointmentArgs {
  customerName: string;
  date: string;
  time: string;
  service?: string;
  phone?: string;
}

export async function bookAppointment(
  args: BookAppointmentArgs,
): Promise<{ success: boolean; eventId?: string; eventLink?: string; error?: string }> {
  const res = await fetch(`${appUrl()}/api/twilio/book-appointment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(args),
  });
  return res.json() as Promise<{ success: boolean; eventId?: string; eventLink?: string; error?: string }>;
}
