export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { listAgents } from '@/lib/db/agents';
import { Bot, Plus, Settings, MessageSquare, Zap } from 'lucide-react';

export default async function AgentsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const org = await getOrgByClerkId(userId);
  if (!org) redirect('/sign-in');

  const agents = await listAgents(org.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Agents</h1>
          <p className="text-slate-500 text-sm mt-1">
            {agents.length} agent{agents.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Link
          href="/dashboard/agents/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg mb-2">No agents yet</h3>
          <p className="text-slate-500 text-sm mb-6">
            Create your first AI agent and connect it to WhatsApp, Instagram or Messenger.
          </p>
          <Link
            href="/dashboard/agents/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Agent
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {agent.llm_model}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className={`text-xs font-medium ${agent.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                        {agent.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <Link
                    href={`/dashboard/agents/${agent.id}/test`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Test Chat
                  </Link>
                </div>
              </div>

              {agent.business_context && (
                <p className="mt-3 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2 line-clamp-2">
                  {agent.business_context}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-blue-900 text-sm">Pro tip</p>
            <p className="text-blue-700 text-sm mt-1">
              Add a detailed <strong>Business Context</strong> to each agent — the more specific, the better the AI performs.
              Include your services, prices, hours, and FAQs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
