"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { apiDelete, apiGet, apiPutForm } from "@/lib/api"
import { useOrg } from "@/hooks/use-org"
import type { Organization } from "@/lib/types"
import { prepareLogoUpload } from "@/lib/image"
import { UploadIcon } from "lucide-react"

export default function GeneralSettingsPage() {
  const { orgs, activeOrgId, setOrgs, setActiveOrgId } = useOrg()
  const activeOrg = orgs.find((org) => org.id === activeOrgId)
  const [name, setName] = useState("")
  const [plan, setPlan] = useState<Organization["plan"]>("PIRATES")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setName(activeOrg?.name || "")
    setPlan(activeOrg?.plan || "PIRATES")
    setPreview(activeOrg?.logoUrl || "")
    setFile(null)
  }, [activeOrg])

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null
    setFile(selected)
    setPreview(selected ? URL.createObjectURL(selected) : activeOrg?.logoUrl || "")
  }

  const refreshOrganizations = async () => {
    const data = await apiGet<Organization[]>('/org')
    const nextOrgs = Array.isArray(data) ? data : []
    setOrgs(nextOrgs)
    if (!nextOrgs.some((org) => org.id === activeOrgId)) {
      setActiveOrgId(nextOrgs[0]?.id ?? null)
    }
  }

  const saveOrganization = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!activeOrgId || !name.trim()) return

    setIsSaving(true)
    setMessage("")
    try {
      const formData = new FormData()
      if (file) {
        formData.append("file", await prepareLogoUpload(file))
      }
      formData.append("name", name.trim())
      formData.append("plan", plan || "PIRATES")

      await apiPutForm<Organization>(`/org/${activeOrgId}`, formData)
      await refreshOrganizations()
      setMessage("Organization updated.")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update organization")
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDeleteOrganization = (organization: Organization) => {
    setOrganizationToDelete(organization)
  }

  const deleteOrganization = async () => {
    if (!activeOrgId || !organizationToDelete) return

    setIsDeleting(true)
    setMessage("")
    try {
      await apiDelete(`/org/${organizationToDelete.id}`)
      setOrganizationToDelete(null)
      await refreshOrganizations()
      setMessage("Organization deleted.")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete organization")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href="/settings" className="text-muted-foreground/60 hover:text-foreground">
                    Settings
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block opacity-40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground/90">General</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-8 pt-10">
        {!activeOrg ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6 text-sm text-muted-foreground">
            Select or create an organization to edit its settings.
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Organization</p>
                  <h1 className="mt-2 text-2xl font-semibold text-white">General settings</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Update the active organization name, plan, and logo.
                  </p>
                </div>
                <div className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-white/70">
                  ID {activeOrg.id}
                </div>
              </div>

              <form onSubmit={saveOrganization} className="mt-6 grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/90" htmlFor="org-name">
                      Organization name
                    </label>
                    <Input
                      id="org-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Acme Inc."
                      className="h-11 border-white/[0.08] bg-[#0f0f0f] text-white placeholder:text-white/35"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/90" htmlFor="org-plan">
                      Plan
                    </label>
                    <select
                      id="org-plan"
                      value={plan || "PIRATES"}
                      onChange={(event) => setPlan(event.target.value as Organization["plan"])}
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#0f0f0f] px-3 text-sm text-white outline-none [color-scheme:dark]"
                    >
                      {(["PIRATES", "SUPERNOVA", "WARLORD"] as const).map((item) => (
                        <option key={item} value={item} className="bg-[#111111] text-white">
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

                  <Button disabled={isSaving || !name.trim()} className="bg-[#087f9c] text-white hover:bg-[#0aa1c4]">
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white/90">Logo</p>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-10 text-center transition hover:border-[#087f9c]/50 hover:bg-white/[0.04]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#087f9c]/15 text-[#74d7ea]">
                      <UploadIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Upload a new logo</p>
                      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, or SVG</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={selectFile} />
                  </label>
                  {(preview || activeOrg.logoUrl) ? (
                    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e0e]">
                      <img src={preview || activeOrg.logoUrl || ""} alt={activeOrg.name} className="h-48 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0e0e0e] text-sm text-muted-foreground">
                      No logo selected
                    </div>
                  )}
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6">
              <h2 className="text-lg font-bold text-white/90">Danger zone</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Delete this organization and everything under it.
              </p>
              <Button
                onClick={() => confirmDeleteOrganization(activeOrg)}
                disabled={isDeleting}
                variant="outline"
                className="mt-5 border-red-500/20 text-red-200 hover:bg-red-500/10"
              >
                {isDeleting ? "Deleting..." : "Delete Organization"}
              </Button>
            </section>
          </>
        )}
      </main>

      <AlertDialog open={Boolean(organizationToDelete)} onOpenChange={(open) => !open && setOrganizationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organization</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {organizationToDelete?.name || "this organization"} and all of its projects and applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deleteOrganization()} variant="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
