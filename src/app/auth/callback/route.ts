import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType, VerifyOtpParams } from "@supabase/supabase-js";
import { createClientForRouteHandler } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/";
  const responseUrl = new URL(next, url.origin);

  const supabase = createClientForRouteHandler();
  let authError: string | null = null;

  const code = url.searchParams.get("code");
  const accessToken = url.searchParams.get("access_token");
  const refreshToken = url.searchParams.get("refresh_token");
  const tokenHash = url.searchParams.get("token_hash");
  const typeParam = url.searchParams.get("type") as VerifyOtpParams["type"] | null;
  const emailOtpTypes: EmailOtpType[] = ["magiclink", "signup", "recovery", "email_change", "email"];

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      authError = error.message;
      console.error("Supabase exchange error", error.message);
    }
  } else if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      authError = error.message;
      console.error("Supabase setSession error", error.message);
    }
  } else if (tokenHash && typeParam && emailOtpTypes.includes(typeParam as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeParam as EmailOtpType,
    });
    if (error) {
      authError = error.message;
      console.error("Supabase verifyOtp error", error.message);
    }
  } else {
    const errorDescription = url.searchParams.get("error_description");
    if (errorDescription) {
      authError = errorDescription;
      console.error("Supabase callback error", errorDescription);
    }
  }

  const response = NextResponse.redirect(responseUrl);

  if (authError) {
    response.cookies.set({
      name: "sb-auth-error",
      value: encodeURIComponent(authError),
      path: "/",
      maxAge: 10,
    });
  }

  return response;
}

