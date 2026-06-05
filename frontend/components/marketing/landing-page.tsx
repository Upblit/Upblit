"use client"

import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import {
  ActivityIcon,
  ArrowRightIcon,
  BotIcon,
  BracesIcon,
  CheckCircle2Icon,
  Clock3Icon,
  Code2Icon,
  DatabaseZapIcon,
  FileSearchIcon,
  KeyRoundIcon,
  Layers3Icon,
  LineChartIcon,
  LockKeyholeIcon,
  RadioTowerIcon,
  SparklesIcon,
  TerminalIcon,
  WorkflowIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUserData } from "@/hooks/use-userData"
import { loginUrl, SiteNav } from "@/components/marketing/site-nav"
import { SiteFooter } from "@/components/marketing/site-footer"

const metrics = [
  { label: "p95 latency", value: "128ms", delta: "-18%", tone: "text-emerald-300" },
  { label: "error rate", value: "0.12%", delta: "stable", tone: "text-[#7dd3fc]" },
  { label: "trace volume", value: "2.4M", delta: "+31%", tone: "text-amber-200" },
]

const architectureNodes = [
  { icon: BracesIcon, title: "SDKs", body: "Express, Python, Go, and Spring services emit spans, metrics, logs, and app identity." },
  { icon: KeyRoundIcon, title: "API keys", body: "Scoped application keys keep ingest boundaries clean across environments." },
  { icon: DatabaseZapIcon, title: "Ingest pipeline", body: "Logs and telemetry are normalized with project, org, trace, and application context." },
  { icon: ActivityIcon, title: "Review cockpit", body: "Engineers inspect timelines, runbooks, and correlated signals from one surface." },
]

const featureRows = [
  {
    eyebrow: "Logs",
    title: "Searchable production logs with trace context.",
    body: "Log review stays connected to the service, project, severity, and request path that produced it. The interface is intentionally dense so responders can scan quickly under pressure.",
    icon: TerminalIcon,
    bullets: ["Level-aware filtering", "Trace ID correlation", "Auto-refresh ready", "Structured payloads"],
  },
  {
    eyebrow: "Traces",
    title: "Request waterfalls that explain latency.",
    body: "Telemetry rows expand into span timelines with parent-child relationships, response status, method, URL, and duration.",
    icon: RadioTowerIcon,
    bullets: ["Span hierarchy", "Duration hotspots", "Status mapping", "Incident timeline"],
  },
  {
    eyebrow: "AI Docs",
    title: "Runbooks surfaced beside the incident.",
    body: "Upload operational docs and keep retrieval scoped to the tenant. Upblit AI becomes a focused assistant for engineering context, not a disconnected chatbot.",
    icon: BotIcon,
    bullets: ["PDF/DOCX/TXT", "Tenant-aware search", "Runbook summaries", "Document deletion"],
  },
]

const engineeringControls = [
  "GitHub OAuth sign-in",
  "Scoped application API keys",
  "Organization/project boundaries",
  "Trace-aware log context",
  "Document tenant separation",
  "Explicit delete paths",
  "Backend-owned token refresh",
  "Audit-friendly event shape",
]

const timeline = [
  { time: "12:04:11.204", service: "checkout-api", detail: "POST /orders accepted", level: "INFO", tone: "bg-emerald-300" },
  { time: "12:04:11.391", service: "payment-worker", detail: "authorization latency p95 crossed", level: "WARN", tone: "bg-amber-300" },
  { time: "12:04:11.883", service: "gateway", detail: "retry policy activated", level: "INFO", tone: "bg-[#7dd3fc]" },
  { time: "12:04:12.102", service: "ai-docs", detail: "runbook matched: queue pressure", level: "MATCH", tone: "bg-violet-300" },
  { time: "12:04:12.560", service: "checkout-api", detail: "payment timeout threshold exceeded", level: "ERROR", tone: "bg-red-300" },
]

const codeLines = [
  "import { upblit } from '@upblit/sdk'",
  "const span = upblit.trace('checkout.create')",
  "logger.warn('payment latency high', { traceId })",
  "await upblit.metric('queue.depth', depth)",
  "await span.end({ status: 'retry_scheduled' })",
]

function NeuralBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return

    let frame = 0
    const points = Array.from({ length: 86 }, (_, index) => ({
      angle: (index / 86) * Math.PI * 2,
      radius: 96 + (index % 11) * 21,
      z: ((index * 53) % 320) - 160,
      speed: reduceMotion ? 0 : 0.00013 + (index % 9) * 0.000012,
    }))

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * ratio
      canvas.height = window.innerHeight * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = (time: number) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const centerX = width * 0.63
      const centerY = height * 0.38

      context.clearRect(0, 0, width, height)
      const projected = points.map((point) => {
        const rotation = point.angle + time * point.speed
        const depth = 520 / (520 + point.z + Math.sin(time * 0.00024 + point.angle) * 62)
        return {
          x: centerX + Math.cos(rotation) * point.radius * depth,
          y: centerY + Math.sin(rotation * 0.72) * point.radius * 0.62 * depth + point.z * 0.18,
          alpha: Math.max(0.12, Math.min(0.54, depth * 0.31)),
          size: Math.max(0.9, depth * 1.8),
        }
      })

      projected.forEach((point, index) => {
        for (let next = index + 1; next < projected.length; next += 1) {
          const other = projected[next]
          const distance = Math.hypot(point.x - other.x, point.y - other.y)
          if (distance < 105) {
            context.strokeStyle = `rgba(7, 161, 193, ${0.14 * (1 - distance / 105)})`
            context.lineWidth = 1
            context.beginPath()
            context.moveTo(point.x, point.y)
            context.lineTo(other.x, other.y)
            context.stroke()
          }
        }
      })

      projected.forEach((point) => {
        context.fillStyle = `rgba(125, 211, 252, ${point.alpha})`
        context.beginPath()
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        context.fill()
      })

      if (!reduceMotion) frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    frame = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(frame)
    }
  }, [reduceMotion])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-75" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(7,161,193,0.18),transparent_31%),radial-gradient(circle_at_78%_16%,rgba(39,166,226,0.1),transparent_28%),linear-gradient(180deg,rgba(8,9,11,0.2),#08090b_86%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
    </div>
  )
}

function MouseLight({ children }: { children: ReactNode }) {
  const x = useMotionValue(50)
  const y = useMotionValue(50)
  const springX = useSpring(x, { stiffness: 180, damping: 28 })
  const springY = useSpring(y, { stiffness: 180, damping: 28 })
  const background = useTransform([springX, springY], ([latestX, latestY]) =>
    `radial-gradient(680px circle at ${latestX}% ${latestY}%, rgba(7,161,193,0.11), transparent 42%)`
  )

  return (
    <motion.div
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        x.set(((event.clientX - rect.left) / rect.width) * 100)
        y.set(((event.clientY - rect.top) / rect.height) * 100)
      }}
      style={{ background }}
      className="relative"
    >
      {children}
    </motion.div>
  )
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium text-[#7dd3fc]">{eyebrow}</p>
      <h2 className="mt-3 font-heading text-3xl font-bold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">{body}</p>
    </div>
  )
}

function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.085] bg-[#0e1115]/78 shadow-2xl shadow-black/35 backdrop-blur-2xl", className)}>
      {children}
    </div>
  )
}

function Metric({ label, value, delta, tone }: (typeof metrics)[number]) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4 transition-colors hover:border-[#07a1c1]/45 hover:bg-white/[0.055]"
    >
      <div className="text-xs text-white/42">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <span className="font-mono text-2xl text-white">{value}</span>
        <span className={cn("rounded-md bg-white/[0.06] px-2 py-1 text-xs", tone)}>{delta}</span>
      </div>
    </motion.div>
  )
}

function DashboardPreview() {
  return (
    <GlassPanel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
        <div>
          <p className="text-xs text-white/42">Incident cockpit</p>
          <h2 className="mt-1 font-heading text-lg font-semibold text-white">acme-production / checkout</h2>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-300" />
          streaming
        </div>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-white/[0.08] bg-[#08090b] p-4">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white"><LineChartIcon className="size-4 text-[#7dd3fc]" />Signal health</span>
              <span className="text-white/38">15m</span>
            </div>
            <div className="space-y-3">
              {["Logs", "Traces", "Metrics", "Docs"].map((label, index) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs text-white/46">
                    <span>{label}</span>
                    <span>{[86, 72, 94, 61][index]}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${[86, 72, 94, 61][index]}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.08 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#087f9c] to-[#7dd3fc]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#07a1c1]/20 bg-[#07a1c1]/10 p-4">
            <div className="flex items-center gap-2 text-sm text-white">
              <BotIcon className="size-4 text-[#7dd3fc]" />
              AI runbook match
            </div>
            <p className="mt-3 text-sm leading-6 text-white/62">
              Payment timeout resembles incident INC-042. Check queue depth, gateway retry volume, and worker pool saturation.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-[#08090b] p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-white"><WorkflowIcon className="size-4 text-[#7dd3fc]" />Trace timeline</span>
            <span className="rounded-md bg-red-400/10 px-2 py-1 text-xs text-red-200">ERROR spike</span>
          </div>
          <div className="space-y-2">
            {timeline.map((row) => (
              <motion.div
                key={`${row.time}-${row.service}`}
                whileHover={{ x: 4 }}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 transition hover:border-[#07a1c1]/36 hover:bg-white/[0.045]"
              >
                <span className={cn("size-2 rounded-full", row.tone)} />
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-white/36">{row.time}</span>
                    <span className="truncate text-sm text-white">{row.service}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-white/46">{row.detail}</p>
                </div>
                <span className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-white/48">{row.level}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="border-y border-white/[0.08] bg-[#0b0d10] px-5 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <SectionHeader
            eyebrow="Product architecture"
            title="A clean signal path from runtime to review."
            body="Upblit is organized around the production hierarchy your team already uses: organizations, projects, applications, API keys, ingest, and incident review."
          />
          <div className="relative grid gap-3 md:grid-cols-2">
            <div className="absolute left-1/2 top-6 hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-transparent via-[#07a1c1]/35 to-transparent md:block" />
            {architectureNodes.map((node, index) => (
              <motion.article
                key={node.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.06 }}
                className="group relative rounded-lg border border-white/[0.08] bg-[#101318] p-5 transition hover:-translate-y-1 hover:border-[#07a1c1]/45"
              >
                <node.icon className="size-5 text-[#7dd3fc]" />
                <h3 className="mt-5 font-heading text-lg font-semibold text-white">{node.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{node.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ row, index }: { row: (typeof featureRows)[number]; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      className={cn("grid gap-8 border-t border-white/[0.08] py-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center", index % 2 === 1 && "lg:grid-cols-[1.08fr_0.92fr]")}
    >
      <div className={cn(index % 2 === 1 && "lg:order-2")}>
        <p className="text-sm font-medium text-[#7dd3fc]">{row.eyebrow}</p>
        <h3 className="mt-3 font-heading text-2xl font-bold tracking-normal text-white sm:text-3xl">{row.title}</h3>
        <p className="mt-4 text-sm leading-7 text-white/58">{row.body}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {row.bullets.map((bullet) => (
            <div key={bullet} className="flex items-center gap-2 text-sm text-white/58">
              <CheckCircle2Icon className="size-4 text-emerald-300" />
              {bullet}
            </div>
          ))}
        </div>
      </div>
      <GlassPanel className={cn("overflow-hidden p-5", index % 2 === 1 && "lg:order-1")}>
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2 text-sm text-white">
            <row.icon className="size-4 text-[#7dd3fc]" />
            {row.eyebrow.toLowerCase()} surface
          </div>
          <span className="font-mono text-xs text-white/35">live</span>
        </div>
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }, (_, itemIndex) => (
            <div key={itemIndex} className="rounded-md border border-white/[0.06] bg-white/[0.025] p-3">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-white/42">trace_{index}{itemIndex}a9</span>
                <span className="text-xs text-white/36">{itemIndex % 2 ? "182ms" : "491ms"}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full bg-[#07a1c1]" style={{ width: `${44 + itemIndex * 9}%` }} />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </motion.article>
  )
}

export function LandingPage() {
  const token = useUserData((state) => state.accessToken)

  useEffect(() => {
    if (token) window.location.replace("/dashboard")
  }, [token])

  return (
    <main className="min-h-svh overflow-hidden bg-[#08090b] text-white">
      <MouseLight>
        <section className="relative min-h-svh pb-16">
          <NeuralBackdrop />
          <SiteNav />
          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#07a1c1]/25 bg-[#07a1c1]/10 px-3 py-1.5 text-xs font-medium text-[#7dd3fc]">
                <SparklesIcon className="size-3.5" />
                AI-assisted operations for production systems
              </div>
              <h1 className="font-heading text-5xl font-bold leading-[1.01] tracking-normal text-white sm:text-6xl lg:text-7xl">
                Telemetry review for teams operating real software.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                Upblit unifies logs, traces, metrics, API keys, and runbook intelligence into a dark-first workspace designed for incident response and production clarity.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 gap-2 rounded-md bg-[#087f9c] px-4 text-white shadow-lg shadow-[#087f9c]/20 transition hover:-translate-y-0.5 hover:bg-[#0aa1c4]">
                  <a href={loginUrl}>Sign in <ArrowRightIcon className="size-4" /></a>
                </Button>
                <Button asChild variant="outline" className="h-11 gap-2 rounded-md border-white/[0.12] bg-white/[0.03] px-4 text-white transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                  <Link href="/#dashboard">Inspect the cockpit <ActivityIcon className="size-4" /></Link>
                </Button>
              </div>
              <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
                {metrics.map((metric) => <Metric key={metric.label} {...metric} />)}
              </div>
              <div className="mt-7 flex flex-wrap gap-2 text-xs text-white/42">
                {["Built from the backend up", "SDK-first telemetry", "Scoped API keys", "Tenant-aware AI docs"].map((item) => (
                  <span key={item} className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5">{item}</span>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 22, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65, delay: 0.12 }}>
              <DashboardPreview />
            </motion.div>
          </div>
        </section>

        <ArchitectureSection />

        <section id="features" className="bg-[#08090b] px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Feature system"
              title="Composed surfaces, not a wall of cards."
              body="Every section is arranged around the actual operational objects in Upblit: logs, traces, metrics, documents, applications, and incident review."
            />
            <div className="mt-8">
              {featureRows.map((row, index) => <FeatureRow key={row.title} row={row} index={index} />)}
            </div>
          </div>
        </section>

        <section id="dashboard" className="border-y border-white/[0.08] bg-[#0b0d10] px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-center">
            <SectionHeader
              eyebrow="Dashboard preview"
              title="A production cockpit with real information density."
              body="Review service health, trace waterfalls, matching docs, and incident context from the same visual plane. It is built to be scanned, not admired from a distance."
            />
            <DashboardPreview />
          </div>
        </section>

        <section id="developers" className="bg-[#08090b] px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <GlassPanel className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-4 font-mono text-xs text-white/42">
                <span className="size-2 rounded-full bg-red-300" />
                <span className="size-2 rounded-full bg-amber-300" />
                <span className="size-2 rounded-full bg-emerald-300" />
                <span className="ml-3">sdk-ingest.ts</span>
              </div>
              <div className="space-y-3 p-5 font-mono text-sm">
                {codeLines.map((line, index) => (
                  <motion.div key={line} whileHover={{ x: 3 }} className="flex gap-4 rounded-md bg-white/[0.025] px-3 py-2">
                    <span className="text-white/28">{index + 1}</span>
                    <span className="text-white/68">{line}</span>
                  </motion.div>
                ))}
              </div>
            </GlassPanel>
            <div>
              <SectionHeader
                eyebrow="Developer experience"
                title="Simple ingest. Clear ownership. Useful defaults."
                body="SDKs and API routes map directly to teams, projects, applications, and telemetry. The product avoids mystery abstractions so production context remains inspectable."
              />
              <div className="mt-7 grid gap-3">
                {[
                  { icon: Code2Icon, text: "Typed client helpers and clear API boundaries." },
                  { icon: Layers3Icon, text: "Organization, project, and application hierarchy." },
                  { icon: Clock3Icon, text: "Auto-refresh patterns for high-pressure incident review." },
                  { icon: FileSearchIcon, text: "Docs and runbooks linked directly into telemetry analysis." },
                ].map((item) => (
                  <div key={item.text} className="flex gap-3 rounded-lg border border-white/[0.08] bg-[#101318] p-4">
                    <item.icon className="mt-0.5 size-5 shrink-0 text-[#7dd3fc]" />
                    <p className="text-sm leading-6 text-white/58">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="border-y border-white/[0.08] bg-[#0b0d10] px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <SectionHeader
                eyebrow="Engineering controls"
                title="Practical boundaries for a student-built observability system."
                body="Upblit focuses on the controls that matter while the product is still engineering-led: auth, scoped keys, tenant boundaries, explicit deletion, and telemetry shapes that are easy to inspect."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {engineeringControls.map((item) => (
                  <motion.div key={item} whileHover={{ y: -3 }} className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-[#101318] p-4">
                    <LockKeyholeIcon className="size-4 text-[#7dd3fc]" />
                    <span className="text-sm text-white/64">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3 text-sm">
              <Link className="text-[#7dd3fc] hover:text-white" href="/privacy">Privacy policy</Link>
              <Link className="text-[#7dd3fc] hover:text-white" href="/terms">Terms</Link>
              <Link className="text-[#7dd3fc] hover:text-white" href="/cookies">Cookie policy</Link>
              <Link className="text-[#7dd3fc] hover:text-white" href="/data-retention">Data retention</Link>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#08090b] px-5 py-20 text-center sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-medium text-[#7dd3fc]">Built for engineers first</p>
            <h2 className="mt-3 font-heading text-4xl font-bold tracking-normal text-white sm:text-5xl">A serious observability workbench for people who read logs.</h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
              Sign in, then move into projects, applications, API keys, telemetry, logs, and AI-assisted incident context. The product should feel useful before it tries to sound important.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild className="h-11 rounded-md bg-[#087f9c] px-4 text-white hover:bg-[#0aa1c4]">
                <a href={loginUrl}>Sign in</a>
              </Button>
            </div>
          </div>
        </section>

        <SiteFooter />
      </MouseLight>
    </main>
  )
}
