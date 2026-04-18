export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrgByClerkId } from '@/lib/db/organizations';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const org = await getOrgByClerkId(userId);
  if (!org) redirect('/sign-in');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your organization and billing</p>
      </div>

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

      {/* Webhook info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Webhook</h2>
        <p className="text-sm text-slate-500">
          Use this URL when configuring your Meta webhook.
          All channels (WhatsApp, Instagram, Messenger) use the same endpoint.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Callback URL</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-domain.vercel.app'}/api/webhook/meta`}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 font-mono text-slate-600"
            />
          </div>
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
