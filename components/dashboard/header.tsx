import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/organizations';

export default async function DashboardHeader() {
  const { userId } = await auth();
  const org = userId ? await getOrgByClerkId(userId) : null;

  return (
    <header
      className="h-14 px-6 flex items-center justify-between shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.10)', background: '#0A0A0B' }}
    >
      <div className="flex items-center gap-2 text-[13px]">
        <span style={{ color: '#6E6E69' }}>Workspace</span>
        <span style={{ color: 'rgba(255,255,255,0.18)' }}>/</span>
        <span className="font-medium" style={{ color: '#ECEBE6' }}>
          {org?.name ?? 'My Organization'}
        </span>
      </div>
      <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
    </header>
  );
}
