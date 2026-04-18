'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp:  '#25D366',
  instagram: '#E1306C',
  messenger: '#0084FF',
};

const FUNNEL_COLORS: Record<string, string> = {
  new:       '#94a3b8',
  contacted: '#60a5fa',
  qualified: '#a78bfa',
  converted: '#34d399',
  lost:      '#f87171',
};

interface Props {
  messagesPerDay: { day: string; count: number }[];
  channelBreakdown: { platform: string; count: number }[];
  leadFunnel: { status: string; count: number }[];
}

export default function AnalyticsCharts({ messagesPerDay, channelBreakdown, leadFunnel }: Props) {
  const hasMessages = messagesPerDay.length > 0;
  const hasChannels = channelBreakdown.length > 0;
  const hasFunnel   = leadFunnel.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Messages per day */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Messages per day</h3>
        {hasMessages ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={messagesPerDay}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip labelFormatter={(v) => `Date: ${v}`} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fill="url(#msgGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState label="No messages yet" />
        )}
      </div>

      {/* Channel breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Channels</h3>
        {hasChannels ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={channelBreakdown}
                dataKey="count"
                nameKey="platform"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
              >
                {channelBreakdown.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={PLATFORM_COLORS[entry.platform] ?? '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [v, name]} />
              <Legend formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState label="No data" />
        )}
      </div>

      {/* Lead funnel */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Lead funnel</h3>
        {hasFunnel ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={leadFunnel} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="status"
                tick={{ fontSize: 12 }}
                width={80}
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {leadFunnel.map((entry, i) => (
                  <Cell key={i} fill={FUNNEL_COLORS[entry.status] ?? '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState label="No contacts yet" />
        )}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
      {label}
    </div>
  );
}
