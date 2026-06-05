import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, MailIcon, MessageSquareIcon, RadioTowerIcon, TerminalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteNav } from "@/components/marketing/site-nav"
import { patreonUrl } from "@/lib/support-links"

export const metadata: Metadata = {
  title: "Contact | Upblit",
  description: "Contact Upblit for product questions, technical feedback, observability setup, or collaboration.",
  alternates: { canonical: "/contact" },
}

const contactPaths = [
  {
    icon: TerminalIcon,
    title: "Technical feedback",
    body: "Found a rough edge in logs, traces, SDKs, or project setup? Send the exact workflow and what felt off.",
    href: "mailto:hello@upblit.dev?subject=Technical%20feedback%20for%20Upblit",
    label: "Send feedback",
  },
  {
    icon: RadioTowerIcon,
    title: "Integration help",
    body: "Need help wiring an app, API key, telemetry stream, or document tenant into a workspace?",
    href: "mailto:hello@upblit.dev?subject=Upblit%20integration%20help",
    label: "Ask about setup",
  },
  {
    icon: MessageSquareIcon,
    title: "General contact",
    body: "Questions, collaboration, docs issues, or anything that does not fit neatly into a category.",
    href: "mailto:hello@upblit.dev?subject=Contact%20Upblit",
    label: "Email Upblit",
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-svh bg-[#08090b] text-white">
      <SiteNav />

      <section className="px-5 pb-20 pt-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-sm text-white/42">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ArrowRightIcon className="size-3" />
            <span>Contact</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="text-sm font-medium text-[#7dd3fc]">Contact</p>
              <h1 className="mt-3 font-heading text-5xl font-bold leading-tight tracking-normal text-white sm:text-6xl">
                Send the signal, not a sales form.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/58">
                Upblit is still engineering-led. The useful messages are specific: what you tried, what broke, what felt slow,
                or what integration you want to see next.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 gap-2 rounded-md bg-[#087f9c] px-4 text-white hover:bg-[#0aa1c4]">
                  <a href="mailto:hello@upblit.dev">
                    <MailIcon className="size-4" />
                    hello@upblit.dev
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-md border-white/[0.12] bg-white/[0.03] px-4 text-white hover:bg-white/[0.08]">
                  <a href={patreonUrl} target="_blank" rel="noreferrer">
                    Support on Patreon
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-md border-white/[0.12] bg-white/[0.03] px-4 text-white hover:bg-white/[0.08]">
                  <Link href="https://github.com/Upblit/Upblit">Open GitHub</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {contactPaths.map((item) => (
                <article key={item.title} className="rounded-lg border border-white/[0.08] bg-[#101318] p-5 transition hover:-translate-y-0.5 hover:border-[#07a1c1]/40">
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#07a1c1]/20 bg-[#07a1c1]/10">
                      <item.icon className="size-5 text-[#7dd3fc]" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-semibold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/56">{item.body}</p>
                      <a href={item.href} className="mt-4 inline-flex items-center gap-2 text-sm text-[#7dd3fc] hover:text-white">
                        {item.label}
                        <ArrowRightIcon className="size-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
