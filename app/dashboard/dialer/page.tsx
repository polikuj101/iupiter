export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Dialer from './Dialer';

export default async function DialerPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="py-10 px-4">
      <Dialer />
    </div>
  );
}
