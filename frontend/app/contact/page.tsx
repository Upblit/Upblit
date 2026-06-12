import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, GitBranchIcon, MailIcon, MessageSquareIcon, RadioTowerIcon, TerminalIcon } from "lucide-react"

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
    body: "Send the exact workflow, trace, SDK, or dashboard state that felt wrong.",
    href: "mailto:hello@upblit.dev?subject=Technical%20feedback%20for%20Upblit",
    label: "Send feedback",
  },
  {
    icon: RadioTowerIcon,
    title: "Integration help",
    body: "Ask about API keys, telemetry ingest, project setup, or tenant-scoped documents.",
    href: "mailto:hello@upblit.dev?subject=Upblit%20integration%20help",
    label: "Ask about setup",
  },
  {
    icon: MessageSquareIcon,
    title: "Collaboration",
    body: "Docs, open-source work, product ideas, or anything that should become an issue.",
    href: "mailto:hello@upblit.dev?subject=Contact%20Upblit",
    label: "Email Upblit",
  },
]

const triageRows = [
  ["source", "hello@upblit.dev"],
  ["route", "contact / technical-feedback"],
  ["expected", "workflow, trace id, screenshot, logs"],
  ["owner", "project maintainer"],
]

function ContactScreenshot() {
  return (
    <div className="border border-[#1f1f1f] bg-[#111] font-mono">
      <div className="flex items-center justify-between border-b border-[#1f1f1f] px-3 py-2 text-xs">
        <span className="flex items-center gap-2 text-[#a3a3a3]">
          <MailIcon className="size-4 text-[#22d3ee]" />
          support triage snapshot
        </span>
        <span className="text-[#525252]">incoming</span>
      </div>
      <div className="grid gap-3 p-3 lg:grid-cols-[1fr_0.95fr]">
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <div className="mb-3 text-xs uppercase text-[#525252]">message shape</div>
          <div className="space-y-2">
            {triageRows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[92px_1fr] gap-3 border-b border-[#1f1f1f] pb-2 text-xs last:border-b-0 last:pb-0">
                <span className="text-[#525252]">{label}</span>
                <span className="truncate text-[#a3a3a3]">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <div className="mb-3 text-xs uppercase text-[#525252]">dashboard context</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between border border-[#1f1f1f] px-2 py-2">
              <span className="text-[#737373]">trace_id</span>
              <span className="text-[#22d3ee]">tr_8f13a9</span>
            </div>
            <div className="flex items-center justify-between border border-[#1f1f1f] px-2 py-2">
              <span className="text-[#737373]">service</span>
              <span className="text-[#f5f5f5]">payment-worker</span>
            </div>
            <div className="h-16 border border-[#1f1f1f] p-2">
              <div className="h-2 w-[84%] bg-[#22d3ee]/35" />
              <div className="mt-2 h-2 w-[54%] bg-amber-400/35" />
              <div className="mt-2 h-2 w-[72%] bg-red-400/35" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <main className="min-h-svh bg-[#0a0a0a] text-[#f5f5f5]">
      <SiteNav />

      <section className="px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-xs uppercase text-[#525252]">
            <Link href="/" className="hover:text-[#f5f5f5]">Home</Link>
            <ArrowRightIcon className="size-3" />
            <span>Contact</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase text-[#22d3ee]">contact</p>
              <h1 className="mt-4 max-w-3xl font-mono text-4xl font-black leading-[0.98] text-[#f5f5f5] sm:text-6xl">
                Send the signal, not a sales form.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#a3a3a3] sm:text-base">
                The useful messages are specific: what you tried, what broke, what felt slow, or which integration should be less awkward.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="mailto:hello@upblit.dev" className="inline-flex h-10 items-center gap-2 border border-[#22d3ee] bg-[#22d3ee] px-3 font-mono text-sm font-semibold text-[#0a0a0a] hover:bg-[#67e8f9]">
                  hello@upblit.dev <MailIcon className="size-4" />
                </a>
                <a href="https://github.com/Upblit/Upblit" className="inline-flex h-10 items-center gap-2 border border-[#1f1f1f] bg-[#111] px-3 font-mono text-sm text-[#a3a3a3] hover:text-[#f5f5f5]">
                  GitHub <GitBranchIcon className="size-4" />
                </a>
              </div>
            </div>

            <ContactScreenshot />
          </div>
        </div>
      </section>

      <section className="border-y border-[#1f1f1f] bg-[#0d0d0d] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-3 lg:grid-cols-3">
          {contactPaths.map((item) => (
            <article key={item.title} className="border border-[#1f1f1f] bg-[#111] p-4">
              <item.icon className="size-5 text-[#22d3ee]" />
              <h2 className="mt-5 font-mono text-xl font-black text-[#f5f5f5]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#a3a3a3]">{item.body}</p>
              <a href={item.href} className="mt-5 inline-flex items-center gap-2 font-mono text-sm text-[#22d3ee] hover:text-[#67e8f9]">
                {item.label}
                <ArrowRightIcon className="size-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-[#525252]">support the work</p>
            <h2 className="mt-2 font-mono text-2xl font-black text-[#f5f5f5]">Prefer to back the project directly?</h2>
          </div>
          <a href={patreonUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 w-fit items-center gap-2 border border-[#1f1f1f] bg-[#111] px-3 font-mono text-sm text-[#a3a3a3] hover:border-[#22d3ee] hover:text-[#f5f5f5]">
            Support on Patreon <ArrowRightIcon className="size-4 text-[#22d3ee]" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
