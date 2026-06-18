export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrCreateOrg } from '@/lib/db/organizations';
import Sidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Auto-provision org on first login
  await getOrCreateOrg(userId);

  return (
    <div className="flex h-screen overflow-hidden antialiased" style={{ background: '#0A0A0B', color: '#ECEBE6', fontFamily: 'var(--font-body)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0A0A0B' }}>
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-8" style={{ background: '#0D0D0F' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
