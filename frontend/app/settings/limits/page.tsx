import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { OrgQuotaOverview } from "@/components/settings/org-quota-overview"

export default function LimitsSettingsPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-auto" />
          <span className="text-sm font-medium text-white/90">Settings / Usage & Limits</span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-8 pt-10">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Settings</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white/90">Usage & limits</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track the organization&apos;s quota usage across members, projects, and applications.
          </p>
        </div>

        <OrgQuotaOverview />
      </main>
    </>
  )
}
