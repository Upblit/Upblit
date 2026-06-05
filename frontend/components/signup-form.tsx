"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";

import { AUTH_REFRESH_KEY, AUTH_TOKEN_KEY } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/use-userData";

/* ── helpers ────────────────────────────────────────────────── */

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/*$/, "");
}

function getGithubAuthUrl() {
  const backendBase = getApiBaseUrl();
  if (!backendBase || !/^https?:\/\//i.test(backendBase)) {
    return "/oauth2/authorization/github";
  }
  return new URL("/oauth2/authorization/github", backendBase).toString();
}

function getGoogleAuthUrl() {
  const backendBase = getApiBaseUrl();
  if (!backendBase || !/^https?:\/\//i.test(backendBase)) {
    return "/oauth2/authorization/google";
  }
  return new URL("/oauth2/authorization/google", backendBase).toString();
}

/* ── icons ──────────────────────────────────────────────────── */

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C6.47 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.09.68-.22.68-.5 0-.25-.01-1.08-.01-1.96-2.78.62-3.37-1.2-3.37-1.2-.46-1.19-1.12-1.5-1.12-1.5-.92-.64.07-.63.07-.63 1.02.07 1.56 1.06 1.56 1.06.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.2 9.2 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.64 1.03 2.76 0 3.95-2.33 4.82-4.56 5.08.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .28.18.6.69.5A10.28 10.28 0 0 0 22 12.26C22 6.58 17.53 2 12 2Z" />
    </svg>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ── component ──────────────────────────────────────────────── */

export function SignupForm({
  className,
  initialError,
  ...props
}: React.ComponentProps<"form"> & { initialError?: string | null }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to create your account."
        );
      }

      if (data?.accessToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem(AUTH_REFRESH_KEY, data.refreshToken);
        }
        useUserData.getState().setToken(data.accessToken);
        router.replace("/dashboard");
        return;
      }

      setSuccess(
        "Check your inbox to verify your email. The confirmation link will finish sign-in."
      );
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "Unable to create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignup() {
    setError(null);
    setSuccess(null);
    setIsGoogleLoading(true);
    try {
      window.location.assign(getGoogleAuthUrl());
    } catch (oauthError) {
      setError(
        oauthError instanceof Error
          ? oauthError.message
          : "Unable to continue with Google."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function handleGithubSignup() {
    setError(null);
    setSuccess(null);
    setIsGithubLoading(true);
    window.location.assign(getGithubAuthUrl());
  }

  /* ── shared input classes ─────────────────────────────────── */
  const inputCls =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none ring-0 transition-all duration-150 focus:border-cyan-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-400/[0.18] disabled:opacity-50";

  const labelCls =
    "block text-[0.7rem] font-semibold uppercase tracking-widest text-white/50";

  return (
    <form
      id="signup-form"
      className={cn("flex flex-col gap-4", className)}
      onSubmit={handleSignup}
      {...props}
    >
      {/* ── Error banner ── */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-3"
        >
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          </span>
          <p className="text-sm leading-snug text-red-400">{error}</p>
        </div>
      )}

      {/* ── Success banner ── */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-3.5 py-3"
        >
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <p className="text-sm leading-snug text-emerald-400">{success}</p>
        </div>
      )}

      {/* ── Full name ── */}
      <div className="space-y-1.5">
        <label htmlFor="signup-name" className={labelCls}>
          Full name
        </label>
        <input
          id="signup-name"
          name="name"
          type="text"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* ── Email ── */}
      <div className="space-y-1.5">
        <label htmlFor="signup-email" className={labelCls}>
          Email address
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
        <p className="text-[0.72rem] leading-relaxed text-white/30">
          We&apos;ll send a verification link so you can finish sign-up securely.
        </p>
      </div>

      {/* ── Password ── */}
      <div className="space-y-1.5">
        <label htmlFor="signup-password" className={labelCls}>
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
        <p className="text-[0.72rem] text-white/30">Must be at least 8 characters.</p>
      </div>

      {/* ── Confirm password ── */}
      <div className="space-y-1.5">
        <label htmlFor="signup-confirm-password" className={labelCls}>
          Confirm password
        </label>
        <input
          id="signup-confirm-password"
          name="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* ── Primary CTA ── */}
      <button
        id="signup-submit-btn"
        type="submit"
        disabled={isSubmitting}
        className="relative mt-1 flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:brightness-110 hover:shadow-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Mail className="size-4" />
        )}
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      {/* ── Divider ── */}
      <div className="relative flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-white/[0.07]" />
        <span className="text-[0.7rem] font-medium text-white/25">or</span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      {/* ── OAuth buttons ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          id="signup-github-btn"
          type="button"
          onClick={handleGithubSignup}
          disabled={isGithubLoading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-white/70 transition-all duration-150 hover:bg-white/[0.09] hover:text-white disabled:opacity-50"
        >
          {isGithubLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GitHubMark className="size-4" />
          )}
          <span>{isGithubLoading ? "…" : "GitHub"}</span>
        </button>

        <button
          id="signup-google-btn"
          type="button"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-white/70 transition-all duration-150 hover:bg-white/[0.09] hover:text-white disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleMark className="size-4" />
          )}
          <span>{isGoogleLoading ? "…" : "Google"}</span>
        </button>
      </div>

    </form>
  );
}
