export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { getAnalyticsOverview } from '@/lib/db/messages';
import { supabaseAdmin } from '@/lib/supabase/admin';
import AnalyticsCharts from '@/components/dashboard/analytics-charts';
import {
  MessageSquare, Users, Clock, Activity,
  TrendingUp, Bot,
} from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Last 30 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Messages"
          value={overview.totalMessages.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={Activity}
          label="Conversations"
          value={overview.totalConversations.toLocaleString()}
          color="purple"
        />
        <StatCard
          icon={Users}
          label="Total Contacts"
          value={overview.totalContacts.toLocaleString()}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Avg Response"
          value={avgSeconds === '—' ? '—' : `${avgSeconds}s`}
          color="orange"
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts
        messagesPerDay={messagesPerDay.data ?? []}
        channelBreakdown={channelBreakdown.data ?? []}
        leadFunnel={leadFunnel.data ?? []}
      />

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Ready to go live?</h3>
            <p className="text-blue-100 text-sm">
              Configure your channels and start handling real customer conversations.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/dashboard/agents"
              className="bg-white text-blue-600 font-medium px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Manage Agents
            </a>
            <a
              href="/dashboard/integrations"
              className="border border-white/30 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Connect CRM
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colors = {
    blue:   'bg-blue-50   text-blue-600   border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green:  'bg-green-50  text-green-600  border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
