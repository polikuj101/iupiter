export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { listConversations } from '@/lib/db/conversations';
import { MessageSquare, Phone, AtSign, MessagesSquare } from 'lucide-react';

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp:  Phone,
  instagram: AtSign,
  messenger: MessagesSquare,
};

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp:  'bg-green-100 text-green-700',
  instagram: 'bg-pink-100 text-pink-700',
  messenger: 'bg-blue-100 text-blue-700',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

export default async function ConversationsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const org = await getOrgByClerkId(userId);
  if (!org) redirect('/sign-in');

  const { data: conversations, count } = await listConversations(org.id, { limit: 50 });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Conversations</h1>
        <p className="text-slate-500 text-sm mt-1">
          {count ?? 0} total conversation{count !== 1 ? 's' : ''}
        </p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg mb-2">No conversations yet</h3>
          <p className="text-slate-500 text-sm">
            Conversations will appear here once customers start messaging your agent.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {conversations.map((conv) => {
            const contact = conv.contacts as Record<string, unknown> | null;
            const agent   = conv.agents   as Record<string, unknown> | null;
            const PlatformIcon = PLATFORM_ICONS[conv.platform] ?? MessageSquare;

            return (
              <Link
                key={conv.id}
                href={`/dashboard/conversations/${conv.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 font-medium text-slate-600 text-sm">
                  {(contact?.name as string)?.[0]?.toUpperCase() ?? '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {(contact?.name as string) ?? (contact?.platform_id as string) ?? 'Unknown'}
                    </p>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${PLATFORM_COLORS[conv.platform] ?? 'bg-slate-100 text-slate-600'}`}>
                      <PlatformIcon className="w-3 h-3" />
                      {conv.platform}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Agent: {(agent?.name as string) ?? '—'} · {timeAgo(conv.last_message_at)}
                  </p>
                </div>

                {/* Status badge */}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  conv.status === 'active'    ? 'bg-green-100 text-green-700' :
                  conv.status === 'handed_off'? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-600'
                }`}>
                  {conv.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
