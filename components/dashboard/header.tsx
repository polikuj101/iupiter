import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/organizations';

export default async function DashboardHeader() {
  const { userId } = await auth();
  const org = userId ? await getOrgByClerkId(userId) : null;

  return (
    <header className="h-14 border-b border-[#EAEAEA] bg-white px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-[#737373]">Workspace</span>
        <span className="text-[#D4D4D4]">/</span>
        <span className="font-medium text-[#0A0A0A]">{org?.name ?? 'My Organization'}</span>
      </div>
      <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
    </header>
  );
}
