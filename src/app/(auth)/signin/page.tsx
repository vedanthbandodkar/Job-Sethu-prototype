// src/app/(auth)/signin/page.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The main component for the sign-in page.
 * This client component handles user authentication with Google via Supabase.
 */
export default function SignInPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignIn = async () => {
    // Initiate the OAuth sign-in flow with Google
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect the user to this URL after successful sign-in
        redirectTo: `${location.origin}/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 text-center shadow-2xl">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-3xl font-bold text-gray-100">Sign in to Job Sethu</CardTitle>
          <CardDescription className="mt-2 text-gray-400">
            Use your Google account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Button onClick={handleSignIn} className="w-full rounded-full bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            <span className="mr-3 text-2xl">G</span> Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
