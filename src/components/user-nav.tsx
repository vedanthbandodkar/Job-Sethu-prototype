
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Check, CreditCard, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { getUsers, getUserById } from '@/lib/data';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function UserNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userId = useMemo(() => {
    if (!isClient) return 'user-5'; // Default for SSR
    return searchParams.get('userId') || 'user-5';
  }, [searchParams, isClient]);

  useEffect(() => {
    if (!isClient) return;

    let isMounted = true;
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const [userData, allUsersData] = await Promise.all([
              getUserById(userId),
              getUsers()
            ]);
            if (isMounted) {
                setUser(userData);
                setAllUsers(allUsersData);
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    }
    fetchUserData();

    return () => { isMounted = false; };
  }, [userId, isClient]);

  if (!isClient || loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!user) {
    return (
        <Button asChild>
            <Link href="/login">Login</Link>
        </Button>
    )
  }
  
  const constructUrl = (baseHref: string, newUserId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('userId', newUserId);
    const cleanParams = new URLSearchParams();
    cleanParams.set('userId', newUserId);
    if (searchParams.has('tab')) {
      cleanParams.set('tab', searchParams.get('tab')!);
    }

    return `${baseHref}?${cleanParams.toString()}`;
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl} alt={user.name ?? ""} data-ai-hint="person avatar" />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/profile?userId=${user.id}`}>
              <UserIcon />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            <DropdownMenuLabel>Switch profile</DropdownMenuLabel>
            {allUsers.map(profile => (
                 <DropdownMenuItem key={profile.id} asChild>
                    <Link href={constructUrl(pathname, profile.id)}>
                        <Avatar className="mr-2 h-5 w-5">
                          <AvatarImage src={profile.avatarUrl} alt={profile.name ?? ""} />
                          <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{profile.name}</span>
                        {profile.id === user.id && <Check className="ml-auto h-4 w-4" />}
                    </Link>
                 </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/login">
            <LogOut />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
