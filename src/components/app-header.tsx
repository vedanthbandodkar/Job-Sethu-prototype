"use client";

import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setUserId(searchParams.get('userId'));
  }, [searchParams]);

  const constructUrl = (baseHref: string) => {
    if (!userId) return baseHref;
    // Don't add userId to home page
    if (baseHref === '/') return baseHref;
    return `${baseHref}?userId=${userId}`;
  };

  const navItems = [
    { href: constructUrl("/"), label: "Home" },
    { href: constructUrl("/dashboard"), label: "Dashboard" },
    { href: constructUrl("/profile"), label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href={constructUrl("/")} className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg font-bold">Job Sethu</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
                const baseHref = item.href.split('?')[0];
                const isActive = pathname === baseHref;
                return (
                    <Button key={item.label} variant="ghost" asChild className={cn("font-medium text-muted-foreground transition-colors hover:text-foreground", isActive && "text-foreground")}>
                        <Link href={item.href}>
                            {item.label}
                        </Link>
                    </Button>
                );
            })}
            </nav>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
            <Button asChild className="hidden md:inline-flex">
                <Link href={constructUrl('/jobs/new')}>Post a Job</Link>
            </Button>
            <React.Suspense fallback={<Skeleton className="h-9 w-9 rounded-full" />}>
                <UserNav />
            </React.Suspense>
        </div>
      </div>
    </header>
  );
}
