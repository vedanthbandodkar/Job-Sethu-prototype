
"use client";

import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { Briefcase } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  // This function now preserves the active user's session (userId) across all links,
  // preventing the profile from switching when just viewing another user's page.
  const constructUrlWithUser = (baseHref: string) => {
    if (!userId) return baseHref;
    const params = new URLSearchParams();
    params.set('userId', userId);

    // For the profile link, we always want it to point to the current user's own profile.
    if (baseHref === '/profile') {
      return `/profile?userId=${userId}`;
    }
    
    // Preserve other relevant params
    if (baseHref === '/dashboard' && searchParams.has('tab')) {
      params.set('tab', searchParams.get('tab')!);
    }
    
    return `${baseHref}?${params.toString()}`;
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href={constructUrlWithUser("/")} className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg font-bold">Job Sethu</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
                // The profile link should point to the current user's profile page.
                // Other links will also carry the userId to maintain the session.
                const finalHref = constructUrlWithUser(item.href);
                const isActive = pathname === item.href;

                return (
                    <Button key={item.label} variant="ghost" asChild className={cn("font-medium text-muted-foreground transition-colors hover:text-foreground", isActive && "text-foreground")}>
                        <Link href={finalHref}>
                            {item.label}
                        </Link>
                    </Button>
                );
            })}
            </nav>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
            <Button asChild className="hidden md:inline-flex">
                <Link href={constructUrlWithUser('/jobs/new')}>Post a Job</Link>
            </Button>
            <ThemeToggle />
            <UserNav />
        </div>
      </div>
    </header>
  );
}
