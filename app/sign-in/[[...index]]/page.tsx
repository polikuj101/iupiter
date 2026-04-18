'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-white shadow-2xl rounded-2xl',
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
