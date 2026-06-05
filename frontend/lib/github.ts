export type GhRepo = {
  name: string
  full_name: string
}

export type GhContributor = {
  login?: string
  id?: number
  avatar_url?: string
  html_url?: string
  contributions: number
  type?: string
  name?: string
}

const GITHUB_API = 'https://api.github.com'

async function fetchJson(url: string, token?: string) {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`GitHub API error ${res.status} ${res.statusText}: ${txt}`)
  }
  return res.json()
}

export async function fetchOrgRepos(org: string, token?: string) {
  const repos: GhRepo[] = []
  let page = 1
  while (true) {
    const url = `${GITHUB_API}/orgs/${org}/repos?per_page=100&page=${page}`
    // eslint-disable-next-line no-await-in-loop
    const pageData = await fetchJson(url, token)
    if (!Array.isArray(pageData) || pageData.length === 0) break
    repos.push(...pageData.map((r: any) => ({ name: r.name, full_name: r.full_name })))
    if (pageData.length < 100) break
    page += 1
  }
  return repos
}

export async function fetchRepoContributors(owner: string, repo: string, token?: string) {
  const contributors: GhContributor[] = []
  let page = 1
  while (true) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=100&page=${page}&anon=1`
    // eslint-disable-next-line no-await-in-loop
    const pageData = await fetchJson(url, token)
    if (!Array.isArray(pageData) || pageData.length === 0) break
    contributors.push(...pageData.map((c: any) => ({
      login: c.login,
      id: c.id,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      contributions: c.contributions,
      type: c.type,
      name: c.name,
    })))
    if (pageData.length < 100) break
    page += 1
  }
  return contributors
}

export async function aggregateOrgContributors(org: string, token?: string) {
  const repos = await fetchOrgRepos(org, token)
  const map = new Map<string, { login?: string; avatar?: string; url?: string; contributions: number }>()
  let totalContributions = 0
  for (const r of repos) {
    // eslint-disable-next-line no-await-in-loop
    const contribs = await fetchRepoContributors(org, r.name, token)
    for (const c of contribs) {
      const key = c.login ?? c.name ?? `anon-${c.id ?? Math.random()}`
      const prev = map.get(key)
      const avatar = c.avatar_url ?? prev?.avatar
      const url = c.html_url ?? prev?.url
      const added = (prev?.contributions ?? 0) + (c.contributions ?? 0)
      map.set(key, { login: key, avatar, url, contributions: added })
      totalContributions += c.contributions ?? 0
    }
  }
  const contributors = Array.from(map.values()).sort((a, b) => b.contributions - a.contributions)
  return {
    org,
    repoCount: repos.length,
    totalContributions,
    contributors,
  }
}
