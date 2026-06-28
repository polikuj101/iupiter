import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Routes that do NOT require authentication
const publicRoutes = createRouteMatcher([
  '/',
  '/dentist',
  '/privacy',
  '/terms',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/lead',
  '/widget(.*)',
  '/api/widget(.*)',
  '/demo(.*)',
  '/api/demo(.*)',
  '/api/auth/google/callback',
  '/api/twilio/voice-webhook',
]);

// In Next.js 16, the file is proxy.ts and the export is named `proxy`
export const proxy = clerkMiddleware(async (auth, req: NextRequest) => {
  if (!publicRoutes(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
