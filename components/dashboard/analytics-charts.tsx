'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp:  '#0A0A0A',
  instagram: '#737373',
  messenger: '#A3A3A3',
};

const FUNNEL_COLORS: Record<string, string> = {
  new:       '#D4D4D4',
  contacted: '#A3A3A3',
  qualified: '#737373',
  converted: '#0A0A0A',
  lost:      '#E5E5E5',
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
      <Card title="Messages per day" className="lg:col-span-2">
        {hasMessages ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={messagesPerDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0A0A0A" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#0A0A0A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#A3A3A3' }}
                tickFormatter={(v) => v.slice(5)}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#A3A3A3' }}
                width={28}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                labelFormatter={(v) => v}
                contentStyle={{
                  fontSize: 12,
                  border: '1px solid #EAEAEA',
                  borderRadius: 6,
                  background: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0A0A0A"
                fill="url(#msgGrad)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState label="No messages yet" />
        )}
      </Card>

      {/* Channel breakdown */}
      <Card title="Channels">
        {hasChannels ? (
          <>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={channelBreakdown}
                  dataKey="count"
                  nameKey="platform"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {channelBreakdown.map((entry, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[entry.platform] ?? '#A3A3A3'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    border: '1px solid #EAEAEA',
                    borderRadius: 6,
                    background: '#FFFFFF',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {channelBreakdown.map((entry) => (
                <div key={entry.platform} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: PLATFORM_COLORS[entry.platform] ?? '#A3A3A3' }}
                    />
                    <span className="text-[#525252] capitalize">{entry.platform}</span>
                  </div>
                  <span className="font-medium text-[#0A0A0A]">{entry.count}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState label="No data" />
        )}
      </Card>

      {/* Lead funnel */}
      <Card title="Lead funnel" className="lg:col-span-3">
        {hasFunnel ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={leadFunnel} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#A3A3A3' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="status"
                tick={{ fontSize: 12, fill: '#525252' }}
                width={80}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: '1px solid #EAEAEA',
                  borderRadius: 6,
                  background: '#FFFFFF',
                }}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                {leadFunnel.map((entry, i) => (
                  <Cell key={i} fill={FUNNEL_COLORS[entry.status] ?? '#A3A3A3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState label="No contacts yet" />
        )}
      </Card>
    </div>
  );
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[#EAEAEA] bg-white p-5 ${className}`}>
      <h3 className="text-[13px] font-medium text-[#0A0A0A] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="h-44 flex items-center justify-center text-[#A3A3A3] text-[13px]">
      {label}
    </div>
  );
}
