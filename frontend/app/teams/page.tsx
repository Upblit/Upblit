"use client"

import react from "react"
import { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/api"
import { useOrg } from "@/hooks/use-org"
import { useUserData } from "@/hooks/use-userData"
import { toast } from "@/hooks/use-toast"
import type { Organization } from "@/lib/types"
import { ChevronDown, Crown, Ghost, Shield, UserRound } from "lucide-react"
import React from "react"

type Invite = {
  id: string
  organizationId?: number
  createdAt?: string
  expiresAt?: string
  active?: boolean
  email?: string
  publicLink?: string
  publicToken?: string
}

type Member = {
  id: number
  username: string
  email: string
  role: string
}

export default function TeamSettingsPage() {
  const { orgs, activeOrgId, setOrgs } = useOrg()
  const activeOrg = orgs.find((o) => o.id === activeOrgId) as Organization | undefined

  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [inviteMessage, setInviteMessage] = useState("")
  const [publicLinkMessage, setPublicLinkMessage] = useState("")
  const [invites, setInvites] = useState<Invite[]>([])
  const [publicInviteLink, setPublicInviteLink] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const currentUser = useUserData((s) => s.user)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [pendingOwnerTransfer, setPendingOwnerTransfer] = useState<Member | null>(null)

  useEffect(() => {
    if (!activeOrgId) return
    fetchInvites()
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId])

  const fetchMembers = async () => {
    if (!activeOrgId) return
    try {
      const data = await apiGet<any>(`/org/${activeOrgId}/members`)
      if (Array.isArray(data)) {
        // map to Member
        const m = data.map((it: any) => ({
          id: it.user?.id,
          username: it.user?.username,
          email: it.user?.email,
          role: it.role,
        }))
        setMembers(m)
      } else {
        setMembers([])
      }
    } catch (_) {
      setMembers([])
    }
  }

  React.useEffect(() => {
    if (!currentUser) {
      setCurrentUserRole(null)
      return
    }
    const myId = (currentUser as any)?.id
    const me = typeof myId !== "undefined" ? members.find((mm) => mm.id === myId) : undefined
    setCurrentUserRole(me?.role ?? null)
  }, [members, currentUser])

  const fetchInvites = async () => {
    if (!activeOrgId) return
    try {
      const data = await apiGet<Invite[]>(`/invite/organization/${activeOrgId}`)
      const baseInvites = Array.isArray(data) ? data : []
      setInvites(baseInvites)

      // Try to enrich invites with additional details (some APIs return limited data)
      const enrich = await Promise.all(
        baseInvites.map(async (inv) => {
          if (inv.email) return inv
          try {
            const details = await apiGet<any>(`/invite/${inv.id}`)
            return { ...inv, ...(details || {}) }
          } catch {
            return inv
          }
        })
      )
      setInvites(enrich)
    } catch (err) {
      // ignore for now
    }
  }

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !activeOrgId) return
    // basic email validation
    const emailTrim = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailTrim)) {
      setInviteMessage("Please enter a valid email address.")
      return
    }
    setIsInviting(true)
    setInviteMessage("")
    try {
      await apiPost<any>("/invite", { organizationId: activeOrgId, email: email.trim() })
      setEmail("")
      setInviteMessage("Invite sent.")
      await fetchInvites()
    } catch (err) {
      setInviteMessage(err instanceof Error ? err.message : "Failed to send invite")
    } finally {
      setIsInviting(false)
    }
  }

  const cancelInvite = async (id: string) => {
    try {
      await apiDelete(`/invite/${id}`)
      setInvites((cur) => cur.filter((i) => i.id !== id))
    } catch (_) {
      // ignore
    }
  }

  const deactivateInvite = async (id: string) => {
    try {
      await apiPut(`/invite/${id}/deactivate`)
      // Refresh invites list
      await fetchInvites()
    } catch (_) {
      // ignore
    }
  }

  const activateInvite = async (id: string) => {
    try {
      await apiPut(`/invite/${id}/activate`)
      await fetchInvites()
    } catch (_) {
      // ignore
    }
  }

  const resendInvite = async (inv: Invite) => {
    if (!activeOrgId) return
    try {
      if (!inv.email) {
        throw new Error("This invite does not have an email address to resend.")
      }
      await apiPost<any>("/invite", { organizationId: activeOrgId, email: inv.email })
      setInviteMessage("Invite resent.")
      await fetchInvites()
    } catch (err) {
      setInviteMessage(err instanceof Error ? err.message : "Failed to resend invite")
    }
  }

  const normalizePublicLink = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return ""
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    const token = trimmed.replace(/^\/+/, "")
    if (token.includes("/")) return `${window.location.origin}/${token}`
    return `${window.location.origin}/invite/public/${encodeURIComponent(token)}`
  }

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setPublicLinkMessage("Public link copied to clipboard.")
    } catch (err) {
      setPublicLinkMessage(err instanceof Error ? err.message : "Failed to copy public link")
    }
  }

  const createPublicLink = async () => {
    if (!activeOrgId) return
    setIsGeneratingLink(true)
    setPublicLinkMessage("")
    try {
      const res = await apiPost<string>(`/invite/public-link`, activeOrgId)
      const rawLink = typeof res === "string" ? res : ""
      const link = normalizePublicLink(rawLink)
      if (!link) {
        setPublicLinkMessage("Public link created, but the backend did not return a usable value.")
        return
      }
      setPublicInviteLink(link)
      await copyLink(link)
    } catch (err) {
      setPublicLinkMessage(err instanceof Error ? err.message : "Failed to create public link")
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const acceptInvite = async (id: string) => {
    try {
      await apiPost<any>(`/invite/${id}/accept`)
      setInviteMessage("Invite accepted.")
      await fetchInvites()
      // refresh orgs/users
      const data = await apiGet<Organization[]>('/org')
      setOrgs(Array.isArray(data) ? data : [])
    } catch (err) {
      setInviteMessage(err instanceof Error ? err.message : "Failed to accept invite")
    }
  }

  const removeMember = async (userId: number) => {
    if (!activeOrgId) return
    try {
      await apiDelete(`/org/${activeOrgId}/member/${userId}`)
      // Optimistically update local orgs in store by re-fetching org list
      const data = await apiGet<Organization[]>("/org")
      setOrgs(Array.isArray(data) ? data : [])
      await fetchMembers()
    } catch (_) {
      // ignore
    }
  }

  const changeRole = async (userId: number, newRole: string) => {
    if (!activeOrgId) return
    try {
      await apiPut(`/org/${activeOrgId}/member/${userId}/role?role=${encodeURIComponent(newRole)}`)
      await fetchMembers()
      const data = await apiGet<Organization[]>('/org')
      setOrgs(Array.isArray(data) ? data : [])
    } catch (err) {
      if (newRole === "OWNER") {
        toast({
          variant: "error",
          title: "Ownership transfer failed",
          description: "This member cannot be assigned as owner right now.",
          duration: 7000,
        })
      }
    }
  }

  const requestOwnerTransfer = (member: Member) => {
    setPendingOwnerTransfer(member)
  }

  const confirmOwnerTransfer = async () => {
    if (!pendingOwnerTransfer) return
    const member = pendingOwnerTransfer
    setPendingOwnerTransfer(null)
    await changeRole(member.id, "OWNER")
  }

  // Only allow invite action for OWNER or ADMIN. Disable while role is loading.
  const canInvite = currentUserRole === "OWNER" || currentUserRole === "ADMIN"
  const canChangeRole = currentUserRole === "OWNER"
  const canRemove = (targetRole: string | undefined) => {
    if (!currentUserRole) return false
    if (currentUserRole === "OWNER") return true
    if (currentUserRole === "ADMIN") return targetRole !== "OWNER"
    return false
  }

  const refreshOrganizations = async () => {
    const data = await apiGet<Organization[]>('/org')
    setOrgs(Array.isArray(data) ? data : [])
  }

  const currentUserId = (currentUser as any)?.id
  const roleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Owner"
      case "ADMIN":
        return "Admin"
      case "MEMBER":
        return "Member"
      case "GUEST":
        return "Guest"
      default:
        return role
    }
  }

  const roleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="size-4 text-amber-300" />
      case "ADMIN":
        return <Shield className="size-4 text-sky-300" />
      case "MEMBER":
        return <UserRound className="size-4 text-emerald-300" />
      case "GUEST":
        return <Ghost className="size-4 text-violet-300" />
      default:
        return <UserRound className="size-4 text-slate-300" />
    }
  }

  const roleOptions: Array<{ value: string; label: string; icon: React.ReactNode }> = [
    { value: "ADMIN", label: "Admin", icon: <Shield className="size-4 text-sky-300" /> },
    { value: "MEMBER", label: "Member", icon: <UserRound className="size-4 text-emerald-300" /> },
    { value: "GUEST", label: "Guest", icon: <Ghost className="size-4 text-violet-300" /> },
  ]

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/settings" className="text-muted-foreground/60 hover:text-foreground">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block opacity-40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground/90 font-medium">Team</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-8 pt-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white/90">Team</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage organization invites and members for {activeOrg?.name || "your workspace"}.</p>
        </div>

        <section className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white/90">Public invite link</h2>
              <p className="mt-2 text-sm text-muted-foreground">Generate a shareable frontend link for the currently selected organization.</p>
            </div>
            <Button
              type="button"
              className="bg-[#087f9c] text-white hover:bg-[#0aa1c4]"
              onClick={createPublicLink}
              disabled={isGeneratingLink || !activeOrgId || !canInvite}
            >
              {isGeneratingLink ? "Generating..." : "Generate link"}
            </Button>
          </div>

          {publicLinkMessage && <p className="mt-4 text-sm text-muted-foreground">{publicLinkMessage}</p>}

          {publicInviteLink && (
            <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <a className="break-all text-green-300 underline" href={publicInviteLink} target="_blank" rel="noreferrer">
                  {publicInviteLink}
                </a>
                <Button type="button" variant="secondary" onClick={() => copyLink(publicInviteLink)}>
                  Copy link
                </Button>
              </div>
            </div>
          )}
        </section>

        <form onSubmit={sendInvite} className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_150px]">
            <div>
              <label className="text-sm font-semibold text-white/90" htmlFor="invite-email">Invite by email</label>
              <Input id="invite-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="mt-2 h-11 border-white/[0.08] bg-white/[0.03]" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-[#087f9c] text-white hover:bg-[#0aa1c4]" disabled={!canInvite || isInviting || !email.trim()}>
                {isInviting ? "Sending..." : "Send invite"}
              </Button>
            </div>
          </div>
          {inviteMessage && <p className="mt-3 text-sm text-muted-foreground">{inviteMessage}</p>}
        </form>

        <section className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
          <h2 className="text-lg font-bold text-white/90">Pending invites</h2>
          <p className="mt-2 text-sm text-muted-foreground">Invites that have not yet been accepted.</p>

          <div className="mt-4 space-y-3">
            {invites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending invites.</p>
            ) : (
              invites.map((inv) => (
                <div key={inv.id} className="flex flex-col gap-4 rounded-lg border border-white/[0.04] bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-white/90">
                        {inv.email ? inv.email : "Public invite"}
                      </div>
                      <div className="rounded-full border border-white/[0.08] px-2 py-0.5 text-xs text-muted-foreground">
                        {inv.active ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : "-"}
                    </div>
                    {!inv.email && inv.publicToken && (
                      <div className="mt-2 text-sm">
                        <div className="flex items-center gap-2">
                          <a
                            className="break-all text-green-300 underline"
                            href={`${window.location.origin}/invite/public/${encodeURIComponent(inv.publicToken)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {`${window.location.origin}/invite/public/${inv.publicToken}`}
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await copyLink(`${window.location.origin}/invite/public/${inv.publicToken}`)
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {inv.email ? (
                      <>
                        <Button variant="ghost" onClick={() => resendInvite(inv)} className="text-green-400">
                          Resend
                        </Button>
                        <Button variant="ghost" onClick={() => cancelInvite(inv.id)} className="text-red-400">
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        {inv.active ? (
                          <Button variant="ghost" onClick={() => deactivateInvite(inv.id)} className="text-yellow-400">
                            Deactivate
                          </Button>
                        ) : (
                          <Button variant="ghost" onClick={() => activateInvite(inv.id)} className="text-emerald-400">
                            Activate
                          </Button>
                        )}
                        <Button variant="ghost" onClick={() => cancelInvite(inv.id)} className="text-red-400">
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
          <h2 className="text-lg font-bold text-white/90">Members</h2>
          <p className="mt-2 text-sm text-muted-foreground">Current members of the active organization.</p>

          <div className="mt-4 space-y-3">
            {members.length ? (
              members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.08] hover:bg-white/[0.035]">
                  <div>
                    <div className="font-medium text-white/90">{m.username}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <label className="whitespace-nowrap">Role:</label>
                      {canChangeRole && m.id !== currentUserId ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 gap-2 border-white/[0.08] bg-white/[0.04] px-3 text-xs text-white/90 hover:bg-white/[0.08]"
                            >
                              {roleIcon(m.role)}
                              <span>{roleLabel(m.role)}</span>
                              <ChevronDown className="size-3.5 opacity-70" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-52 border-white/[0.08] bg-[#0f1115] text-white shadow-2xl">
                            <DropdownMenuLabel className="px-2 py-1 text-[11px] uppercase tracking-[0.22em] text-white/45">
                              Change role
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/[0.08]" />
                            {roleOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onSelect={(event) => {
                                  event.preventDefault()
                                  void changeRole(m.id, option.value)
                                }}
                                className="cursor-pointer gap-2 px-2 py-2 text-sm text-white/85 focus:bg-white/10 focus:text-white"
                              >
                                {option.icon}
                                <span>{option.label}</span>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="bg-white/[0.08]" />
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault()
                                requestOwnerTransfer(m)
                              }}
                              className="cursor-pointer gap-2 px-2 py-2 text-sm text-amber-200 focus:bg-amber-400/10 focus:text-amber-100"
                            >
                              <Crown className="size-4 text-amber-300" />
                              Transfer ownership
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-white/80">
                          {roleIcon(m.role)}
                          <span>{roleLabel(m.role)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => removeMember(m.id)} className="text-red-400" disabled={!canRemove(m.role)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No members found for this organization.</p>
            )}
          </div>
        </section>
      </main>

      <AlertDialog open={Boolean(pendingOwnerTransfer)} onOpenChange={(open) => !open && setPendingOwnerTransfer(null)}>
        <AlertDialogContent className="border-white/[0.08] bg-[#0f1115] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/65">
              {pendingOwnerTransfer
                ? `This will make ${pendingOwnerTransfer.username || pendingOwnerTransfer.email || "this member"} the new owner of ${activeOrg?.name || "this organization"}. You will lose owner privileges after the transfer.`
                : "Confirm the new owner for this organization."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-[#087f9c] text-white hover:bg-[#0aa1c4]" onClick={confirmOwnerTransfer}>
              Transfer ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
