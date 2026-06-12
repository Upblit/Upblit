"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { apiGet } from "@/lib/api"
import { useMetrics } from "@/hooks/use-metrics"
import { useLogs } from "@/hooks/use-logs"
import { useTraces } from "@/hooks/use-traces"
import { MetricsChart } from "@/components/metrics-chart"
import { UptimeDowntimeChart } from "@/components/uptime-downtime-chart"
import { LogsTable } from "@/components/logs-table"
import { TracesTable } from "@/components/traces-table"
import { UptimeConnectSheet } from "@/components/uptime-connect-sheet"
import type { Application, UptimeCheckResult, UptimeMonitor } from "@/lib/types"
import { ArrowLeftIcon, RefreshCwIcon, CalendarIcon, ActivityIcon, LinkIcon } from "lucide-react"

type TabType = "metrics" | "uptime" | "logs" | "traces"

function uptimeStatusClass(status: string) {
  if (status === "up") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200"
  if (status === "down") return "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-200"
  return "border-border bg-muted text-muted-foreground"
}

export default function ApplicationDetailPage() {
  const params = useParams<{ projectId: string; applicationId: string }>()
  const router = useRouter()
  const projectId = Number(params.projectId)
  const applicationId = Number(params.applicationId)

  const [application, setApplication] = useState<Application | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("metrics")
  const [isLoadingApp, setIsLoadingApp] = useState(true)
  const [uptimeMonitors, setUptimeMonitors] = useState<UptimeMonitor[]>([])
  const [uptimeResults, setUptimeResults] = useState<UptimeCheckResult[]>([])
  const [isLoadingUptime, setIsLoadingUptime] = useState(false)
  const [isUptimeSheetOpen, setIsUptimeSheetOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useMetrics(projectId, applicationId, timeRange.start, timeRange.end)
  const { logs, isLoading: logsLoading, refetch: refetchLogs } = useLogs(projectId, applicationId, undefined, undefined, timeRange.start, timeRange.end)
  const {
    traces,
    isLoading: tracesLoading,
    refetch: refetchTraces,
    pagination: tracePagination,
    actions: traceActions,
  } = useTraces(projectId, applicationId, timeRange.start, timeRange.end)

  const currentMonitor = useMemo(
    () => uptimeMonitors.find((monitor) => monitor.applicationId === applicationId) ?? null,
    [applicationId, uptimeMonitors],
  )

  useEffect(() => {
    async function loadApplication() {
      if (!projectId || !applicationId) return
      setIsLoadingApp(true)
      try {
        const apps = await apiGet<Application[]>("/applications", { projectId })
        const app = Array.isArray(apps) ? apps.find((a) => a.id === applicationId) : null
        setApplication(app || null)
      } catch (err) {
        console.error("Failed to load application:", err)
      } finally {
        setIsLoadingApp(false)
      }
    }

    void loadApplication()
  }, [projectId, applicationId])

  useEffect(() => {
    async function loadUptimeMonitors() {
      if (!projectId) return
      try {
        const data = await apiGet<UptimeMonitor[]>("/uptime/monitors", { projectId })
        setUptimeMonitors(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to load uptime monitors:", err)
        setUptimeMonitors([])
      }
    }

    void loadUptimeMonitors()
  }, [projectId])

  useEffect(() => {
    async function loadUptimeResults(monitorId: number) {
      setIsLoadingUptime(true)
      try {
        const data = await apiGet<UptimeCheckResult[]>(`/uptime/monitors/${monitorId}/results`)
        setUptimeResults(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to load uptime results:", err)
        setUptimeResults([])
      } finally {
        setIsLoadingUptime(false)
      }
    }

    if (!currentMonitor) {
      setUptimeResults([])
      return
    }

    void loadUptimeResults(currentMonitor.id)
  }, [currentMonitor])

  const handleRefresh = () => {
    if (activeTab === "metrics") void refetchMetrics()
    else if (activeTab === "uptime" && currentMonitor) {
      setIsLoadingUptime(true)
      void apiGet<UptimeCheckResult[]>(`/uptime/monitors/${currentMonitor.id}/results`)
        .then((data) => setUptimeResults(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Failed to refresh uptime results:", err)
          setUptimeResults([])
        })
        .finally(() => setIsLoadingUptime(false))
    }
    else if (activeTab === "logs") void refetchLogs()
    else if (activeTab === "traces") void refetchTraces()
  }

  const handleTimeRangeChange = (range: "1h" | "24h" | "7d" | "30d") => {
    const end = new Date()
    let start = new Date()

    if (range === "1h") {
      start = new Date(end.getTime() - 60 * 60 * 1000)
    } else if (range === "24h") {
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
    } else if (range === "7d") {
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (range === "30d") {
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    setTimeRange({ start, end })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="me-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-muted-foreground/60 hover:text-foreground">
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block opacity-40" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/dashboard/${projectId}`} className="text-muted-foreground/60 hover:text-foreground">
                    Project {projectId}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block opacity-40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground/90 font-medium">
                    {isLoadingApp ? "Loading..." : application?.name || `Application ${applicationId}`}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-8 p-8 pt-10 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-8 w-8 -ml-2"
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
                  {isLoadingApp ? "Loading..." : application?.name || "Application"}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground ml-11">{application?.description || "Application monitoring"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsUptimeSheetOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 border-border bg-muted/40 hover:bg-muted/80 text-foreground"
              >
                <LinkIcon className="size-4" />
                {currentMonitor ? "Manage uptime" : "Connect uptime"}
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="gap-2 border-border bg-muted/40 hover:bg-muted/80 text-foreground"
              >
                <RefreshCwIcon className="size-4" />
                Refresh
              </Button>
            </div>
          </div>

          {currentMonitor && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Uptime</p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground/90">Connected URL</h2>
                  <p className="mt-1 text-sm text-muted-foreground break-all">{currentMonitor.url}</p>
                </div>
                <span className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${uptimeStatusClass(currentMonitor.currentStatus)}`}>
                  {currentMonitor.currentStatus}
                </span>
              </div>
            </div>
          )}

          {/* Time Range Selection */}
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="size-3.5" />
              Time Range:
            </span>
            {(["1h", "24h", "7d", "30d"] as const).map((range) => (
              <Button
                key={range}
                size="sm"
                variant="outline"
                onClick={() => handleTimeRangeChange(range)}
                className="h-8 text-xs bg-muted/40 border-border hover:bg-muted/80 text-foreground"
              >
                Last {range}
              </Button>
            ))}
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-8">
              {(["metrics", ...(currentMonitor ? (["uptime"] as const) : []), "logs", "traces"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab
                      ? "border-[#087f9c] text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === "metrics" && (
              <div>
                {metricsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 rounded-lg bg-muted/60" />
                    <Skeleton className="h-96 rounded-lg bg-muted/60" />
                  </div>
                ) : (
                  <MetricsChart metrics={metrics} />
                )}
              </div>
            )}

            {activeTab === "uptime" && (
              <div className="space-y-6">
                {!currentMonitor ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
                    <ActivityIcon className="size-10 text-[#087f9c]" />
                    <h3 className="mt-4 text-xl font-semibold text-foreground/90">No uptime URL connected</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Connect one URL to start polling this application every 30 seconds.
                    </p>
                    <Button onClick={() => setIsUptimeSheetOpen(true)} className="mt-6 gap-2 bg-[#087f9c] text-white hover:bg-[#0aa1c4]">
                      <LinkIcon className="size-4" />
                      Connect uptime
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                        <p className="mt-3 text-2xl font-bold text-foreground/90">{currentMonitor.currentStatus}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Last check</p>
                        <p className="mt-3 text-sm text-foreground/90">
                          {currentMonitor.lastCheckAt ? new Date(currentMonitor.lastCheckAt).toLocaleString() : "Waiting for first poll"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Target</p>
                        <p className="mt-3 break-all text-sm text-foreground/90">{currentMonitor.url}</p>
                      </div>
                    </div>

                    <UptimeDowntimeChart results={uptimeResults} />

                    <div className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground/90">Recent checks</h3>
                          <p className="text-sm text-muted-foreground">Latest probe results recorded by Spring Boot.</p>
                        </div>
                        {isLoadingUptime && <span className="text-xs text-muted-foreground">Refreshing...</span>}
                      </div>

                      <div className="mt-5 space-y-3">
                        {uptimeResults.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                            No uptime results yet.
                          </div>
                        ) : (
                          uptimeResults.slice(0, 10).map((result) => (
                            <div key={result.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/50 p-4">
                              <div>
                                <p className="font-medium text-foreground/90">{new Date(result.timestamp).toLocaleString()}</p>
                                <p className="mt-1 text-xs text-muted-foreground break-all">{result.url}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className={`rounded-lg border px-2.5 py-1 font-semibold uppercase tracking-wide ${result.success ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200" : "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-200"}`}>
                                  {result.success ? "Up" : "Down"}
                                </span>
                                <span>{result.statusCode || "--"} status</span>
                                <span>{result.responseMs} ms</span>
                              </div>
                              {result.error && <p className="w-full text-xs text-red-600 dark:text-red-200">{result.error}</p>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div>
                {logsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 rounded-lg bg-muted/60" />
                    <Skeleton className="h-64 rounded-lg bg-muted/60" />
                  </div>
                ) : (
                  <LogsTable logs={logs} />
                )}
              </div>
            )}

            {activeTab === "traces" && (
              <div>
                {tracesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 rounded-lg bg-muted/60" />
                    <Skeleton className="h-64 rounded-lg bg-muted/60" />
                  </div>
                ) : (
                  <TracesTable
                    traces={traces}
                    pagination={tracePagination}
                    actions={traceActions}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <UptimeConnectSheet
          open={isUptimeSheetOpen}
          onOpenChange={setIsUptimeSheetOpen}
          application={application}
          projectId={projectId}
          existingMonitor={currentMonitor}
          onConnected={async () => {
            const data = await apiGet<UptimeMonitor[]>('/uptime/monitors', { projectId })
            setUptimeMonitors(Array.isArray(data) ? data : [])
            setActiveTab("uptime")
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
