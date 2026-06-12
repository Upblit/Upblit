"use client"

import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, SparklesIcon, BadgeCheckIcon, CreditCardIcon, BellIcon, LogOutIcon } from "lucide-react"
import ThemeToggle from "./theme-toggle"
import { apiGet, apiPutForm, apiDelete } from "@/lib/api"
import { useUserData } from "@/hooks/use-userData"
import { useRouter } from "next/navigation"
import { useOrg } from "@/hooks/use-org"
import { AUTH_TOKEN_KEY, LEGACY_TOKEN_KEY } from "@/lib/auth-storage"
import type { Organization, User } from "@/lib/types"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const logout = useUserData((state) => state.logout)
  const currentUser = useUserData((state) => state.user)
  const updateUser = useUserData((state) => state.updateUser)
  const setOrgs = useOrg((state) => state.setOrgs)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const [profileUsername, setProfileUsername] = React.useState("")
  const [profileEmail, setProfileEmail] = React.useState("")
  const [profileAvatarUrl, setProfileAvatarUrl] = React.useState("")
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [profileMessage, setProfileMessage] = React.useState("")
  const [isSavingProfile, setIsSavingProfile] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    setProfileUsername(currentUser?.username ?? "")
    setProfileEmail(currentUser?.email ?? "")
    setProfileAvatarUrl(currentUser?.avatar ?? "")
  }, [currentUser, accountOpen])

  React.useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null)
      return
    }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    logout()
    router.replace("/")
  }

  const refreshOrganizations = async () => {
    const data = await apiGet<Organization[]>("/org")
    setOrgs(Array.isArray(data) ? data : [])
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profileUsername.trim() || !profileEmail.trim()) return

    setIsSavingProfile(true)
    setProfileMessage("")

    try {
      const form = new FormData()
      form.append("username", profileUsername.trim())
      form.append("email", profileEmail.trim())
      if (avatarFile) {
        form.append("file", avatarFile)
      }

      const updated = await apiPutForm<User>("/User", form)

      updateUser({
        username: updated.username,
        email: updated.email,
        avatarUrl: (updated as any).avatarUrl || (updated as any).avatar || profileAvatarUrl,
      })

      await refreshOrganizations()
      setProfileMessage("Profile updated.")
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Determine upgrade label based on current plan
  const plan = currentUser?.plan ?? "PIRATES"
  let upgradeLabel: string | null = "Upgrade to Pro"
  if (plan === "PIRATES") upgradeLabel = "Upgrade to Supernova"
  else if (plan === "SUPERNOVA") upgradeLabel = "Upgrade to Warlord"
  else if (plan === "WARLORD") upgradeLabel = null

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all rounded-xl border border-transparent hover:border-sidebar-border shadow-sm mb-2"
              >
                <Avatar className="h-9 w-9 rounded-lg border border-sidebar-border/60 shadow-inner">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#087f9c] to-[#044c5e] text-white">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight ml-1">
                  <span className="truncate font-semibold text-sidebar-foreground">{user.name}</span>
                  <span className="truncate text-[11px] text-sidebar-foreground/60">{user.email}</span>
                </div>
                <ChevronsUpDownIcon className="ms-auto size-4 opacity-50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {upgradeLabel && (
                  <DropdownMenuItem onSelect={(event) => {
                    event.preventDefault()
                    router.push("/pricing")
                  }}>
                    <SparklesIcon
                    />
                    {upgradeLabel}
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={(event) => {
                  event.preventDefault()
                  setAccountOpen(true)
                }}>
                  <BadgeCheckIcon
                  />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(event) => {
                  event.preventDefault()
                  router.push('/account/billing')
                }}>
                  <CreditCardIcon />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellIcon
                  />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <ThemeToggle />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon
                />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="bg-background text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your authenticated user profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={saveProfile} className="grid gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground/90" htmlFor="account-username">Username</label>
              <Input id="account-username" value={profileUsername} onChange={(event) => setProfileUsername(event.target.value)} className="mt-2 h-11 border-border bg-muted/40 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground/90" htmlFor="account-email">Email</label>
              <Input id="account-email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="mt-2 h-11 border-border bg-muted/40 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground/90" htmlFor="account-avatar">Avatar</label>
              <div className="mt-2 flex items-center gap-3">
                <input ref={fileInputRef} id="account-avatar" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Upload logo
                </Button>
                <div className="text-xs text-muted-foreground">PNG/JPEG, recommended 256x256.</div>
              </div>
              {avatarPreview ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={avatarPreview} alt="selected avatar preview" className="h-12 w-12 rounded-md object-cover" />
                  <div className="text-sm">{avatarFile?.name}</div>
                  <Button variant="ghost" size="sm" onClick={() => setAvatarFile(null)}>Clear</Button>
                </div>
              ) : profileAvatarUrl ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={profileAvatarUrl} alt="avatar" className="h-12 w-12 rounded-md object-cover" />
                  <div className="text-sm text-muted-foreground">Current avatar</div>
                </div>
              ) : null}
            </div>

            {profileMessage && <p className="text-sm text-muted-foreground">{profileMessage}</p>}

            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-200">Delete account</p>
                  <p className="mt-1 text-xs text-red-500/80 dark:text-red-100/80">
                    This will permanently delete your account and any organizations you own.
                  </p>
                </div>
                <Button type="button" variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                  Delete User
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setAccountOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#087f9c] text-white hover:bg-[#0aa1c4]" disabled={isSavingProfile || !profileUsername.trim() || !profileEmail.trim()}>
                {isSavingProfile ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently delete your account and any organizations you own. To confirm, type "delete {profileUsername}" below and click Delete.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <label className="text-sm font-semibold text-foreground/90">Confirmation</label>
            <Input value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder={`delete ${profileUsername}`} className="mt-2 h-11 border-border bg-muted/40 text-foreground" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white" disabled={isDeleting || deleteConfirmation !== `delete ${profileUsername}`} onClick={async () => {
              try {
                setIsDeleting(true)
                await apiDelete("/User")
                handleLogout()
                router.replace("/")
              } catch (err) {
                console.error(err)
                alert(err instanceof Error ? err.message : "Failed to delete account")
              } finally {
                setIsDeleting(false)
              }
            }}>{isDeleting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
