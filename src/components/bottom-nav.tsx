"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, LayoutDashboard, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import * as React from 'react';

export function BottomNavBar() {
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
    { href: constructUrl("/"), label: "Home", icon: Home },
    { href: constructUrl("/dashboard"), label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs/new", label: "Post", icon: PlusCircle, isButton: true },
    { href: constructUrl("/profile"), label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container grid h-16 grid-cols-4 items-center">
        {navItems.map((item) => {
          if (item.isButton) {
            return (
              <div key={item.href} className="flex justify-center">
                 <Button asChild size="lg" className="h-12 w-12 rounded-full shadow-lg">
                    <Link href={item.href}>
                        <item.icon className="h-6 w-6"/>
                        <span className="sr-only">{item.label}</span>
                    </Link>
                 </Button>
              </div>
            )
          }

          const isActive = pathname === item.href.split('?')[0];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
