import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteNav } from "@/components/marketing/site-nav"
import { policies, policyOrder, type PolicySlug } from "@/lib/policies"

export function LegalPage({ slug }: { slug: PolicySlug }) {
  const policy = policies[slug]
  const related = policyOrder.filter((item) => item !== slug)

  return (
    <main className="min-h-svh bg-[#08090b] text-white">
      <SiteNav />
      <section className="px-5 pb-20 pt-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/42">
              <Link href="/" className="hover:text-white">Home</Link>
              <ArrowRightIcon className="size-3" />
              <span>{policy.title}</span>
            </nav>
            <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm text-[#7dd3fc] hover:text-white">
              <ArrowLeftIcon className="size-4" />
              Back to product
            </Link>
            <div className="mt-8 rounded-lg border border-white/[0.08] bg-[#101318] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">Legal architecture</p>
              <ul className="mt-4 space-y-2">
                {policyOrder.map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item}`}
                      className={item === slug ? "text-sm text-white" : "text-sm text-white/52 transition hover:text-white"}
                    >
                      {policies[item].title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="rounded-lg border border-white/[0.08] bg-[#0e1115] p-6 shadow-2xl shadow-black/25 sm:p-8">
            <p className="text-sm text-[#7dd3fc]">Updated {policy.updated}</p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-normal text-white sm:text-5xl">{policy.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/58">{policy.description}</p>

            <div className="mt-10 space-y-10">
              {policy.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="font-heading text-2xl font-semibold tracking-normal text-white">{section.title}</h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-white/58">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 border-t border-white/[0.08] pt-6">
              <h2 className="text-sm font-medium text-white">Related policies</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {related.map((item) => (
                  <Link key={item} href={`/${item}`} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/56 transition hover:border-[#07a1c1]/40 hover:text-white">
                    {policies[item].title}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
