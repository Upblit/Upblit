import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

type AuthScreenProps = {
  mode: "login" | "signup";
  children: React.ReactNode;
};

const modeCopy = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in to your workspace",
    description:
      "Use email and password, or continue with GitHub and Google for faster access.",
    footerPrompt: "Need an account?",
    footerHref: "/signup",
    footerLabel: "Create one for free",
  },
  signup: {
    eyebrow: "Get started for free",
    title: "Create your Upblit account",
    description:
      "Email verification plus social sign‑in keeps onboarding simple without losing control of access.",
    footerPrompt: "Already have an account?",
    footerHref: "/login",
    footerLabel: "Sign in",
  },
} as const;

const features = [
  {
    icon: CheckCircle2,
    title: "Email verification",
    desc: "Secure mailbox ownership confirmed on every sign‑up.",
  },
  {
    icon: ShieldCheck,
    title: "GitHub & Google OAuth",
    desc: "One‑click social auth for you and your whole team.",
  },
  {
    icon: Zap,
    title: "Instant dashboard access",
    desc: "Get into your workspace in seconds, every time.",
  },
];

export function AuthScreen({ mode, children }: AuthScreenProps) {
  const copy = modeCopy[mode];

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#030712]">
      {/* ── Ambient gradient orbs ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-48 -top-48 h-[700px] w-[700px] rounded-full bg-cyan-500/[0.09] blur-[140px]" />
        <div className="absolute -right-48 top-1/3 h-[600px] w-[600px] rounded-full bg-violet-600/[0.07] blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-700/[0.06] blur-[120px]" />
      </div>

      {/* ── Dot‑grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative flex min-h-svh">
        {/* ════════════════════════════════
            LEFT PANEL – branding & features
            ════════════════════════════════ */}
        <aside className="hidden w-[52%] flex-col justify-between border-r border-white/[0.05] bg-white/[0.015] px-12 py-10 xl:px-16 lg:flex">
          {/* Logo */}
          <Link href="/" id="auth-logo-link">
            <Image
              src="/lanscapelogo.png"
              alt="Upblit"
              width={140}
              height={36}
              priority
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </Link>

          {/* Hero copy */}
          <div className="max-w-md space-y-10">
            <div className="space-y-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-cyan-400/75">
                {copy.eyebrow}
              </p>
              <h1 className="text-[2.75rem] font-bold leading-[1.08] tracking-tight text-white xl:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-xs text-[0.9rem] leading-relaxed text-white/45">
                {copy.description}
              </p>
            </div>

            {/* Feature cards */}
            <div className="flex flex-col gap-2.5">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="flex items-start gap-3.5 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 backdrop-blur-sm"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/8">
                      <Icon className="size-3.5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/90">
                        {f.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/40">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[0.7rem] text-white/20">
            © {new Date().getFullYear()} Upblit. All rights reserved.
          </p>
        </aside>

        {/* ════════════════════════════════
            RIGHT PANEL – auth form
            ════════════════════════════════ */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-14 sm:px-10">
          {/* Mobile header */}
          <div className="mb-8 flex w-full max-w-sm items-center justify-between lg:hidden">
            <Link href="/" id="auth-mobile-logo">
              <Image
                src="/lanscapelogo.png"
                alt="Upblit"
                width={120}
                height={32}
                priority
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full border border-white/10 text-white/45 hover:bg-white/5 hover:text-white"
            >
              <Link href="/" id="auth-back-home-mobile">
                Back to home
              </Link>
            </Button>
          </div>

          {/* Card */}
          <div className="relative w-full max-w-sm">
            {/* Glow halo */}
            <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-cyan-400/[0.06] blur-2xl" aria-hidden="true" />

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/60 backdrop-blur-2xl">
              {/* Top shimmer line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />

              <div className="p-7 sm:p-8">{children}</div>
            </div>
          </div>

          {/* Switch mode link */}
          <p className="mt-7 text-sm text-white/35">
            {copy.footerPrompt}{" "}
            <Link
              href={copy.footerHref}
              className="font-medium text-cyan-400 transition-colors hover:text-cyan-300"
              id="auth-switch-mode-link"
            >
              {copy.footerLabel}
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}