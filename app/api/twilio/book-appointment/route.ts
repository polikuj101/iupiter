/**
 * Service-to-service route — called by the voice bridge when the Live API
 * agent invokes the book_appointment function mid-call. Wraps the existing
 * bookAppointment() so Supabase/Google OAuth credentials stay in this repo
 * only, never duplicated into the separate bridge service. Authenticated via
 * BRIDGE_SHARED_SECRET, not Clerk — the bridge has no user session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { bookAppointment } from '@/lib/google-calendar';
import { requireBridgeAuth } from '@/lib/bridge-auth';

export async function POST(req: NextRequest) {
  const authError = requireBridgeAuth(req);
  if (authError) return authError;

  const agentId = process.env.DEFAULT_VOICE_AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ error: 'DEFAULT_VOICE_AGENT_ID not configured' }, { status: 500 });
  }

  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .select('org_id, timezone')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: 'Voice agent not found' }, { status: 404 });
  }

  const body = await req.json() as {
    customerName?: string;
    date?:         string;
    time?:         string;
    service?:      string;
    phone?:        string;
  };

  if (!body.customerName || !body.date || !body.time) {
    return NextResponse.json({ error: 'customerName, date, and time are required' }, { status: 400 });
  }

  const booking = await bookAppointment(agent.org_id, {
    customerName: body.customerName,
    date:         body.date,
    time:         body.time,
    service:      body.service,
    phone:        body.phone,
    durationMins: 60,
    timezone:     agent.timezone ?? 'America/New_York',
  });

  return NextResponse.json(booking);
}
