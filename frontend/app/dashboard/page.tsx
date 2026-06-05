"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
import {
  SearchIcon,
  ArrowUpDownIcon,
  LayoutGridIcon,
  ListIcon,
  MoreVerticalIcon,
  PlusIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjects } from "@/hooks/use-projects"
import { useOrg } from "@/hooks/use-org"
import { apiDelete, apiGet, apiPost, apiPut, QuotaError } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import type { Organization, Project } from "@/lib/types"

const availableZones = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "ap-south-1",
  "ap-southeast-1",
  "eastus",
  "westus2",
  "centralindia",
  "asia-south1",
  "us-central1",
]

const cloudProviders = [
  { name: "AWS", logo: "/cloud-aws.svg" },
  { name: "Azure", logo: "/cloud-azure.svg" },
  { name: "GCP", logo: "/cloud-gcp.svg" },
] as const

function getProjectProvider(project: Project) {
  const value = String(
    project.cloudProviderName ??
    (project as Project & { cloudProvider?: string }).cloudProvider ??
    (project as Project & { provider?: string }).provider ??
    ""
  ).trim()

  const normalized = value.toLowerCase()
  if (normalized.includes("aws") || normalized.includes("amazon")) return "AWS"
  if (normalized.includes("azure") || normalized.includes("microsoft")) return "Azure"
  if (normalized.includes("gcp") || normalized.includes("google")) return "GCP"
  return value
}

function getProjectProviderMeta(project: Project) {
  const providerName = getProjectProvider(project)
  return cloudProviders.find((provider) => provider.name === providerName)
}

function renderProjectProviderBadge(project: Project) {
  const provider = getProjectProviderMeta(project)
  const providerName = getProjectProvider(project)

  if (!provider) {
    return <span>{providerName || "No provider set"}</span>
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.05em] text-muted-foreground/70 shadow-sm">
      <Image src={provider.logo} alt={`${provider.name} logo`} width={16} height={16} className="h-4 w-4 object-contain" />
      <span>{provider.name}</span>
    </span>
  )
}

export default function Page() {
  const router = useRouter()
  const { activeOrgId, orgs, setOrgs, setActiveOrgId } = useOrg()
  const { projects: projectsByOrg, setProjects } = useProjects()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [projectLocation, setProjectLocation] = useState("ap-south-1")
  const [cloudProviderName, setCloudProviderName] = useState<"AWS" | "Azure" | "GCP">("AWS")
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [error, setError] = useState("")
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [cloudProviderFilter, setCloudProviderFilter] = useState("all")
  const [layoutType, setLayoutType] = useState<"grid" | "list">("grid")

  // Data loading logic
  useEffect(() => {
    async function loadOrgs() {
      try {
        const data = await apiGet<Organization[]>("/org")
        setOrgs(data)
        if (data.length > 0 && !activeOrgId) {
          setActiveOrgId(data[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load organizations")
      } finally {
        setIsLoadingOrgs(false)
      }
    }
    loadOrgs()
  }, [setOrgs, setActiveOrgId, activeOrgId])

  useEffect(() => {
    async function loadProjects() {
      if (!activeOrgId) return
      setIsLoadingProjects(true)
      try {
        const data = await apiGet<Project[]>("/project", { OrganizationId: activeOrgId })
        setProjects(activeOrgId, data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects")
        setProjects(activeOrgId, [])
      } finally {
        setIsLoadingProjects(false)
      }
    }
    loadProjects()
  }, [activeOrgId, setProjects])

  const hasOrgCache = orgs.length > 0
  const isInitializing = isLoadingOrgs && !hasOrgCache
  const showProjectSkeletons = isLoadingProjects && activeOrgId !== null && !projectsByOrg[activeOrgId]
  const projects = activeOrgId && projectsByOrg[activeOrgId] ? projectsByOrg[activeOrgId] : [];

  useEffect(() => {
    if (isSheetOpen) {
      setNewProjectName(editingProject?.name || "")
      setProjectLocation(editingProject?.projectLocation || "ap-south-1")
      setCloudProviderName((editingProject?.cloudProviderName as "AWS" | "Azure" | "GCP") || "AWS")
      return
    }

    setEditingProject(null)
  }, [editingProject, isSheetOpen])

  const openCreateProjectSheet = () => {
    setEditingProject(null)
    setNewProjectName("")
    setProjectLocation("ap-south-1")
    setCloudProviderName("AWS")
    setIsSheetOpen(true)
  }

  const openEditProjectSheet = (project: Project) => {
    setEditingProject(project)
    setNewProjectName(project.name || "")
    setProjectLocation(project.projectLocation || "ap-south-1")
    setCloudProviderName((project.cloudProviderName as "AWS" | "Azure" | "GCP") || "AWS")
    setIsSheetOpen(true)
  }

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim() || !activeOrgId) return

    setIsCreating(true)
    setError("")
    try {
      const payload = {
        name: newProjectName,
        projectLocation,
        cloudProviderName,
        organizationId: activeOrgId,
      }

      if (editingProject) {
        await apiPut<Project>(`/project/${editingProject.id}?organizationId=${activeOrgId}`, payload)
      } else {
        await apiPost<Project>("/project", payload)
      }

      const data = await apiGet<Project[]>("/project", { OrganizationId: activeOrgId })
      setProjects(activeOrgId, data)
      setNewProjectName("")
      setProjectLocation("ap-south-1")
      setCloudProviderName("AWS")
      setEditingProject(null)
      setIsSheetOpen(false)
    } catch (err) {
      if (err instanceof QuotaError) {
        setIsSheetOpen(false)
        toast({
          variant: "quota",
          title: `Project limit reached`,
          description: `Your ${err.plan} plan allows ${err.limit} project${err.limit === 1 ? "" : "s"}. You've used ${err.current} of ${err.limit}.`,
          plan: err.plan,
          upgradeUrl: err.upgradeUrl,
        })
      } else {
        setError(err instanceof Error ? err.message : editingProject ? "Failed to update project" : "Failed to create project")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDeleteProject = (project: Project) => {
    setProjectToDelete(project)
  }

  const handleDeleteProject = async () => {
    if (!activeOrgId || !projectToDelete) return

    setError("")
    try {
      await apiDelete(`/project/${projectToDelete.id}?organizationId=${activeOrgId}`)
      setProjectToDelete(null)
      const data = await apiGet<Project[]>("/project", { OrganizationId: activeOrgId })
      setProjects(activeOrgId, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project")
    }
  }

  const activeOrg = orgs.find(o => o.id === activeOrgId)

  const filteredAndSortedProjects = [...projects]
    .filter((p: Project) => {
      const name = (p.name || "").replace(/^"|"$/g, "").toLowerCase()
      const matchesSearch = name.includes(searchQuery.toLowerCase())
      const matchesFilter =
        cloudProviderFilter === "all" ||
        getProjectProvider(p) === cloudProviderFilter

      return matchesSearch && matchesFilter
    })
    .sort((a: Project, b: Project) => {
      const nameA = (a.name || "").replace(/^"|"$/g, "")
      const nameB = (b.name || "").replace(/^"|"$/g, "")
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#0a0a0a]">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-white/[0.05]">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="me-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors">
                    {activeOrg?.name || "Organization"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block opacity-40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground/90 font-medium">Projects</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

          <div className="flex flex-1 flex-col gap-10 p-8 pt-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold tracking-tight text-white/90">Projects</h1>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-1 min-w-[300px] items-center gap-3">
                <div className="relative flex-1 max-w-xs group">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                  <Input
                    placeholder="Search for a project"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/[0.03] border-white/[0.08] focus-visible:border-white/[0.2] focus-visible:ring-0 h-9 text-sm"
                  />
                </div>
                <select
                  value={cloudProviderFilter}
                  onChange={(event) => setCloudProviderFilter(event.target.value)}
                  className="h-9 rounded-lg border border-white/[0.08] bg-[#111111] px-3 text-xs font-medium text-white outline-none [color-scheme:dark] hover:bg-[#161616] focus:border-[#087f9c]/50 focus:ring-4 focus:ring-[#087f9c]/10"
                  aria-label="Filter projects by cloud provider"
                >
                  <option value="all" className="bg-[#111111] text-white">All providers</option>
                  {cloudProviders.map((provider) => (
                    <option key={provider.name} value={provider.name} className="bg-[#111111] text-white">
                      {provider.name}
                    </option>
                  ))}
                </select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] gap-2 h-9 text-xs font-medium px-4"
                >
                  <ArrowUpDownIcon className="size-3.5 opacity-60" />
                  {sortOrder === "asc" ? "Name (A-Z)" : "Name (Z-A)"}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg bg-white/[0.03] p-1 border border-white/[0.08]">
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    onClick={() => setLayoutType("grid")}
                    className={`h-7 w-7 rounded-md transition-all ${layoutType === "grid" ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutGridIcon className="size-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    onClick={() => setLayoutType("list")}
                    className={`h-7 w-7 rounded-md transition-all ${layoutType === "list" ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ListIcon className="size-4" />
                  </Button>
                </div>

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button onClick={openCreateProjectSheet} size="sm" className="bg-[#087f9c] hover:bg-[#0aa1c4] text-white gap-2 h-9 px-4 font-semibold rounded-lg shadow-lg shadow-[#087f9c]/10 transition-all active:scale-95">
                      <PlusIcon className="size-4" />
                      New project
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/[0.08] text-foreground p-8 sm:max-w-md shadow-2xl">
                    <SheetHeader className="gap-1.5">
                      <SheetTitle className="text-2xl font-bold tracking-tight text-white/95">
                        {editingProject ? "Edit Project" : "Create New Project"}
                      </SheetTitle>
                      <SheetDescription className="text-muted-foreground/80 text-sm">
                        {editingProject
                          ? "Update the project details and save the changes."
                          : "Give your project a name. You can manage its applications later."}
                      </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmitProject} className="mt-8 flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <label htmlFor="name" className="text-sm font-semibold text-white/90">Project Name</label>
                        <Input
                          id="name"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="e.g. Production Infrastructure"
                          className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] focus-visible:bg-white/[0.05] focus-visible:border-[#087f9c]/50 focus-visible:ring-4 focus-visible:ring-[#087f9c]/10 transition-all h-11 text-base px-4 rounded-xl shadow-inner"
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label htmlFor="location" className="text-sm font-semibold text-white/90">Available Zone</label>
                        <select
                          id="location"
                          value={projectLocation}
                          onChange={(e) => setProjectLocation(e.target.value)}
                          className="h-11 rounded-xl border border-white/[0.08] bg-[#111111] px-4 text-sm text-white outline-none transition-all [color-scheme:dark] hover:bg-[#161616] focus:border-[#087f9c]/50 focus:ring-4 focus:ring-[#087f9c]/10"
                        >
                          {availableZones.map((zone) => (
                            <option key={zone} value={zone} className="bg-[#111111] text-white">{zone}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="text-sm font-semibold text-white/90">Cloud Provider</span>
                        <div className="grid grid-cols-3 gap-3">
                          {cloudProviders.map((provider) => (
                            <button
                              key={provider.name}
                              type="button"
                              onClick={() => setCloudProviderName(provider.name)}
                              className={`flex h-20 flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all ${
                                cloudProviderName === provider.name
                                  ? "border-[#087f9c]/60 bg-[#087f9c]/15 ring-4 ring-[#087f9c]/10"
                                  : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
                              }`}
                            >
                              <Image src={provider.logo} alt={`${provider.name} logo`} width={48} height={32} className="h-8 w-12 object-contain" />
                              <span className="text-xs font-bold text-white/85">{provider.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button type="submit" disabled={isCreating || !newProjectName.trim()} className="mt-2 bg-[#087f9c] hover:bg-[#0aa1c4] hover:shadow-lg hover:shadow-[#087f9c]/25 text-white w-full h-11 rounded-xl font-semibold transition-all active:scale-[0.98]">
                        {isCreating ? (editingProject ? "Saving Changes..." : "Creating Project...") : editingProject ? "Save Changes" : "Create Project"}
                      </Button>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

          {isInitializing ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border border-white/[0.08] bg-[#111111] p-7">
                  <Skeleton className="h-5 w-32 rounded-md bg-white/[0.04]" />
                  <Skeleton className="mt-4 h-4 w-48 rounded-md bg-white/[0.04]" />
                  <Skeleton className="mt-8 h-8 w-24 rounded-md bg-white/[0.04]" />
                </div>
              ))}
            </div>
          ) : showProjectSkeletons ? (
            <div className={layoutType === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" : "flex flex-col gap-4"}>
              {[1, 2, 3].map((item) => (
                <div key={item} className={`rounded-2xl border border-white/[0.08] bg-[#111111] p-7 ${layoutType === "grid" ? "min-h-[180px]" : "min-h-[80px]"}`}>
                  <Skeleton className="h-5 w-36 rounded-md bg-white/[0.04]" />
                  <Skeleton className="mt-3 h-4 w-48 rounded-md bg-white/[0.04]" />
                  <div className="mt-8 flex items-center justify-between">
                    <Skeleton className="h-6 w-24 rounded-md bg-white/[0.04]" />
                    <Skeleton className="h-8 w-8 rounded-md bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!activeOrgId ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/[0.08] bg-white/[0.01]">
              <h3 className="text-xl font-semibold text-white/90 mb-2">No organization selected</h3>
              <p className="text-muted-foreground max-w-sm">
                Create or join an organization to start adding projects.
              </p>
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/[0.08] bg-white/[0.01]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.03] mb-6">
                <SearchIcon className="size-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-white/90 mb-2">No projects found</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                {projects.length === 0 
                  ? "You haven't created any projects in this organization yet."
                  : "No projects match your search criteria."}
              </p>
              {projects.length === 0 && (
                <Button size="sm" onClick={() => setIsSheetOpen(true)} className="bg-[#087f9c] hover:bg-[#0aa1c4] text-white gap-2 px-6 font-semibold shadow-lg shadow-[#087f9c]/10 transition-all active:scale-95">
                  <PlusIcon className="size-4" />
                  Create your first project
                </Button>
              )}
            </div>
          ) : (
            <div className={layoutType === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" : "flex flex-col gap-4"}>
              {filteredAndSortedProjects.map((project: Project) => (
                <article
                  key={project.id || project.name}
                  className={`group relative flex rounded-2xl border border-white/[0.08] bg-[#111111] transition-all duration-300 hover:border-white/[0.15] hover:bg-[#161616] hover:shadow-2xl hover:shadow-black/50 ${
                    layoutType === "grid" ? "flex-col justify-between p-7 min-h-[180px]" : "flex-row items-center justify-between p-5 min-h-[80px]"
                  }`}
                >
                  <Link
                    href={`/dashboard/${project.id}`}
                    className="absolute inset-0 z-0 rounded-2xl"
                    aria-label={`Open ${project.name || "project"}`}
                  >
                    <span className="sr-only">Open project</span>
                  </Link>

                  <div className="relative z-10 flex w-full flex-col gap-0 pointer-events-none">
                    <div className={`flex ${layoutType === "grid" ? "items-start justify-between w-full" : "items-center gap-4 w-full"}`}>
                      <div className="space-y-1.5 flex-1">
                        <h3 className={`font-bold text-white/90 group-hover:text-white transition-colors ${layoutType === "grid" ? "text-xl" : "text-lg"}`}>
                          {project.name?.replace(/^"|"$/g, '')}
                        </h3>
                        {layoutType === "grid" && (
                          <p className="text-sm text-muted-foreground/80 font-medium tracking-tight">
                            {project.projectLocation || "No location set"}
                          </p>
                        )}
                      </div>

                      {layoutType === "list" && (
                        <div className="flex items-center gap-6 mr-2">
                          {renderProjectProviderBadge(project)}
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={`relative z-20 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/50 transition-all hover:bg-white/[0.06] hover:text-foreground pointer-events-auto ${layoutType === "grid" ? "-mr-2" : ""}`}
                            aria-label={`Open actions for ${project.name || "project"}`}
                          >
                            <MoreVerticalIcon className="size-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 border-white/[0.08] bg-[#111111] text-white shadow-2xl">
                          <DropdownMenuItem
                            onSelect={() => openEditProjectSheet(project)}
                            className="cursor-pointer"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => confirmDeleteProject(project)}
                            className="cursor-pointer"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {layoutType === "grid" && (
                      <div className="relative z-10 mt-8">
                        {renderProjectProviderBadge(project)}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <AlertDialog open={Boolean(projectToDelete)} onOpenChange={(open) => !open && setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {projectToDelete?.name || "this project"} and all of its applications.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void handleDeleteProject()} variant="destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
