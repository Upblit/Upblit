"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api"
import { useOrg } from "@/hooks/use-org"
import { useProjects } from "@/hooks/use-projects"
import type { Application, ApplicationDTO, Project, UptimeMonitor } from "@/lib/types"
import { UptimeConnectSheet } from "@/components/uptime-connect-sheet"
import {
  ArrowUpDownIcon,
  CopyIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
  MoreVerticalIcon,
  SearchIcon,
} from "lucide-react"

const environments = ["production", "staging", "development"]

function envClass(environment: string) {
  const value = environment.toLowerCase()
  if (value === "production") return "border-red-500/25 bg-red-500/10 text-red-200"
  if (value === "staging") return "border-yellow-500/25 bg-yellow-500/10 text-yellow-200"
  return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
}

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>()
  const router = useRouter()
  const projectId = Number(params.projectId)
  const { activeOrgId } = useOrg()
  const projectsByOrg = useProjects((state) => state.projects)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [layoutType, setLayoutType] = useState<"grid" | "list">("grid")
  const [apiKey, setApiKey] = useState("")
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null)
  const [uptimeMonitors, setUptimeMonitors] = useState<UptimeMonitor[]>([])
  const [connectTarget, setConnectTarget] = useState<Application | null>(null)
  const [isUptimeSheetOpen, setIsUptimeSheetOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    environment: "production",
  })

  const project = useMemo<Project | undefined>(() => {
    const projectLists = Object.values(projectsByOrg).flat()
    return projectLists.find((item) => Number(item.id) === projectId)
  }, [projectId, projectsByOrg])

  async function loadApplications() {
    if (!projectId) return
    setIsLoading(true)
    setError("")
    try {
      const data = await apiGet<Application[]>("/applications", { projectId })
      setApplications(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadUptimeMonitors() {
    if (!projectId) return
    try {
      const data = await apiGet<UptimeMonitor[]>('/uptime/monitors', { projectId })
      setUptimeMonitors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load uptime monitors:", err)
      setUptimeMonitors([])
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadApplications()
      void loadUptimeMonitors()
    })
  }, [projectId])

  useEffect(() => {
    if (!isSheetOpen) {
      setEditingApplication(null)
      return
    }

    if (editingApplication) {
      setForm({
        name: editingApplication.name || "",
        description: editingApplication.description || "",
        environment: editingApplication.environment || "production",
      })
    }
  }, [editingApplication, isSheetOpen])

  const filteredApplications = applications
    .filter((app) => app.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))

  const getUptimeMonitor = (applicationId: number) =>
    uptimeMonitors.find((monitor) => monitor.applicationId === applicationId) ?? null

  const openCreateApplicationSheet = () => {
    setEditingApplication(null)
    setForm({ name: "", description: "", environment: "production" })
    setIsSheetOpen(true)
  }

  const openEditApplicationSheet = (application: Application) => {
    setEditingApplication(application)
    setIsSheetOpen(true)
  }

  const submitApplication = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!activeOrgId || !form.name.trim()) return

    setIsCreating(true)
    setError("")
    try {
      const body: ApplicationDTO = {
        ...form,
        name: form.name.trim(),
        organizationId: activeOrgId,
        projectId,
      }
      if (editingApplication) {
        await apiPut<Application>(`/applications/${editingApplication.id}`, body)
      } else {
        await apiPost<Application>("/applications", body)
      }
      setForm({ name: "", description: "", environment: "production" })
      setEditingApplication(null)
      setIsSheetOpen(false)
      await loadApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : editingApplication ? "Failed to update application" : "Failed to create application")
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDeleteApplication = (application: Application) => {
    setApplicationToDelete(application)
  }

  const deleteApplication = async () => {
    if (!applicationToDelete) return
    setError("")
    try {
      await apiDelete(`/applications/${applicationToDelete.id}`)
      setApplicationToDelete(null)
      await loadApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete application")
    }
  }

  const generateApiKey = async (applicationId: number) => {
    setError("")
    try {
      const key = await apiPost<unknown>(`/apikey?ApplicationId=${applicationId}`)
      setApiKey(typeof key === "string" ? key : JSON.stringify(key))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate API key")
    }
  }

  const openUptimeConnectSheet = (application: Application) => {
    setConnectTarget(application)
    setIsUptimeSheetOpen(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#0a0a0a]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.05]">
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
                  <BreadcrumbPage className="text-foreground/90 font-medium">
                    {project?.name || `Project ${projectId}`}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-8 p-8 pt-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white/90">{project?.name || "Project"}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Applications registered to this project.</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-1 min-w-[280px] items-center gap-3">
                <div className="relative flex-1 max-w-xs group">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-10 bg-white/[0.03] border-white/[0.08] h-9 text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder((value) => value === "asc" ? "desc" : "asc")}
                  className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] gap-2 h-9 text-xs"
                >
                  <ArrowUpDownIcon className="size-3.5 opacity-60" />
                  {sortOrder === "asc" ? "Name (A-Z)" : "Name (Z-A)"}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg bg-white/[0.03] p-1 border border-white/[0.08]">
                  <Button variant="ghost" size="icon-sm" onClick={() => setLayoutType("grid")} className={layoutType === "grid" ? "h-7 w-7 bg-white/[0.08]" : "h-7 w-7"}>
                    <LayoutGridIcon className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setLayoutType("list")} className={layoutType === "list" ? "h-7 w-7 bg-white/[0.08]" : "h-7 w-7"}>
                    <ListIcon className="size-4" />
                  </Button>
                </div>

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button onClick={openCreateApplicationSheet} size="sm" className="bg-[#087f9c] hover:bg-[#0aa1c4] text-white gap-2 h-9 rounded-lg">
                      <PlusIcon className="size-4" />
                      New application
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-[#0a0a0a]/95 border-l border-white/[0.08] p-8 sm:max-w-md">
                    <SheetHeader className="gap-1.5 p-0">
                      <SheetTitle className="text-2xl font-bold text-white/95">
                        {editingApplication ? "Edit Application" : "Create Application"}
                      </SheetTitle>
                      <SheetDescription>
                        {editingApplication
                          ? "Update the application details and save the changes."
                          : "Register an app environment for logs and traces."}
                      </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitApplication} className="mt-8 flex flex-col gap-5">
                      <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Application name" className="bg-white/[0.03] border-white/[0.08] h-11" />
                      <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="bg-white/[0.03] border-white/[0.08] h-11" />
                      <select value={form.environment} onChange={(event) => setForm({ ...form, environment: event.target.value })} className="h-11 rounded-xl border border-white/[0.08] bg-[#111111] px-3 text-sm text-white outline-none [color-scheme:dark] hover:bg-[#161616]">
                        {environments.map((environment) => <option key={environment} value={environment} className="bg-[#111111] text-white">{environment}</option>)}
                      </select>
                      <Button disabled={isCreating || !form.name.trim()} className="h-11 bg-[#087f9c] hover:bg-[#0aa1c4] text-white">
                        {isCreating ? (editingApplication ? "Saving..." : "Creating...") : editingApplication ? "Save changes" : "Create application"}
                      </Button>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

          {apiKey && (
            <div className="rounded-xl border border-[#087f9c]/30 bg-[#087f9c]/10 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-white">Generated API key</h2>
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(apiKey)} className="gap-2 border-white/[0.08] bg-white/[0.03]">
                  <CopyIcon className="size-4" />
                  Copy
                </Button>
              </div>
              <code className="block overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-[#8ee8f5]">{apiKey}</code>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => <Skeleton key={item} className="h-44 rounded-2xl bg-white/[0.04]" />)}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.01] p-12 text-center">
              <h3 className="text-xl font-semibold text-white/90">No applications yet</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">Create one to start ingesting logs, traces, and metrics.</p>
              <Button onClick={() => setIsSheetOpen(true)} className="mt-6 gap-2 bg-[#087f9c] text-white hover:bg-[#0aa1c4]">
                <PlusIcon className="size-4" />
                New application
              </Button>
            </div>
          ) : (
            <div className={layoutType === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
              {filteredApplications.map((application) => (
                <article key={application.id} className={`group relative rounded-2xl border border-white/[0.08] bg-[#111111] p-6 transition-all hover:border-white/[0.15] hover:bg-[#161616] ${layoutType === "list" ? "flex items-center justify-between gap-5" : ""}`}>
                  <Link href={`/dashboard/${projectId}/${application.id}`} className="absolute inset-0 z-0 rounded-2xl" aria-label={`Open ${application.name}`}>
                    <span className="sr-only">Open application</span>
                  </Link>

                  <div className="relative z-10 pointer-events-none">
                    <div className="flex items-start justify-between gap-3 pr-10">
                      <div>
                        <h2 className="text-lg font-bold text-white/90">{application.name}</h2>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{application.description || "No description"}</p>
                      </div>
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${envClass(application.environment)}`}>
                        {application.environment}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/50 transition-all hover:bg-white/[0.06] hover:text-foreground pointer-events-auto"
                        aria-label={`Open actions for ${application.name}`}
                      >
                        <MoreVerticalIcon className="size-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 border-white/[0.08] bg-[#111111] text-white shadow-2xl">
                      <DropdownMenuItem onSelect={() => openEditApplicationSheet(application)} className="cursor-pointer">
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => confirmDeleteApplication(application)} className="cursor-pointer">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button onClick={() => generateApiKey(application.id)} variant="outline" size="sm" className="relative z-20 mt-6 gap-2 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] pointer-events-auto">
                    <KeyRoundIcon className="size-4" />
                    Generate API Key
                  </Button>
                  <Button
                    onClick={() => openUptimeConnectSheet(application)}
                    variant="outline"
                    size="sm"
                    className="relative z-20 mt-3 gap-2 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] pointer-events-auto"
                  >
                    {getUptimeMonitor(application.id) ? "Uptime connected" : "Connect uptime"}
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>

        <UptimeConnectSheet
          open={isUptimeSheetOpen}
          onOpenChange={setIsUptimeSheetOpen}
          application={connectTarget}
          projectId={projectId}
          existingMonitor={connectTarget ? getUptimeMonitor(connectTarget.id) : null}
          onConnected={loadUptimeMonitors}
        />

        <AlertDialog open={Boolean(applicationToDelete)} onOpenChange={(open) => !open && setApplicationToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete application</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {applicationToDelete?.name || "this application"} and its telemetry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void deleteApplication()}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
