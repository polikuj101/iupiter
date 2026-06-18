/**
 * POST /api/lead — capture a web widget lead and send an SMS follow-up
 *
 * Body: { name, phone, agentId, email?, source? }
 * Flow: validate → normalize phone → upsert contact → fire Twilio SMS (non-blocking)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { normalizeE164, sendSms } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, phone, agentId, email, source } = body as {
    name?: string; phone?: string; agentId?: string; email?: string; source?: string;
  };

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }
  if (!agentId || typeof agentId !== 'string') {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
  }

  // Look up agent to get org_id
  const { data: agent, error: agentErr } = await supabaseAdmin
    .from('agents')
    .select('id, org_id, name, system_prompt')
    .eq('id', agentId)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const normalizedPhone = normalizeE164(phone.trim());

  // Upsert contact (platform='web', platform_id=phone)
  const { data: contact, error: contactErr } = await supabaseAdmin
    .from('contacts')
    .upsert(
      {
        org_id:      agent.org_id,
        platform:    'web',
        platform_id: normalizedPhone,
        name:        name.trim(),
        email:       email?.trim() || null,
        phone:       normalizedPhone,
        source:      source || 'widget',
      },
      { onConflict: 'org_id,platform,platform_id' }
    )
    .select('id')
    .single();

  if (contactErr || !contact) {
    console.error('[lead] contact upsert error:', contactErr);
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
  }

  // Fire SMS (non-blocking — never fail the lead save if Twilio is down)
  const smsBody = `Hi ${name.trim()}! Thanks for reaching out. I'm ${agent.name} and I'll be with you shortly. Reply anytime with your question.`;
  sendSms({ to: normalizedPhone, body: smsBody }).catch((err) =>
    console.error('[lead] SMS error:', err)
  );

  return NextResponse.json({ success: true, contactId: contact.id });
}
