"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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
import { apiDelete, apiPost, apiPostForm } from "@/lib/api"
import { useOrg } from "@/hooks/use-org"
import type { TenantDTO } from "@/lib/types"
import { BotIcon, FileTextIcon, Trash2Icon, UploadIcon } from "lucide-react"

type UploadedDoc = {
  id: number
  name: string
}

function readId(value: unknown) {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value)
  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === "number" ? id : Number(id)
  }
  return Number.NaN
}

export default function AiDocsPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = Number(params.projectId)
  const { activeOrgId, orgs } = useOrg()
  const activeOrg = orgs.find((org) => org.id === activeOrgId)
  const [tenantId, setTenantId] = useState<number | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([])

  useEffect(() => {
    async function ensureTenant() {
      if (!activeOrgId || !activeOrg?.name) return
      try {
        const body: TenantDTO = { name: activeOrg.name, organizationId: activeOrgId }
        const tenant = await apiPost<unknown>("/ai/tenant", body)
        const id = readId(tenant)
        if (Number.isFinite(id)) {
          setTenantId(id)
        }
      } catch (err) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "Failed to prepare tenant")
      }
    }
    ensureTenant()
  }, [activeOrgId, activeOrg?.name])

  const uploadDocument = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file || !tenantId) return

    setStatus("uploading")
    setMessage("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await apiPostForm<unknown>(`/ai/docs?TenantId=${tenantId}`, formData)
      const id = readId(result)
      setUploadedDocs((docs) => [...docs, { id: Number.isFinite(id) ? id : Date.now(), name: file.name }])
      setFile(null)
      setStatus("success")
      setMessage("Document uploaded.")
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Upload failed")
    }
  }

  const deleteDocument = async (id: number) => {
    setMessage("")
    try {
      await apiDelete("/ai/docs", { docs_id: id })
      setUploadedDocs((docs) => docs.filter((doc) => doc.id !== id))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Delete failed")
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-muted-foreground/60 hover:text-foreground">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block opacity-40" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/dashboard/${projectId}`} className="text-muted-foreground/60 hover:text-foreground">Project {projectId}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block opacity-40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground/90 font-medium">AI Docs</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-8 pt-10">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground/90">
              <BotIcon className="size-7 text-[#087f9c]" />
              AI Docs
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Upload project documents for assistant context.</p>
          </div>

          <form onSubmit={uploadDocument} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground/90">Upload Document</h2>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row">
              <Input type="file" accept=".pdf,.docx,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} className="h-auto border-border bg-muted/40 text-foreground" />
              <Button disabled={!file || !tenantId || status === "uploading"} className="gap-2 bg-[#087f9c] text-white hover:bg-[#0aa1c4]">
                <UploadIcon className="size-4" />
                {status === "uploading" ? "Uploading..." : "Upload"}
              </Button>
            </div>
            {message && <p className={`mt-4 text-sm ${status === "error" ? "text-red-600 dark:text-red-200" : "text-muted-foreground"}`}>{message}</p>}
          </form>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground/90">Uploaded Documents</h2>
            {uploadedDocs.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">Uploaded documents will appear here for this session.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileTextIcon className="size-5 shrink-0 text-[#087f9c]" />
                      <span className="truncate text-sm font-medium text-foreground/90">{doc.name}</span>
                    </div>
                    <Button onClick={() => deleteDocument(doc.id)} variant="outline" size="sm" className="gap-2 border-border bg-muted/40 text-foreground">
                      <Trash2Icon className="size-4" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
