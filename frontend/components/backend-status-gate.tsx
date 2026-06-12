"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangleIcon, RefreshCwIcon, ServerOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthInitializer } from "@/components/auth-initializer";

const CHECK_TIMEOUT_MS = 4000;

type BackendStatus = "checking" | "online" | "offline";

const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/auth"];

function isProtectedRoute(pathname: string | null) {
  if (!pathname) return false;

  return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getBackendUrl() {
  return (process.env.NEXT_PUBLIC_API_HEALTH_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/*$/, "");
}

async function canReachBackend() {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return false;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    // Any HTTP response means the backend process and CORS path are reachable.
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function MaintenanceScreen({ onRetry, isChecking }: { onRetry: () => void; isChecking: boolean }) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-5 text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(7,161,193,0.12),transparent_34%),linear-gradient(180deg,rgba(8,9,11,0),#08090b_78%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
      </div>

      <section className="relative w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-lg border border-red-300/20 bg-red-300/10">
          <ServerOffIcon className="size-6 text-red-200" />
        </div>

        <div className="mt-7">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-200">
            <AlertTriangleIcon className="size-4" />
            Backend unavailable
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
            Upblit is in maintenance mode.
          </h1>
          <p className="mt-4 text-sm leading-7 text-foreground/58">
            The frontend cannot reach the backend at the moment, so sign-in and dashboard access are disabled until the API
            responds again.
          </p>
        </div>

        <div className="mt-7 rounded-lg border border-border bg-card p-4 font-mono text-xs text-foreground/48">
          <div className="flex items-center justify-between gap-4">
            <span>health target</span>
            <span className="truncate text-foreground/68">{getBackendUrl() || "not configured"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span>frontend state</span>
            <span className="text-red-200">login blocked</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={onRetry}
          disabled={isChecking}
          className="mt-7 h-10 gap-2 rounded-md bg-[#087f9c] px-4 text-foreground hover:bg-[#0aa1c4]"
        >
          <RefreshCwIcon className={isChecking ? "size-4 animate-spin" : "size-4"} />
          Retry connection
        </Button>
      </section>
    </main>
  );
}

function CheckingScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#08090b] px-5 text-foreground">
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground/58">
        Checking backend connection...
      </div>
    </main>
  );
}

export function BackendStatusGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const pathname = usePathname();
  const shouldCheckBackend = isProtectedRoute(pathname);

  const checkStatus = useCallback(async (showChecking = false) => {
    if (showChecking) setStatus("checking");
    setStatus((await canReachBackend()) ? "online" : "offline");
  }, []);

  useEffect(() => {
    if (!shouldCheckBackend) {
      setStatus("online");
      return;
    }

    const initialCheckId = window.setTimeout(() => {
      void checkStatus(true);
    }, 0);

    const intervalId = window.setInterval(() => {
      void checkStatus(false);
    }, 30000);

    return () => {
      window.clearTimeout(initialCheckId);
      window.clearInterval(intervalId);
    };
  }, [checkStatus, shouldCheckBackend]);

  if (!shouldCheckBackend) {
    return (
      <>
        <AuthInitializer />
        {children}
      </>
    );
  }

  if (status === "checking") {
    return <CheckingScreen />;
  }

  if (status === "offline") {
    return <MaintenanceScreen onRetry={() => void checkStatus(true)} isChecking={false} />;
  }

  return (
    <>
      <AuthInitializer />
      {children}
    </>
  );
}
