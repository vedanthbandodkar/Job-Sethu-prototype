
"use client";

import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { Briefcase } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { useUser } from '@/firebase';

export function AppHeader() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg font-bold">Job Sethu</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
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
            {user && (
              <Button asChild className="hidden md:inline-flex">
                  <Link href='/jobs/new'>Post a Job</Link>
              </Button>
            )}
            <ThemeToggle />
            <UserNav />
        </div>
      </div>
    </header>
  );
}
