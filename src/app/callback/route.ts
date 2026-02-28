import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// This function handles GET requests to the /callback URL
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    // Exchange the temporary code for a user session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect the user to the main home page after a successful login
  return NextResponse.redirect(new URL('/', request.url));
}
