export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { isCalendarConnected } from '@/lib/google-calendar';
import GoogleCalendarCard from './GoogleCalendarCard';
import NotificationEmailCard from './NotificationEmailCard';
import FollowUpBossCard from './FollowUpBossCard';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ calendar?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const org = await getOrgByClerkId(userId);
  if (!org) redirect('/sign-in');

  const { calendar } = await searchParams;
  const calendarConnected = await isCalendarConnected(org.id);

  const { data: orgFull } = await (await import('@/lib/supabase/admin')).supabaseAdmin
    .from('organizations')
    .select('notification_email, fub_api_key')
    .eq('id', org.id)
    .single();
  const notificationEmail = orgFull?.notification_email ?? '';
  const fubApiKey = orgFull?.fub_api_key ?? '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your organization and integrations</p>
      </div>

      {/* OAuth status toast */}
      {calendar === 'connected' && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <span className="text-lg">✅</span>
          Google Calendar connected successfully! Your agents can now book appointments.
        </div>
      )}
      {calendar === 'error' && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
          <span className="text-lg">❌</span>
          Failed to connect Google Calendar. Please try again.
        </div>
      )}

      {/* Org info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Organization</h2>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
          <input
            defaultValue={org.name}
            readOnly
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Plan</label>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {org.plan}
            </span>
          </div>
        </div>
      </div>

      {/* ── Lead notifications ── */}
      <NotificationEmailCard orgId={org.id} defaultEmail={notificationEmail} />

      {/* ── Follow Up Boss ── */}
      <FollowUpBossCard defaultApiKey={fubApiKey} />

      {/* ── Google Calendar ── */}
      <GoogleCalendarCard connected={calendarConnected} />

      {/* Webhook info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Webhook</h2>
        <p className="text-sm text-slate-500">
          Use this URL when configuring your Meta webhook.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Callback URL</label>
          <input
            readOnly
            value={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://iupiter.vercel.app'}/api/webhook/meta`}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 font-mono text-slate-600"
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-red-800">Danger Zone</h2>
        <p className="text-sm text-red-600">
          Deleting your account will remove all agents, conversations, and contacts. This cannot be undone.
        </p>
        <button className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
