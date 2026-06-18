export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { getAnalyticsOverview } from '@/lib/db/messages';
import { supabaseAdmin } from '@/lib/supabase/admin';
import AnalyticsCharts from '@/components/dashboard/analytics-charts';
import { ArrowUpRight } from 'lucide-react';

const LINE   = 'rgba(255,255,255,0.10)';
const ACCENT = '#C8FF34';
const AINK   = '#16210A';
const GREEN  = '#2FBF71';
const MUTED  = '#9B9B96';
const MUTED2 = '#6E6E69';
const INK2   = '#141416';
const INK3   = '#1C1C1F';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const org = await getOrgByClerkId(userId);
  if (!org) redirect('/sign-in');

  // First-time users go through the onboarding wizard
  if (!(org as unknown as Record<string, unknown>).onboarding_completed) {
    redirect('/dashboard/onboarding');
  }

  const [overview, messagesPerDay, channelBreakdown, leadFunnel, agentsResult] = await Promise.all([
    getAnalyticsOverview(org.id),
    supabaseAdmin.rpc('get_messages_per_day',   { p_org_id: org.id, p_days: 30 }),
    supabaseAdmin.rpc('get_channel_breakdown',  { p_org_id: org.id }),
    supabaseAdmin.rpc('get_lead_funnel',        { p_org_id: org.id }),
    supabaseAdmin.from('agents').select('id', { count: 'exact', head: true }).eq('org_id', org.id),
  ]);

  const hasAgents  = (agentsResult.count ?? 0) > 0;
  const avgSeconds = overview.avgResponseTimeMs
    ? (overview.avgResponseTimeMs / 1000).toFixed(1)
    : '—';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* ── Onboarding banner ── */}
      {!hasAgents && (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, border: `1px solid rgba(200,255,52,0.20)`, background: 'rgba(200,255,52,0.05)', padding: '24px 28px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 200, background: 'radial-gradient(circle at 80% 50%,rgba(200,255,52,0.08),transparent 70%)', pointerEvents: 'none' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👋</span>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>Get started</span>
              </div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: '#ECEBE6', fontFamily: 'var(--font-display)' }}>
                Create your first AI agent in 5 minutes
              </h2>
              <p className="text-sm leading-relaxed max-w-lg" style={{ color: MUTED }}>
                Describe your business, pick a prompt preset, and your agent starts answering customers on your website — no code needed.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-xs" style={{ color: MUTED }}>
                {['Describe your business', 'Pick a prompt preset', 'Embed on your site'].map((step, i) => (
                  <span key={step} className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]" style={{ background: 'rgba(200,255,52,0.15)', color: ACCENT }}>{i + 1}</span>
                    {step}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/dashboard/agents/new"
              className="inline-flex items-center gap-2 font-medium text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
              style={{ background: ACCENT, color: AINK, fontWeight: 700, textDecoration: 'none' }}
            >
              Create your first agent
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Page title */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#ECEBE6' }}>Overview</h1>
        <p className="text-[13px] mt-1" style={{ color: MUTED2 }}>Last 30 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden" style={{ background: LINE, border: `1px solid ${LINE}` }}>
        <StatCard label="Messages"      value={overview.totalMessages.toLocaleString()} />
        <StatCard label="Conversations" value={overview.totalConversations.toLocaleString()} />
        <StatCard label="Contacts"      value={overview.totalContacts.toLocaleString()} />
        <StatCard label="Avg response"  value={avgSeconds === '—' ? '—' : `${avgSeconds}s`} accent />
      </div>

      {/* Charts */}
      <AnalyticsCharts
        messagesPerDay={messagesPerDay.data ?? []}
        channelBreakdown={channelBreakdown.data ?? []}
        leadFunnel={leadFunnel.data ?? []}
      />

      {/* Quick actions */}
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ border: `1px solid ${LINE}`, background: INK2 }}>
        <div>
          <h3 className="text-sm font-medium mb-1" style={{ color: '#ECEBE6', fontFamily: 'var(--font-display)' }}>Ready to go live?</h3>
          <p className="text-[13px]" style={{ color: MUTED }}>
            Configure your channels and start handling real customer conversations.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          <Link
            href="/dashboard/agents"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: '#ECEBE6', border: `1px solid ${LINE}`, background: INK3, textDecoration: 'none' }}
          >
            Manage agents
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard/integrations"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ background: ACCENT, color: AINK, fontWeight: 700, textDecoration: 'none' }}
          >
            Connect CRM
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-5 transition-colors" style={{ background: '#141416' }}>
      <p className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: '#6E6E69' }}>{label}</p>
      <p className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: accent ? '#C8FF34' : '#ECEBE6' }}>{value}</p>
    </div>
  );
}
