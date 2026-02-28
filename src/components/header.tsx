// src/components/header.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface HeaderProps {
    session: Session | null;
}

/**
 * A client component for the application header. It displays
 * a dynamic login/logout button based on the user's authentication session.
 */
export default function Header({ session }: HeaderProps) {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const handleSignOut = async () => {
        // Sign out the user and refresh the page
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-gray-100">Job Sethu</span>
                </Link>
                <nav>
                    <ul className="flex items-center space-x-6">
                        {/* Conditionally render Login or Logout based on session status */}
                        {session ? (
                            <li>
                                <Button onClick={handleSignOut} size="sm" variant="ghost">Logout</Button>
                            </li>
                        ) : (
                            <li>
                                <Button asChild size="sm" variant="ghost">
                                    <Link href="/signin">Login</Link>
                                </Button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
