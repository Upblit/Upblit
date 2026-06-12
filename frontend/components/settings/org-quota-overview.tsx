"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"
import { useOrg } from "@/hooks/use-org"
import { useProjects } from "@/hooks/use-projects"
import type { Application, Organization } from "@/lib/types"

type PlanKey = NonNullable<Organization["plan"]>

type PlanQuota = {
  members: number
  projects: number
  applications: number
}

const PLAN_QUOTAS: Record<PlanKey, PlanQuota> = {
  PIRATES: { members: 5, projects: 3, applications: 10 },
  SUPERNOVA: { members: 20, projects: 10, applications: 50 },
  WARLORD: { members: Number.POSITIVE_INFINITY, projects: Number.POSITIVE_INFINITY, applications: Number.POSITIVE_INFINITY },
}

const PLAN_LABELS: Record<PlanKey, string> = {
  PIRATES: "Pirate",
  SUPERNOVA: "Supernova",
  WARLORD: "Warlord",
}

function limitLabel(limit: number) {
  return Number.isFinite(limit) ? String(limit) : "Unlimited"
}

function percentUsed(used: number, limit: number) {
  if (!Number.isFinite(limit) || limit <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((used / limit) * 100)))
}

function QuotaCard({
  label,
  used,
  limit,
  detail,
}: {
  label: string
  used: number
  limit: number
  detail: string
}) {
  const percentage = percentUsed(used, limit)
  return (
    <div className="rounded-2xl border border-foreground/[0.08] bg-card/[0.035] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground/86">{label}</p>
          <p className="mt-1 text-xs text-foreground/42">{detail}</p>
        </div>
        <p className="text-right text-sm font-semibold text-foreground/88">
          {used} <span className="text-foreground/35">/ {limitLabel(limit)}</span>
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
          style={{ width: `${limitLabel(limit) === "Unlimited" ? 100 : percentage}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-foreground/42">{limitLabel(limit) === "Unlimited" ? "No enforced cap on this plan." : `${percentage}% of plan quota used.`}</p>
    </div>
  )
}

export function OrgQuotaOverview() {
  const { orgs, activeOrgId } = useOrg()
  const projectsByOrg = useProjects((state) => state.projects)
  const activeOrg = orgs.find((org) => org.id === activeOrgId) ?? null
  const projects = activeOrgId ? projectsByOrg[activeOrgId] ?? [] : []
  const [applicationCount, setApplicationCount] = useState(0)
  const [isLoadingApplications, setIsLoadingApplications] = useState(false)

  const plan = (activeOrg?.plan ?? "PIRATES") as PlanKey
  const quotas = PLAN_QUOTAS[plan]
  const membersUsed = activeOrg?.users?.length ?? 0
  const projectsUsed = projects.length

  useEffect(() => {
    let cancelled = false

    async function loadApplications() {
      if (!activeOrgId || projects.length === 0) {
        setApplicationCount(0)
        return
      }

      setIsLoadingApplications(true)
      try {
        const counts = await Promise.all(
          projects.map(async (project) => {
            const data = await apiGet<Application[]>("/applications", { projectId: project.id })
            return Array.isArray(data) ? data.length : 0
          })
        )

        if (!cancelled) {
          setApplicationCount(counts.reduce((total, count) => total + count, 0))
        }
      } catch {
        if (!cancelled) {
          setApplicationCount(0)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingApplications(false)
        }
      }
    }

    void loadApplications()

    return () => {
      cancelled = true
    }
  }, [activeOrgId, projects])

  if (!activeOrg) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Select an organization to see its usage and plan limits.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 border-b border-foreground/[0.06] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Organization quota</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground/90">{activeOrg.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Current plan: {PLAN_LABELS[plan]} · Quotas apply to the active organization, not the individual user.
            </p>
          </div>
          <div className="rounded-full border border-foreground/[0.08] px-3 py-1 text-xs text-foreground/70">
            {PLAN_LABELS[plan]} plan
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <QuotaCard
            label="Members"
            used={membersUsed}
            limit={quotas.members}
            detail="Organization members and collaborators"
          />
          <QuotaCard
            label="Projects"
            used={projectsUsed}
            limit={quotas.projects}
            detail="Projects currently attached to this organization"
          />
          <QuotaCard
            label="Applications"
            used={isLoadingApplications ? 0 : applicationCount}
            limit={quotas.applications}
            detail={isLoadingApplications ? "Loading application counts across projects" : "Applications across all projects in this organization"}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.03] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground/90">Need more room?</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Upgrade the organization plan to raise your limits, or contact us if you need a custom arrangement.
            </p>
          </div>
          <Button asChild className="bg-[#087f9c] text-white hover:bg-[#0aa1c4]">
            <Link href="/pricing">View plans</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}