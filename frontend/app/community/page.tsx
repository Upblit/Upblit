import React from 'react'
import { aggregateOrgContributors } from '@/lib/github'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'

const ORG = 'Upblit'

export default async function Page() {
  const token = process.env.GITHUB_TOKEN
  let data
  try {
    data = await aggregateOrgContributors(ORG, token)
  } catch (err: any) {
    return (
      <main className="min-h-svh bg-[#08090b] text-white">
        <SiteNav />
        <section className="px-5 pb-20 pt-16 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold">Community</h1>
            <p className="mt-4 text-red-400">Failed to load GitHub data: {String(err.message ?? err)}</p>
            <p className="mt-2 text-sm text-muted-foreground">You can set `GITHUB_TOKEN` in environment to increase rate limits.</p>
          </div>
        </section>
        <SiteFooter />
      </main>
    )
  }

  const totalContributors = data.contributors.length

  return (
    <main className="min-h-svh bg-[#08090b] text-white">
      <SiteNav />
      <section className="px-5 pb-20 pt-16 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold">Upblit Community</h1>
          <p className="mt-2 text-sm text-muted-foreground">Organization: {ORG} • Repositories: {data.repoCount}</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
              <div className="text-xs text-muted-foreground">Contributors</div>
              <div className="text-2xl font-semibold">{totalContributors}</div>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
              <div className="text-xs text-muted-foreground">Total Contributions</div>
              <div className="text-2xl font-semibold">{data.totalContributions}</div>
            </div>

            <div className="ml-auto flex gap-2">
              <a href={`https://github.com/${ORG}/Upblit`} className="rounded-full bg-[#087f9c] px-4 py-2 text-white">Join now</a>
              <a href={`https://github.com/${ORG}/Upblit/discussions`} className="rounded-full border border-white/[0.08] px-4 py-2">Discussions</a>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Top Contributors</h2>
            <div className="mt-4 space-y-2">
              {data.contributors.map((c: any, i: number) => (
                <div key={c.login ?? i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                  <img src={c.avatar} alt={c.login} className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <a href={c.url} className="font-medium hover:underline">{c.login}</a>
                    <div className="text-xs text-muted-foreground">{c.contributions} contributions</div>
                  </div>
                  <div className="text-sm text-muted-foreground">#{i + 1}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
