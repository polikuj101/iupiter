import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const metadata: Metadata = {
  title: "Iupiter - AI Agent Constructor",
  description: "Build an AI receptionist for your business in minutes",
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
            href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:ital,opsz,wght@0,6..144,100..900;1,6..144,100..900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full flex flex-col" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
