"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  BracesIcon,
  CircleDotIcon,
  Code2Icon,
  DatabaseZapIcon,
  FileSearchIcon,
  GitBranchIcon,
  KeyRoundIcon,
  Layers3Icon,
  LockKeyholeIcon,
  RadioTowerIcon,
  TerminalIcon,
} from "lucide-react"

import { useUserData } from "@/hooks/use-userData"
import { loginUrl, SiteNav } from "@/components/marketing/site-nav"
import { SiteFooter } from "@/components/marketing/site-footer"
import CardSwap, { Card } from "@/components/CardSwap/CardSwap"
import SoftAurora from "@/components/SoftAurora/SoftAurora"

const logs = [
  { at: "02:13:41.092", level: "warn", svc: "checkout-api", msg: "p95 crossed 900ms on POST /orders", trace: "tr_8f13a9" },
  { at: "02:13:41.118", level: "info", svc: "gateway", msg: "retry budget at 62 percent", trace: "tr_8f13a9" },
  { at: "02:13:41.204", level: "error", svc: "payment-worker", msg: "stripe.capture timeout after 3 attempts", trace: "tr_8f13a9" },
  { at: "02:13:41.377", level: "match", svc: "ai-runbook", msg: "matched runbook: payment queue saturation", trace: "doc_042" },
  { at: "02:13:42.010", level: "info", svc: "queue", msg: "depth=1840 workers=12 saturation=0.91", trace: "mt_19c2" },
]

const spans = [
  { name: "POST /orders", ms: 941, offset: 0, width: 92, status: "500" },
  { name: "auth.session.read", ms: 18, offset: 5, width: 12, status: "ok" },
  { name: "inventory.reserve", ms: 73, offset: 14, width: 18, status: "ok" },
  { name: "payment.capture", ms: 704, offset: 31, width: 63, status: "timeout" },
  { name: "queue.retry.schedule", ms: 88, offset: 66, width: 20, status: "ok" },
]

const metrics = [
  ["error_rate", "4.8%", "+3.9"],
  ["p95_latency", "941ms", "+312"],
  ["queue_depth", "1840", "+620"],
  ["affected_routes", "3", "new"],
]

const runbook = [
  "incident signature: payment capture timeout",
  "first check: worker saturation > 0.85",
  "next action: drain retry queue before scaling api",
  "owner: payments-oncall",
]

const architectureNodes = [
  { icon: BracesIcon, title: "SDKs", body: "Express, Python, Go, and Spring services emit spans, metrics, logs, and app identity." },
  { icon: KeyRoundIcon, title: "API keys", body: "Scoped keys keep ingest boundaries clean across environments and applications." },
  { icon: DatabaseZapIcon, title: "Ingest pipeline", body: "Telemetry is normalized with project, organization, trace, and application context." },
  { icon: RadioTowerIcon, title: "Review cockpit", body: "Engineers inspect logs, waterfalls, runbooks, and incident state from one surface." },
]

const featureRows = [
  {
    eyebrow: "logs",
    title: "Search production logs without losing trace context.",
    body: "Rows keep the service, route, severity, payload, and trace ID visible. Responders can scan the system state without opening a stack of detached dashboards.",
    lines: ["level=warn service=checkout-api route=/orders trace=tr_8f13a9", "level=error service=payment-worker op=stripe.capture", "level=match service=ai-runbook doc=payment-queue-saturation"],
  },
  {
    eyebrow: "traces",
    title: "Waterfalls that show where the request bent.",
    body: "Span timing, status, and parent-child relationships sit beside the logs that explain them. Latency stops being an abstract chart.",
    lines: ["POST /orders 941ms status=500", "payment.capture 704ms status=timeout", "queue.retry.schedule 88ms status=ok"],
  },
  {
    eyebrow: "ai docs under development",
    title: "Runbook matches beside the failing span.",
    body: "Operational documents are searched inside tenant boundaries and surfaced as incident context, not as a general-purpose chatbot.",
    lines: ["matched doc: payment queue saturation", "confidence=0.89 tenant=acme-prod", "suggested owner: payments-oncall"],
  },
]

const engineeringControls = [
  "GitHub and Google OAuth sign-in",
  "Scoped application API keys",
  "Organization and project boundaries",
  "Trace-aware log context",
  "Tenant-scoped AI documents",
  "Explicit document deletion",
  "Backend-owned token refresh",
  "Audit-friendly event shapes",
]

const codeLines = [
  "import { upblit } from '@upblit/sdk'",
  "const span = upblit.trace('checkout.create')",
  "logger.warn('payment latency high', { traceId })",
  "await upblit.metric('queue.depth', depth)",
  "await span.end({ status: 'retry_scheduled' })",
]

function StatusPill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "cyan" | "amber" | "red" | "muted" }) {
  const color =
    tone === "cyan" ? "border-[#22d3ee]/35 text-[#22d3ee]" :
      tone === "amber" ? "border-amber-500/35 text-amber-400" :
        tone === "red" ? "border-red-500/35 text-red-400" :
          "border-[#1f1f1f] text-[#737373]"

  return <span className={`border px-2 py-1 font-mono text-[11px] uppercase tracking-wide ${color}`}>{children}</span>
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-xl lg:max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#22d3ee]">{eyebrow}</p>
      <h2 className="mt-3 font-mono text-3xl font-black leading-tight text-[#f5f5f5] sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-6 text-[#a3a3a3] sm:text-base">{body}</p>
    </div>
  )
}

function TraceRail() {
  return (
    <div className="border border-[#1f1f1f] bg-[#111] p-3 font-mono">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-[#525252]">trace waterfall</span>
        <StatusPill tone="red">regressed</StatusPill>
      </div>
      <div className="space-y-2">
        {spans.map((span) => (
          <div key={span.name} className="grid grid-cols-[150px_1fr_56px] items-center gap-3 text-xs">
            <span className="truncate text-[#a3a3a3]">{span.name}</span>
            <div className="relative h-5 border border-[#1f1f1f] bg-[#0a0a0a]">
              <div
                className="absolute top-[3px] h-[12px] border border-[#22d3ee]/40 bg-[#22d3ee]/15"
                style={{ left: `${span.offset}%`, width: `${span.width}%` }}
              />
            </div>
            <span className={span.status === "timeout" || span.status === "500" ? "text-red-400" : "text-[#737373]"}>{span.ms}ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LogTable() {
  return (
    <div className="overflow-x-auto border border-[#1f1f1f] bg-[#111] font-mono">
      <div className="grid min-w-[760px] grid-cols-[92px_72px_130px_1fr_88px] border-b border-[#1f1f1f] px-3 py-2 text-[11px] uppercase tracking-wide text-[#525252]">
        <span>time</span><span>level</span><span>service</span><span>message</span><span>context</span>
      </div>
      {logs.map((log) => (
        <div key={`${log.at}-${log.svc}`} className="grid min-w-[760px] grid-cols-[92px_72px_130px_1fr_88px] border-b border-[#1f1f1f] px-3 py-2 text-xs transition-colors last:border-b-0 hover:bg-[#161616]">
          <span className="text-[#525252]">{log.at}</span>
          <span className={log.level === "error" ? "text-red-400" : log.level === "warn" ? "text-amber-400" : log.level === "match" ? "text-[#22d3ee]" : "text-[#737373]"}>
            {log.level}
          </span>
          <span className="text-[#a3a3a3]">{log.svc}</span>
          <span className="truncate text-[#f5f5f5]">{log.msg}</span>
          <span className="text-[#525252]">{log.trace}</span>
        </div>
      ))}
    </div>
  )
}

function IncidentCockpit() {
  return (
    <section id="dashboard" className="border-y border-[#1f1f1f] bg-[#0d0d0d] px-4 py-16 lg:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border border-[#1f1f1f] bg-[#111] px-3 py-2 font-mono">
          <div className="flex min-w-0 items-center gap-3">
            <CircleDotIcon className="size-4 animate-pulse text-[#22d3ee]" />
            <span className="text-sm text-[#f5f5f5]">incident cockpit / acme-prod / checkout</span>
          </div>
          <div className="flex gap-2">
            <StatusPill tone="cyan">live ingest</StatusPill>
            <StatusPill tone="amber">sev2</StatusPill>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <LogTable />
          <div className="grid gap-3">
            <TraceRail />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-[#1f1f1f] bg-[#111] p-3 font-mono">
                <div className="mb-3 text-xs uppercase tracking-wide text-[#525252]">metrics</div>
                <div className="grid gap-2">
                  {metrics.map(([label, value, delta]) => (
                    <div key={label} className="flex items-center justify-between border border-[#1f1f1f] bg-[#0a0a0a] px-2 py-2 text-xs">
                      <span className="text-[#737373]">{label}</span>
                      <span className="text-[#f5f5f5]">{value}</span>
                      <span className="text-[#22d3ee]">{delta}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div id="ai-docs" className="border border-[#1f1f1f] bg-[#111] p-3 font-mono">
                <div className="mb-3 text-xs uppercase tracking-wide text-[#525252]">runbook match</div>
                <div className="space-y-2">
                  {runbook.map((line) => (
                    <p key={line} className="border-l border-[#22d3ee]/45 pl-2 text-xs leading-5 text-[#a3a3a3]">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TerminalHero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="absolute inset-0 z-0">
        <SoftAurora
          speed={0.9}
          scale={2.2}
          brightness={1.1}
          color1="#b0c2e0"
          color2="#06B6D4"
          noiseFrequency={1.5}
          noiseAmplitude={3.5}
          bandHeight={0.65}
          bandSpread={0.7}
          octaveDecay={0.16}
          layerOffset={0}
          colorSpeed={0.5}
          enableMouseInteraction
          mouseInfluence={0.1}
        />
      </div>

<div className="relative z-10 mx-auto flex max-w-xl lg:max-w-3xl flex-col items-center text-center pointer-events-auto">        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#22d3ee] z-10 ">upblit observability</p>
        <h1 className="mt-4 z-10 font-mono text-4xl font-black leading-[0.98] text-[#f5f5f5] sm:text-6xl lg:text-7xl">
          Read the incident, not five dashboards.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-[#a3a3a3] sm:text-base">
          One surface for logs, traces, metrics, and incident context. No dashboards you have to configure.
        </p>
        <div className="mt-7 flex items-center gap-3">
          <Link href={loginUrl} className="inline-flex h-10 items-center gap-2 border border-[#22d3ee] bg-[#22d3ee] px-4 font-mono text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#67e8f9] pointer-events-auto">
            Sign in <ArrowRightIcon className="size-4" />
          </Link>
          <Link href="/docs" className="inline-flex h-10 items-center border border-[#1f1f1f] bg-[#111]/60 px-4 font-mono text-sm text-[#a3a3a3] transition-colors hover:border-[#333] hover:text-[#f5f5f5] pointer-events-auto">
            Docs
          </Link>
        </div>
      </div>
    </section>
  )
}

function ShowcaseSection() {
  return (
    <section className="overflow-x-hidden px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#22d3ee]">product tour</p>
        <h2 className="font-mono text-2xl font-black text-[#f5f5f5] sm:text-3xl">See it on real production data.</h2>
        <div className="mt-8 flex w-full justify-center lg:justify-end">
          <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
            <CardSwap
              cardDistance={40}
              verticalDistance={40}
              delay={6500}
              pauseOnHover
              width={360}
              height={260}
            >
              <Card>
                <img src="/showcase/Screenshot 2026-06-12 195843.png" alt="Logs and traces in the incident cockpit" />
              </Card>
              <Card>
                <img src="/showcase/Screenshot 2026-06-12 195902.png" alt="Trace waterfall view" />
              </Card>
              <Card>
                <img src="/showcase/Screenshot 2026-06-12 210421.png" alt="AI runbook matching" />
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 grid-cols-1 gap-10 xl:grid-cols-[0.7fr_1.3fr] lg:items-start">
        <SectionHeader
          eyebrow="architecture"
          title="Runtime signal to incident review."
          body="Upblit is still organized around the production hierarchy teams already use: organizations, projects, applications, API keys, ingest, and review."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {architectureNodes.map((node) => (
            <article key={node.title} className="border border-[#1f1f1f] bg-[#111] p-4 transition-colors hover:border-[#2a2a2a]">
              <node.icon className="size-5 text-[#22d3ee]" />
              <h3 className="mt-5 font-mono text-lg font-bold text-[#f5f5f5]">{node.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">{node.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureSection() {
  return (
    <section id="features" className="border-y border-[#1f1f1f] bg-[#0d0d0d] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="surfaces"
          title="Logs, traces, and runbooks stay in the same room."
          body="The page still covers the product areas. The difference is that each one now looks like an operating surface instead of a feature card."
        />
        <div className="mt-10 grid gap-3 lg:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {featureRows.map((row) => (
            <article key={row.title} className="border border-[#1f1f1f] bg-[#111] p-4 transition-colors hover:border-[#2a2a2a]">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#22d3ee]">{row.eyebrow}</p>
              <h3 className="mt-3 font-mono text-xl font-black text-[#f5f5f5]">{row.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#a3a3a3]">{row.body}</p>
              <div className="mt-5 space-y-2 font-mono">
                {row.lines.map((line) => (
                  <p key={line} className="overflow-x-auto whitespace-nowrap border border-[#1f1f1f] bg-[#0a0a0a] px-2 py-2 text-xs text-[#737373]">{line}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function DeveloperSection() {
  return (
    <section id="developers" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="border border-[#1f1f1f] bg-[#111] font-mono">
          <div className="border-b border-[#1f1f1f] px-3 py-2 text-xs text-[#525252]">sdk-ingest.ts</div>
          <div className="space-y-2 p-3">
            {codeLines.map((line, index) => (
              <div key={line} className="flex gap-4 overflow-x-auto border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm">
                <span className="text-[#525252]">{index + 1}</span>
                <span className="whitespace-nowrap text-[#a3a3a3]">{line}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow="developers"
            title="Simple ingest. Clear ownership."
            body="SDKs and API routes map directly to teams, projects, applications, and telemetry. The product avoids mystery abstractions so production context remains inspectable."
          />
          <div className="mt-6 grid gap-3">
            {[
              { icon: Code2Icon, text: "Typed client helpers and clear API boundaries." },
              { icon: Layers3Icon, text: "Organization, project, and application hierarchy." },
              { icon: FileSearchIcon, text: "Docs and runbooks linked into telemetry analysis." },
            ].map((item) => (
              <div key={item.text} className="flex gap-3 border border-[#1f1f1f] bg-[#111] p-4 transition-colors hover:border-[#2a2a2a]">
                <item.icon className="mt-0.5 size-5 shrink-0 text-[#22d3ee]" />
                <p className="text-sm leading-6 text-[#a3a3a3]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SecuritySection() {
  return (
    <section id="security" className="border-y border-[#1f1f1f] bg-[#0d0d0d] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 grid-cols-1 gap-10 xl:grid-cols-[0.7fr_1.3fr]">
        <SectionHeader
          eyebrow="controls"
          title="Practical boundaries for an engineering-led observability system."
          body="The controls are intentionally plain: auth, scoped keys, tenant boundaries, explicit deletion, and telemetry shapes that are easy to audit."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {engineeringControls.map((item) => (
            <div key={item} className="flex items-center gap-3 border border-[#1f1f1f] bg-[#111] p-4 transition-colors hover:border-[#2a2a2a]">
              <LockKeyholeIcon className="size-4 shrink-0 text-[#22d3ee]" />
              <span className="text-sm text-[#a3a3a3]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 border border-[#1f1f1f] bg-[#111] p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#525252]">for production review</p>
          <h2 className="mt-2 font-mono text-2xl font-black text-[#f5f5f5] sm:text-3xl">Open the workspace. Follow the trace.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a3a3a3]">
            Move from projects and applications into API keys, telemetry, logs, traces, and AI-assisted incident context.
          </p>
        </div>
        <Link href={loginUrl} className="inline-flex h-10 w-fit shrink-0 items-center gap-2 border border-[#22d3ee] bg-[#22d3ee] px-4 font-mono text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#67e8f9]">
          Sign in <GitBranchIcon className="size-4" />
        </Link>
      </div>
    </section>
  )
}

export function LandingPage() {
  const token = useUserData((state) => state.accessToken)

  useEffect(() => {
    if (token) window.location.replace("/dashboard")
  }, [token])

  return (
    <main className="min-h-svh bg-[#0a0a0a] text-[#f5f5f5]">
      <SiteNav />
      <TerminalHero />
      <ShowcaseSection />
      <IncidentCockpit />
      <ArchitectureSection />
      <FeatureSection />
      <DeveloperSection />
      <SecuritySection />
      <FinalCta />
      <SiteFooter />
    </main>
  )
}