"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AUTH_REFRESH_KEY, AUTH_TOKEN_KEY, LEGACY_TOKEN_KEY } from "@/lib/auth-storage";
import { useUserData } from "@/hooks/use-userData";

function OAuthInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const code = searchParams.get("code");
  const refresh = searchParams.get("refresh");
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(LEGACY_TOKEN_KEY, token);

        if (refresh) {
          localStorage.setItem(AUTH_REFRESH_KEY, refresh);
        }

        useUserData.getState().setToken(token);
        router.replace("/dashboard");
        return;
      }

      if (code) {
        setMessage("This callback no longer uses code-based auth. Please return to sign in.");
        return;
      }

      setMessage("No session was found. Please return to sign in.");
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [code, refresh, router, token]);

  return <div>{message}</div>;
}

export default function OAuth() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OAuthInner />
    </Suspense>
  );
}
