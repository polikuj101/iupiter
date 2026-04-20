export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { getAnalyticsOverview } from '@/lib/db/messages';
import { supabaseAdmin } from '@/lib/supabase/admin';
import AnalyticsCharts from '@/components/dashboard/analytics-charts';
import { ArrowUpRight } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const org = await getOrgByClerkId(userId);
  if (!org) redirect('/sign-in');

  const [overview, messagesPerDay, channelBreakdown, leadFunnel] = await Promise.all([
    getAnalyticsOverview(org.id),
    supabaseAdmin.rpc('get_messages_per_day', { p_org_id: org.id, p_days: 30 }),
    supabaseAdmin.rpc('get_channel_breakdown', { p_org_id: org.id }),
    supabaseAdmin.rpc('get_lead_funnel', { p_org_id: org.id }),
  ]);

  const avgSeconds = overview.avgResponseTimeMs
    ? (overview.avgResponseTimeMs / 1000).toFixed(1)
    : '—';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page title */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#0A0A0A]">Overview</h1>
        <p className="text-[13px] text-[#737373] mt-1">Last 30 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#EAEAEA] border border-[#EAEAEA] rounded-lg overflow-hidden">
        <StatCard label="Messages"       value={overview.totalMessages.toLocaleString()} />
        <StatCard label="Conversations"  value={overview.totalConversations.toLocaleString()} />
        <StatCard label="Contacts"       value={overview.totalContacts.toLocaleString()} />
        <StatCard label="Avg response"   value={avgSeconds === '—' ? '—' : `${avgSeconds}s`} />
      </div>

      {/* Charts */}
      <AnalyticsCharts
        messagesPerDay={messagesPerDay.data ?? []}
        channelBreakdown={channelBreakdown.data ?? []}
        leadFunnel={leadFunnel.data ?? []}
      />

      {/* Quick actions */}
      <div className="rounded-lg border border-[#EAEAEA] bg-white p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#0A0A0A] mb-1">Ready to go live?</h3>
          <p className="text-[13px] text-[#737373]">
            Configure your channels and start handling real customer conversations.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/agents"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0A0A0A] border border-[#EAEAEA] bg-white hover:bg-[#FAFAF9] px-3 py-2 rounded-md transition-colors"
          >
            Manage agents
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard/integrations"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white bg-[#0A0A0A] hover:bg-[#262626] px-3 py-2 rounded-md transition-colors"
          >
            Connect CRM
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 hover:bg-[#FAFAF9] transition-colors">
      <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">{value}</p>
    </div>
  );
}
