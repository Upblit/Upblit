import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, GitBranchIcon, MessageSquareIcon, RadioTowerIcon } from "lucide-react"

import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteNav } from "@/components/marketing/site-nav"
import { aggregateOrgContributors } from "@/lib/github"

const ORG = "Upblit"

type Contributor = {
  login?: string
  avatar?: string
  url?: string
  contributions: number
}

type CommunityData = {
  repoCount: number
  totalContributions: number
  contributors: Contributor[]
}

export const metadata: Metadata = {
  title: "Community | Upblit",
  description: "Contribute to Upblit, follow project work, and help shape the observability workspace.",
  alternates: { canonical: "/community" },
}

const activityRows = [
  ["sdk/python", "trace context propagation", "merged"],
  ["frontend", "incident cockpit density pass", "review"],
  ["docs", "ai gateway tenant notes", "open"],
  ["backend", "api key scope cleanup", "merged"],
]

function DashboardScreenshot() {
  return (
    <div className="border border-[#1f1f1f] bg-[#111] font-mono">
      <div className="flex items-center justify-between border-b border-[#1f1f1f] px-3 py-2 text-xs">
        <span className="flex items-center gap-2 text-[#a3a3a3]">
          <RadioTowerIcon className="size-4 text-[#22d3ee]" />
          community dashboard snapshot
        </span>
        <span className="text-[#525252]">open source</span>
      </div>
      <div className="grid gap-3 p-3 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-2">
          {[
            ["repos", "8"],
            ["open issues", "24"],
            ["discussions", "11"],
            ["merged prs", "148"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-xs">
              <span className="text-[#737373]">{label}</span>
              <span className="text-[#f5f5f5]">{value}</span>
            </div>
          ))}
        </div>
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <div className="mb-3 text-xs uppercase text-[#525252]">latest work</div>
          <div className="space-y-2">
            {activityRows.map(([repo, work, state]) => (
              <div key={`${repo}-${work}`} className="grid grid-cols-[92px_1fr_68px] gap-3 border-b border-[#1f1f1f] pb-2 text-xs last:border-b-0 last:pb-0">
                <span className="text-[#22d3ee]">{repo}</span>
                <span className="truncate text-[#a3a3a3]">{work}</span>
                <span className={state === "merged" ? "text-[#22d3ee]" : state === "review" ? "text-amber-400" : "text-[#737373]"}>{state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContributorList({ contributors }: { contributors: Contributor[] }) {
  const visibleContributors = contributors.slice(0, 8)

  if (visibleContributors.length === 0) {
    return (
      <div className="border border-[#1f1f1f] bg-[#111] p-4 font-mono text-sm text-[#737373]">
        GitHub contributor data is not available right now.
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {visibleContributors.map((contributor, index) => {
        const login = contributor.login ?? `contributor-${index + 1}`
        const initials = login.slice(0, 2).toUpperCase()

        return (
          <a
            key={`${login}-${index}`}
            href={contributor.url ?? `https://github.com/${login}`}
            className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border border-[#1f1f1f] bg-[#111] p-3 hover:border-[#22d3ee]/45"
          >
            <span className="flex size-10 items-center justify-center border border-[#1f1f1f] bg-[#0a0a0a] font-mono text-xs text-[#22d3ee]">
              {initials}
            </span>
            <span>
              <span className="block font-mono text-sm text-[#f5f5f5]">{login}</span>
              <span className="block font-mono text-xs text-[#737373]">{contributor.contributions} contributions</span>
            </span>
            <span className="font-mono text-xs text-[#525252]">#{index + 1}</span>
          </a>
        )
      })}
    </div>
  )
}

function ErrorPanel({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    <div className="border border-red-500/35 bg-red-500/10 p-4 font-mono text-sm text-red-300">
      GitHub data could not load: {message}
    </div>
  )
}

export default async function CommunityPage() {
  const token = process.env.GITHUB_TOKEN
  let data: CommunityData | null = null
  let loadError: unknown = null

  try {
    data = await aggregateOrgContributors(ORG, token)
  } catch (error) {
    loadError = error
  }

  const totalContributors = data?.contributors.length ?? 0
  const repoCount = data?.repoCount ?? 0
  const totalContributions = data?.totalContributions ?? 0

  return (
    <main className="min-h-svh bg-[#0a0a0a] text-[#f5f5f5]">
      <SiteNav />

      <section className="px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-xs uppercase text-[#525252]">
            <Link href="/" className="hover:text-[#f5f5f5]">Home</Link>
            <ArrowRightIcon className="size-3" />
            <span>Community</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase text-[#22d3ee]">community</p>
              <h1 className="mt-4 max-w-3xl font-mono text-4xl font-black leading-[0.98] text-[#f5f5f5] sm:text-6xl">
                Help build the parts operators actually touch.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#a3a3a3] sm:text-base">
                Upblit is open source. The useful contributions are concrete: SDK fixes, dashboard density, docs that explain operations, and issue reports with enough context to reproduce.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={`https://github.com/${ORG}/Upblit`} className="inline-flex h-10 items-center gap-2 border border-[#22d3ee] bg-[#22d3ee] px-3 font-mono text-sm font-semibold text-[#0a0a0a] hover:bg-[#67e8f9]">
                  Open GitHub <GitBranchIcon className="size-4" />
                </a>
                <a href={`https://github.com/${ORG}/Upblit/discussions`} className="inline-flex h-10 items-center gap-2 border border-[#1f1f1f] bg-[#111] px-3 font-mono text-sm text-[#a3a3a3] hover:text-[#f5f5f5]">
                  Discussions <MessageSquareIcon className="size-4" />
                </a>
              </div>
            </div>

            <DashboardScreenshot />
          </div>
        </div>
      </section>

      <section className="border-y border-[#1f1f1f] bg-[#0d0d0d] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-3 sm:grid-cols-3">
          {[
            ["repositories", repoCount],
            ["contributors", totalContributors],
            ["contributions", totalContributions],
          ].map(([label, value]) => (
            <div key={label} className="border border-[#1f1f1f] bg-[#111] p-4">
              <p className="font-mono text-xs uppercase text-[#525252]">{label}</p>
              <p className="mt-3 font-mono text-3xl font-black text-[#f5f5f5]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="font-mono text-xs uppercase text-[#22d3ee]">contributors</p>
            <h2 className="mt-3 font-mono text-3xl font-black text-[#f5f5f5]">People moving the project forward.</h2>
            <p className="mt-4 text-sm leading-6 text-[#a3a3a3]">
              The list comes from the Upblit GitHub organization when API data is available. It is intentionally presented like a dashboard queue, not a vanity wall.
            </p>
            {loadError ? <div className="mt-5"><ErrorPanel error={loadError} /></div> : null}
          </div>
          <ContributorList contributors={data?.contributors ?? []} />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
