import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AuroraBackground } from '@/components/aurora-background';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getSession } from '@/lib/api';

const siteUrl = (process.env.WEB_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Let's Contribute — opportunities, ideas and project discussions",
    template: "%s · Let's Contribute",
  },
  description:
    'A glassmorphic community board for open source: share contribution opportunities, float ideas, and discuss projects until they ship. NestJS + Next.js + Neon on Vercel.',
  applicationName: "Let's Contribute",
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: "Let's Contribute",
    description:
      'Share contribution opportunities, post ideas, and discuss open-source projects with people who ship.',
    siteName: "Let's Contribute",
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#05060f',
  colorScheme: 'dark',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSession();

  return (
    <html lang="en">
      <body className="min-h-dvh">
        <AuroraBackground />
        <SiteHeader user={user} />
        <main className="relative mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
