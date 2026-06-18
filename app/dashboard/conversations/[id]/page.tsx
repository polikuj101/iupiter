export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { getConversationWithMessages } from '@/lib/db/conversations';
import { ArrowLeft, Phone, AtSign, MessagesSquare, MessageSquare, Bot, User } from 'lucide-react';

type Params = { params: Promise<{ id: string }> };

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp:  Phone,
  instagram: AtSign,
  messenger: MessagesSquare,
  widget:    MessageSquare,
};

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp:  'bg-green-100 text-green-700',
  instagram: 'bg-pink-100 text-pink-700',
  messenger: 'bg-blue-100 text-blue-700',
  widget:    'bg-blue-100 text-blue-700',
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function ConversationDetailPage({ params }: Params) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const org = await getOrgByClerkId(userId);
  if (!org) redirect('/sign-in');

  const { id } = await params;

  let conv, messages;
  try {
    const result = await getConversationWithMessages(id, org.id);
    conv     = result.conversation;
    messages = result.messages;
  } catch {
    notFound();
  }

  const contact = conv.contacts as Record<string, string> | null;
  const agent   = conv.agents   as Record<string, string> | null;
  const PlatformIcon = PLATFORM_ICONS[conv.platform] ?? MessageSquare;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/conversations"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Contact card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700 text-lg flex-shrink-0">
          {contact?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">
            {contact?.name ?? contact?.platform_id ?? 'Unknown contact'}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${PLATFORM_COLORS[conv.platform] ?? 'bg-slate-100 text-slate-600'}`}>
              <PlatformIcon className="w-3 h-3" />
              {conv.platform}
            </span>
            <span className="text-xs text-slate-400">
              Agent: {agent?.name ?? '—'}
            </span>
            <span className="text-xs text-slate-400">
              Started {formatDate(conv.started_at)}
            </span>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
          conv.status === 'active'     ? 'bg-green-100 text-green-700'  :
          conv.status === 'handed_off' ? 'bg-yellow-100 text-yellow-700' :
                                         'bg-slate-100 text-slate-600'
        }`}>
          {conv.status}
        </span>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">
            Conversation · {messages?.length ?? 0} messages
          </p>
        </div>

        <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
          {!messages || messages.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No messages yet</p>
          ) : (
            messages.map((msg: Record<string, unknown>) => {
              const isBot = msg.sender_type === 'agent' || msg.role === 'assistant';
              return (
                <div key={msg.id as string} className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isBot ? 'bg-blue-600' : 'bg-slate-200'
                  }`}>
                    {isBot
                      ? <Bot className="w-3.5 h-3.5 text-white" />
                      : <User className="w-3.5 h-3.5 text-slate-500" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${isBot ? '' : 'items-end'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isBot
                        ? 'bg-slate-100 text-slate-900 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm'
                    }`}>
                      {msg.content as string}
                    </div>
                    <p className={`text-[11px] text-slate-400 ${isBot ? '' : 'text-right'}`}>
                      {formatTime(msg.created_at as string)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
