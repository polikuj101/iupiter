import { google } from 'googleapis';
import { supabaseAdmin } from './supabase/admin';

// ─── OAuth client ─────────────────────────────────────────────────

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
  );
}

export function getAuthUrl(orgId: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt:      'consent',
    scope:       ['https://www.googleapis.com/auth/calendar.events'],
    state:       Buffer.from(orgId).toString('base64'),
  });
}

// ─── Token management ─────────────────────────────────────────────

export async function saveTokens(orgId: string, tokens: {
  access_token?:  string | null;
  refresh_token?: string | null;
  expiry_date?:   number | null;
}) {
  await supabaseAdmin
    .from('organizations')
    .update({
      google_access_token:  tokens.access_token  ?? undefined,
      google_refresh_token: tokens.refresh_token ?? undefined,
      google_token_expiry:  tokens.expiry_date   ?? undefined,
    })
    .eq('id', orgId);
}

export async function disconnectCalendar(orgId: string) {
  await supabaseAdmin
    .from('organizations')
    .update({
      google_access_token:  null,
      google_refresh_token: null,
      google_token_expiry:  null,
      google_calendar_id:   'primary',
    })
    .eq('id', orgId);
}

export async function getAuthedClient(orgId: string) {
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('google_refresh_token, google_access_token, google_token_expiry, google_calendar_id')
    .eq('id', orgId)
    .single();

  if (!org?.google_refresh_token) return null;

  const client = getOAuthClient();
  client.setCredentials({
    refresh_token: org.google_refresh_token,
    access_token:  org.google_access_token,
    expiry_date:   org.google_token_expiry,
  });

  // Refresh token if expired
  client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await saveTokens(orgId, tokens);
    }
  });

  return { client, calendarId: org.google_calendar_id || 'primary' };
}

// ─── Calendar operations ──────────────────────────────────────────

export interface BookingParams {
  customerName:  string;
  date:          string;   // YYYY-MM-DD
  time:          string;   // HH:MM (24h)
  service?:      string;
  phone?:        string;
  durationMins?: number;
  timezone?:     string;   // IANA timezone, e.g. 'America/New_York'
}

export async function bookAppointment(orgId: string, params: BookingParams): Promise<{
  success: boolean;
  eventId?: string;
  eventLink?: string;
  error?: string;
}> {
  const auth = await getAuthedClient(orgId);
  if (!auth) return { success: false, error: 'Google Calendar not connected' };

  const { client, calendarId } = auth;
  const calendar = google.calendar({ version: 'v3', auth: client });

  const duration = params.durationMins ?? 60;
  const tz = params.timezone ?? 'America/New_York';

  // Build local datetime strings — let Google Calendar apply the timezone offset.
  // Using toISOString() would coerce to UTC (wrong for customers in non-UTC zones).
  const hhmm     = params.time.length === 5 ? params.time : params.time.padStart(5, '0');
  const startStr = `${params.date}T${hhmm}:00`;

  // Calculate end time by parsing as UTC-neutral then adding duration
  const [year, month, day] = params.date.split('-').map(Number);
  const [hour, minute]     = hhmm.split(':').map(Number);
  const startMs  = Date.UTC(year, month - 1, day, hour, minute);
  const endMs    = startMs + duration * 60 * 1000;
  const endDate  = new Date(endMs);
  const endStr   = [
    String(endDate.getUTCFullYear()),
    String(endDate.getUTCMonth() + 1).padStart(2, '0'),
    String(endDate.getUTCDate()).padStart(2, '0'),
  ].join('-') + 'T' + [
    String(endDate.getUTCHours()).padStart(2, '0'),
    String(endDate.getUTCMinutes()).padStart(2, '0'),
    '00',
  ].join(':');

  const description = [
    params.phone   ? `Phone: ${params.phone}`   : '',
    params.service ? `Service: ${params.service}` : '',
    'Booked via Iupiter AI',
  ].filter(Boolean).join('\n');

  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary:     `${params.service || 'Appointment'} — ${params.customerName}`,
        description,
        start: { dateTime: startStr, timeZone: tz },
        end:   { dateTime: endStr,   timeZone: tz },
      },
    });

    return {
      success:   true,
      eventId:   event.data.id ?? undefined,
      eventLink: event.data.htmlLink ?? undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[calendar] bookAppointment error:', msg);
    return { success: false, error: msg };
  }
}

export async function isCalendarConnected(orgId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('organizations')
    .select('google_refresh_token')
    .eq('id', orgId)
    .single();
  return !!data?.google_refresh_token;
}
