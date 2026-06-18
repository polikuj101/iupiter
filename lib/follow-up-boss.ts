/**
 * Follow Up Boss CRM integration
 * Docs: https://api.followupboss.com/v1
 * Auth: HTTP Basic — API key as username, empty password
 */

const FUB_BASE = 'https://api.followupboss.com/v1';

function authHeader(apiKey: string) {
  const encoded = Buffer.from(`${apiKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

export interface FUBLeadParams {
  apiKey:       string;
  firstName?:   string;
  lastName?:    string;
  email?:       string;
  phone?:       string;
  source?:      string;
  note?:        string;
  tags?:        string[];
}

/**
 * Create or update a contact in Follow Up Boss.
 * FUB deduplicates by email/phone automatically.
 */
export async function createFUBLead(params: FUBLeadParams): Promise<{ id: number } | null> {
  const { apiKey, firstName, lastName, email, phone, source, note, tags } = params;

  const body: Record<string, unknown> = {
    source: source ?? 'Iupiter AI',
    tags:   tags   ?? ['AI Lead'],
  };

  if (firstName) body.firstName = firstName;
  if (lastName)  body.lastName  = lastName;
  if (email)     body.emails    = [{ value: email }];
  if (phone)     body.phones    = [{ value: phone }];
  if (note)      body.note      = note;

  try {
    const res = await fetch(`${FUB_BASE}/people`, {
      method:  'POST',
      headers: {
        'Authorization': authHeader(apiKey),
        'Content-Type':  'application/json',
        'X-System':      'Iupiter',
        'X-System-Key':  apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[fub] create lead failed:', res.status, text);
      return null;
    }

    const data = await res.json() as { id: number };
    return data;
  } catch (err) {
    console.error('[fub] error:', err);
    return null;
  }
}

/**
 * Add a note to an existing FUB contact
 */
export async function addFUBNote(apiKey: string, personId: number, note: string): Promise<void> {
  try {
    await fetch(`${FUB_BASE}/notes`, {
      method:  'POST',
      headers: {
        'Authorization': authHeader(apiKey),
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ personId, body: note }),
    });
  } catch (err) {
    console.error('[fub] add note error:', err);
  }
}

/**
 * Verify that an API key is valid by hitting /me
 */
export async function verifyFUBKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${FUB_BASE}/me`, {
      headers: { 'Authorization': authHeader(apiKey) },
    });
    return res.ok;
  } catch {
    return false;
  }
}
