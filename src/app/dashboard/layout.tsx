'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect to login if DATABASE_URL is configured (full app mode)
    if (status === 'unauthenticated' && process.env.DATABASE_URL) {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  // Allow rendering without session for landing page deployment
  // Auth will be enforced when DATABASE_URL is configured
  if (!session && process.env.DATABASE_URL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border p-6 hidden md:block">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl">
            <span className="font-light text-text">Smoke</span>
            <span className="text-primary">Sentry</span>
          </h1>
        </div>

        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="outline" size="md" className="w-full justify-start text-left">
              Overview
            </Button>
          </Link>
          <Link href="/dashboard/devices">
            <Button variant="outline" size="md" className="w-full justify-start text-left">
              Devices
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="md" className="w-full justify-start text-left">
              Settings
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="danger"
            size="md"
            className="w-full"
            onClick={() => router.push('/api/auth/signout')}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 md:hidden flex justify-around">
        <Link href="/dashboard" className="text-text-muted hover:text-primary">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        <Link href="/dashboard/devices" className="text-text-muted hover:text-primary">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </Link>
        <Link href="/dashboard/settings" className="text-text-muted hover:text-primary">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
