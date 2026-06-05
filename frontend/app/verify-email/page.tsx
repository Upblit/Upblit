"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AUTH_REFRESH_KEY, AUTH_TOKEN_KEY } from "@/lib/auth-storage";
import { useUserData } from "@/hooks/use-userData";

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/*$/, "");
}

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setMessage("Missing verification token.");
        return;
      }

      try {
        const response = await fetch(`${getApiBaseUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json().catch(() => null);

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message || data?.error || "Email verification failed.");
        }

        if (!data?.accessToken) {
          throw new Error("Verification succeeded but no token was returned.");
        }

        localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem(AUTH_REFRESH_KEY, data.refreshToken);
        }
        useUserData.getState().setToken(data.accessToken);
        router.replace("/dashboard");
      } catch (verificationError) {
        setMessage(verificationError instanceof Error ? verificationError.message : "Unable to verify email.");
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [router, token]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Upblit</p>
        <h1 className="mt-3 text-2xl font-semibold">Email confirmation</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">{message}</p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}