import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const BASE_URL = 'https://iupiter.app';

export const metadata: Metadata = {
  title: 'Iupiter — AI agent for your business',
  description:
    'Build an AI receptionist in 5 minutes. Answers clients 24/7, books appointments, never misses a lead.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'Iupiter — AI agent for your business',
    description:
      'Build an AI receptionist in 5 minutes. Answers clients 24/7, books appointments, never misses a lead.',
    url: BASE_URL,
    siteName: 'Iupiter',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Iupiter AI' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iupiter — AI agent for your business',
    description:
      'Build an AI receptionist in 5 minutes. Answers clients 24/7, books appointments, never misses a lead.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Instrument+Sans:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full flex flex-col" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
