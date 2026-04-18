import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/organizations';

export default async function DashboardHeader() {
  const { userId } = await auth();
  const org = userId ? await getOrgByClerkId(userId) : null;

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
      <div>
        <p className="text-sm text-slate-500">Workspace</p>
        <p className="font-semibold text-slate-900">{org?.name ?? 'My Organization'}</p>
      </div>
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
