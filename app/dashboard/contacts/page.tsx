export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { listContacts } from '@/lib/db/contacts';
import { Users } from 'lucide-react';
import ContactStatusBadge from '@/components/dashboard/contact-status-badge';

const TABS = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost'] as const;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const org = await getOrgByClerkId(userId);
  if (!org) redirect('/sign-in');

  const params = await searchParams;
  const activeStatus = params.status as typeof TABS[number] | undefined;

  const { data: contacts, count } = await listContacts(org.id, {
    status: activeStatus !== 'all' ? activeStatus : undefined,
    limit: 100,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
        <p className="text-slate-500 text-sm mt-1">{count ?? 0} contacts total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <a
            key={tab}
            href={tab === 'all' ? '/dashboard/contacts' : `/dashboard/contacts?status=${tab}`}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
              (activeStatus ?? 'all') === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </a>
        ))}
      </div>

      {!contacts || contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg mb-2">No contacts yet</h3>
          <p className="text-slate-500 text-sm">
            Contacts are automatically created when people message your agents.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Contact</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Platform</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">First seen</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                        {contact.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {contact.name ?? 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">{contact.platform_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 capitalize text-slate-600">{contact.platform}</td>
                  <td className="px-5 py-3.5">
                    <ContactStatusBadge status={contact.lead_status} contactId={contact.id} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(contact.first_seen_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(contact.last_seen_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
