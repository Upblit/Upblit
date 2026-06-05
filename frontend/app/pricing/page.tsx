import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/marketing/site-footer"
import { loginUrl, SiteNav } from "@/components/marketing/site-nav"
import { patreonSubscribeUrl } from "@/lib/support-links"

export const metadata: Metadata = {
  title: "Pricing | Upblit",
  description: "Upblit pricing for teams that want observability, retention, and managed access.",
  alternates: { canonical: "/pricing" },
}

const tiers = [
  {
    name: "Pirate",
    price: "Free",
    note: "For individual projects, prototypes, and early validation.",
    features: ["1 workspace", "3 applications", "7-day telemetry retention", "Community support"],
    badge: "Starter",
    cta: "Start free",
  },
  {
    name: "Supernova",
    price: "$3/month",
    note: "Managed through Patreon for teams shipping real services.",
    features: ["3 workspaces", "20 applications", "30-day telemetry retention", "AI docs upload", "Automatic plan sync"],
    featured: true,
    badge: "Most popular",
    cta: "Continue with Patreon",
  },
  {
    name: "Warlord",
    price: "Contact",
    note: "For larger teams that need custom limits and onboarding.",
    features: ["Unlimited projects", "100 applications", "90-day telemetry retention", "Scoped API keys", "Priority setup help"],
    badge: "Custom",
    cta: "Contact sales",
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-svh bg-[#08090b] text-white">
      <SiteNav />

      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-3xl" />
          <div className="absolute right-[-120px] top-[240px] h-[420px] w-[420px] rounded-full bg-blue-500/[0.08] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-sm text-white/42">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ArrowRightIcon className="size-3" />
            <span>Pricing</span>
          </nav>

          <div className="relative max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7dd3fc]">Pricing</p>
            <h1 className="mt-3 font-heading text-5xl font-bold leading-tight tracking-normal text-white sm:text-6xl">
              Clear pricing for telemetry teams that need real access control.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
              Start free, upgrade to a Patreon-backed Supernova membership, or talk to us when you need custom scale.
              Plan changes are synced automatically so billing and access stay aligned.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/58">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">Fast onboarding</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">Automatic upgrades and demotions</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">Retention by plan</span>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.name}
                className={
                  tier.featured
                    ? "flex h-full flex-col rounded-3xl border border-[#07a1c1]/45 bg-[#0f1b20] p-6 shadow-2xl shadow-[#087f9c]/10 sm:p-7"
                    : "flex h-full flex-col rounded-3xl border border-white/[0.08] bg-[#101318] p-6 sm:p-7"
                }
              >
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-heading text-4xl font-semibold leading-none text-white sm:text-5xl">
                      {tier.name}
                    </h2>
                    <span className={tier.featured ? "rounded-full bg-[#07a1c1]/15 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#7dd3fc]" : "rounded-full border border-white/[0.08] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/45"}>
                      {tier.badge}
                    </span>
                  </div>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="font-mono text-xl font-medium text-white/72 sm:text-2xl">
                      {tier.price}
                    </span>
                    {tier.name === "Pirate" ? (
                      <span className="pb-1 text-xs text-white/42 sm:text-sm">/ month</span>
                    ) : tier.name === "Supernova" ? (
                      <span className="pb-1 text-xs text-white/42 sm:text-sm">subscription</span>
                    ) : (
                      <span className="pb-1 text-xs text-white/42 sm:text-sm">custom</span>
                    )}
                  </div>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-white/56">{tier.note}</p>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm text-white/68">
                        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild className={tier.featured ? "mt-7 h-11 w-full rounded-full bg-[#087f9c] text-white hover:bg-[#0aa1c4]" : "mt-7 h-11 w-full rounded-full bg-white/[0.06] text-white hover:bg-white/[0.1]"}>
                  {tier.name === "Warlord" ? (
                    <a href="mailto:contact@upblit.dev">Contact sales</a>
                  ) : tier.name === "Supernova" ? (
                    <a href={patreonSubscribeUrl}>
                      {tier.cta}
                    </a>
                  ) : (
                    <Link href={loginUrl}>{tier.cta}</Link>
                  )}
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-sm leading-6 text-white/58">
            Need a different retention window or more than one team? Start with Supernova, then move to Warlord when you want custom limits and support.
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
