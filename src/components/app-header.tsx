"use client";

import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-bold">Job Sethu</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="hidden items-center space-x-2 md:flex">
            <Button asChild>
              <Link href="/jobs/new">Post a Job</Link>
            </Button>
          </nav>
          <React.Suspense fallback={<Skeleton className="h-9 w-9 rounded-full" />}>
            <UserNav />
          </React.Suspense>
        </div>
      </div>
    </header>
  );
}
