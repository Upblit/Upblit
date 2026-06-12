"use client"

import * as React from "react"
import { Organization } from "@/lib/types"
import { useOrg } from "@/hooks/use-org"
import { useUserData } from "@/hooks/use-userData"
import { apiGet, apiPostForm } from "@/lib/api"
import { prepareLogoUpload } from "@/lib/image"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, PlusIcon, Building2Icon } from "lucide-react"

const plans = ["PIRATES", "SUPERNOVA", "WARLORD"] as const
type OrgPlan = (typeof plans)[number]

const planLimits: Record<OrgPlan, Partial<Record<OrgPlan, number>>> = {
  PIRATES: { PIRATES: 1 },
  SUPERNOVA: { PIRATES: 1, SUPERNOVA: 3 },
  WARLORD: {},
}

export function TeamSwitcher({
  teams,
}: {
  teams: Organization[]
}) {
  const { isMobile } = useSidebar()
  const { activeOrgId, setActiveOrgId, setOrgs } = useOrg()
  const accountPlan = useUserData((state) => state.user?.plan ?? "PIRATES")
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [orgName, setOrgName] = React.useState("")
  const [plan, setPlan] = React.useState<OrgPlan>("PIRATES")
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [logoPreview, setLogoPreview] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [error, setError] = React.useState("")

  const activeTeam = teams.find((team) => team.id === activeOrgId) || teams[0]
  const organizationCounts = React.useMemo(
    () =>
      teams.reduce(
        (counts, team) => {
          counts[team.plan as OrgPlan] = (counts[team.plan as OrgPlan] ?? 0) + 1
          return counts
        },
        { PIRATES: 0, SUPERNOVA: 0, WARLORD: 0 } as Record<OrgPlan, number>,
      ),
    [teams],
  )

  const canCreatePlan = React.useCallback(
    (candidate: OrgPlan) => {
      const limit = planLimits[accountPlan as OrgPlan][candidate]
      if (limit === undefined) return accountPlan === "WARLORD"

      return organizationCounts[candidate] < limit
    },
    [accountPlan, organizationCounts],
  )

  const availablePlans = React.useMemo(() => plans.filter((candidate) => canCreatePlan(candidate)), [canCreatePlan])

  React.useEffect(() => {
    if (!availablePlans.includes(plan)) {
      setPlan(availablePlans[0] || "PIRATES")
    }
  }, [availablePlans, plan])

  const quotaMessage = React.useMemo(() => {
    if (accountPlan === "WARLORD") {
      return "Warlord accounts can create unlimited organizations."
    }

    if (accountPlan === "SUPERNOVA") {
      return "SuperNova accounts can create one Pirate organization and up to three SuperNova organizations."
    }

    return "Pirate accounts can create only one Pirate organization."
  }, [accountPlan])

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null
    setLogoFile(selected)
    setLogoPreview(selected ? URL.createObjectURL(selected) : "")
  }

  const createOrganization = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!orgName.trim()) return
    if (!canCreatePlan(plan)) {
      setError(quotaMessage)
      return
    }

    setIsCreating(true)
    setError("")

    try {
      const formData = new FormData()
      if (logoFile) {
        formData.append("file", await prepareLogoUpload(logoFile))
      }
      formData.append("name", orgName.trim())
      formData.append("plan", plan)

      const createdOrg = await apiPostForm<Organization>("/org", formData)
      const orgs = await apiGet<Organization[]>("/org")

      setOrgs(Array.isArray(orgs) ? orgs : [])
      setActiveOrgId(createdOrg.id)
      setOrgName("")
      setPlan("PIRATES")
      setLogoFile(null)
      setLogoPreview("")
      setIsSheetOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-muted data-[state=open]:text-foreground hover:bg-muted/50 transition-all rounded-xl border border-transparent hover:border-border/50 shadow-sm"
              >
                <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#087f9c] to-[#044c5e] text-white overflow-hidden shadow-inner ring-1 ring-white/10">
                  {activeTeam?.logoUrl ? (
                    <img src={activeTeam.logoUrl} alt={activeTeam.name} className="object-cover w-full h-full" />
                  ) : (
                    <Building2Icon className="size-4" />
                  )}
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight ml-1">
                  <span className="truncate font-bold text-foreground/95">{activeTeam?.name || "New organization"}</span>
                  <span className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                    {activeTeam?.plan || "Create workspace"}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ms-auto size-4 opacity-50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-border bg-card text-foreground shadow-2xl"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => setActiveOrgId(team.id)}
                  className="gap-2 p-2 focus:bg-muted"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border border-border overflow-hidden">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="object-cover w-full h-full" />
                    ) : (
                      <Building2Icon className="size-3" />
                    )}
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>Ctrl {index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                disabled={availablePlans.length === 0}
                onClick={() => setIsSheetOpen(true)}
                className="gap-2 p-2 focus:bg-muted disabled:opacity-40"
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-border bg-transparent">
                  <PlusIcon className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add organization</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-background/95 border-l border-border p-8 text-foreground sm:max-w-md">
          <SheetHeader className="gap-1.5 p-0">
            <SheetTitle className="text-2xl font-bold text-foreground/95">New Organization</SheetTitle>
            <SheetDescription>Create a workspace for projects, applications, and telemetry.</SheetDescription>
          </SheetHeader>
          <form onSubmit={createOrganization} className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label htmlFor="org-name" className="text-sm font-semibold text-foreground/90">Organization name</label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                placeholder="e.g. Upblit Labs"
                className="h-11 rounded-xl border-border bg-muted/40 text-foreground"
              />
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-foreground/90">Plan</span>
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/20 p-1">
                {plans.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => canCreatePlan(item) && setPlan(item)}
                    disabled={!canCreatePlan(item)}
                    className={`h-10 rounded-lg text-[11px] font-bold transition-all ${
                      plan === item
                        ? "bg-[#087f9c] text-white shadow-lg shadow-[#087f9c]/15"
                        : canCreatePlan(item)
                          ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                          : "cursor-not-allowed text-muted-foreground/30"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="text-xs leading-5 text-muted-foreground">{quotaMessage}</p>
            </div>
            <div className="flex flex-col gap-3">
              <label htmlFor="org-logo" className="text-sm font-semibold text-foreground/90">Logo</label>
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Organization logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <Building2Icon className="size-5 text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="org-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="h-auto border-border bg-muted/30 text-xs text-foreground"
                />
              </div>
            </div>
            {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            <Button disabled={isCreating || !orgName.trim() || !canCreatePlan(plan)} className="h-11 bg-[#087f9c] text-white hover:bg-[#0aa1c4]">
              {isCreating ? "Creating..." : "Create organization"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
