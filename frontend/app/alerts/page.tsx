"use client"

import { useEffect, useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { apiGet } from "@/lib/api"
import { useOrg } from "@/hooks/use-org"
import { useProjects } from "@/hooks/use-projects"
import type { AlertEvent, Project } from "@/lib/types"
import { AlertTriangleIcon, RefreshCwIcon, SearchIcon } from "lucide-react"

const severityStyles: Record<string, string> = {
  critical: "border-red-500/20 bg-red-500/10 text-red-200",
  high: "border-orange-500/20 bg-orange-500/10 text-orange-200",
  medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
  low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
}

function severityLabel(severity?: string) {
  return severity ? severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase() : "Unknown"
}

function formatTime(value?: string) {
  if (!value) return "Unknown"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

export default function AlertsPage() {
  const { activeOrgId } = useOrg()
  const projectsByOrg = useProjects((state) => state.projects)
  const projects = activeOrgId ? projectsByOrg[activeOrgId] ?? [] : []
  const [alerts, setAlerts] = useState<AlertEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")

  const projectNameById = useMemo(() => {
    return projects.reduce<Record<number, string>>((map, project) => {
      map[project.id] = project.name
      return map
    }, {})
  }, [projects])

  async function loadAlerts() {
    setIsLoading(true)
    setError("")
    try {
      const data = await apiGet<AlertEvent[]>("/alerts", { limit: 100 })
      setAlerts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAlerts()
  }, [])

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === "all" || (alert.severity ?? "").toLowerCase() === severityFilter
    const searchableText = [alert.title, alert.message, alert.subject, alert.source, alert.kind]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    const matchesSearch = !searchQuery.trim() || searchableText.includes(searchQuery.trim().toLowerCase())
    return matchesSeverity && matchesSearch
  })

  const severityCounts = alerts.reduce<Record<string, number>>((counts, alert) => {
    const key = (alert.severity ?? "unknown").toLowerCase()
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-muted-foreground/60 hover:text-foreground">
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block opacity-40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground/90">Global alerts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-8 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Observability</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground/90">Global alerts</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Review anomaly and service alerts across the active organization&apos;s projects.
              </p>
            </div>

            <Button onClick={() => void loadAlerts()} variant="outline" className="border-border bg-card text-foreground hover:bg-muted">
              <RefreshCwIcon className="mr-2 size-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total alerts" value={alerts.length} />
            <StatCard label="Critical" value={severityCounts.critical ?? 0} />
            <StatCard label="High / medium" value={(severityCounts.high ?? 0) + (severityCounts.medium ?? 0)} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-md">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/35" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search alerts by title, message, source, or kind"
                  className="h-11 border-border bg-background pl-10 text-foreground placeholder:text-foreground/35"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "critical", "high", "medium", "low"] as const).map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    onClick={() => setSeverityFilter(severity)}
                    className={severityFilter === severity ? "rounded-full bg-[#087f9c] px-3 py-1.5 text-sm font-medium text-white" : "rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-muted"}
                  >
                    {severity === "all" ? "All" : severityLabel(severity)}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Loading alerts...
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
                <AlertTriangleIcon className="size-10 text-foreground/35" />
                <h2 className="mt-4 text-xl font-semibold text-foreground/90">No alerts match the current filters</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  When anomaly detection or uptime checks emit an alert, it will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/[0.08]">
                <div className="grid grid-cols-12 gap-3 border-b border-foreground/[0.06] bg-foreground/[0.03] px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-foreground/40">
                  <div className="col-span-3">Alert</div>
                  <div className="col-span-2">Severity</div>
                  <div className="col-span-2">Source</div>
                  <div className="col-span-2">Project</div>
                  <div className="col-span-2">Application</div>
                  <div className="col-span-1 text-right">Time</div>
                </div>

                <div className="divide-y divide-foreground/[0.06] bg-[#101010]">
                  {filteredAlerts.map((alert) => {
                    const severity = (alert.severity ?? "unknown").toLowerCase()
                    const rowClass = severityStyles[severity] ?? "border-foreground/[0.08] bg-foreground/[0.03] text-foreground/80"
                    return (
                      <div key={alert.id} className="grid grid-cols-12 gap-3 px-4 py-4 text-sm text-foreground/74">
                        <div className="col-span-12 md:col-span-3">
                          <p className="font-medium text-foreground/92">{alert.title || alert.subject || alert.kind || "Alert"}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-foreground/48">{alert.message || "No message provided."}</p>
                        </div>
                        <div className="col-span-6 md:col-span-2">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.18em] ${rowClass}`}>
                            {severityLabel(alert.severity)}
                          </span>
                        </div>
                        <div className="col-span-6 md:col-span-2 text-foreground/60">{alert.source || alert.kind || "-"}</div>
                        <div className="col-span-6 md:col-span-2 text-foreground/60">{alert.projectId ? projectNameById[alert.projectId] || `Project ${alert.projectId}` : "All projects"}</div>
                        <div className="col-span-6 md:col-span-2 text-foreground/60">{alert.applicationId ? `Application ${alert.applicationId}` : "-"}</div>
                        <div className="col-span-12 mt-2 text-right text-xs text-foreground/38 md:col-span-1 md:mt-0">{formatTime(alert.detectedAt || alert.createdAt)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold text-foreground/90">{value}</p>
    </div>
  )
}