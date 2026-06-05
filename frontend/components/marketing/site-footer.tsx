import Image from "next/image"
import Link from "next/link"

import { patreonUrl } from "@/lib/support-links"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Architecture", href: "/#architecture" },
      { label: "Dashboard preview", href: "/#dashboard" },
      { label: "AI docs", href: "/#ai-docs" },
      { label: "Security", href: "/#security" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Developer docs", href: "https://docs.upblit.dev" },
      { label: "API reference", href: "https://docs.upblit.dev" },
      { label: "Changelog", href: "/#changelog" },
      { label: "GitHub", href: "https://github.com/Upblit/Upblit" },
      { label: "Status", href: "/#status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Support", href: "/contact" },
      { label: "Patreon", href: patreonUrl, external: true },
      { label: "Contact", href: "/contact" },
      { label: "Docs", href: "https://docs.upblit.dev" },
      { label: "Dashboard", href: "/dashboard" },
        { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Data Retention", href: "/data-retention" },
      { label: "Data Processing", href: "/dpa" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#08090b] px-5 py-12 text-sm sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link href="/" aria-label="Upblit home">
              <Image src="/logo.png" alt="Upblit" width={108} height={36} className="w-28 opacity-90" style={{ height: "auto" }} />
            </Link>
            <p className="mt-5 max-w-sm leading-6 text-white/48">
              A student-built observability workbench for logs, traces, metrics, API keys, and AI-assisted incident notes.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["OAuth", "API scopes", "Trace context", "Retention notes"].map((item) => (
                <span key={item} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-xs text-white/46">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-white/36">{column.title}</h2>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noreferrer" className="text-white/55 transition hover:text-white">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-white/55 transition hover:text-white">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 Upblit. All rights reserved.</p>
          <p>Built for telemetry review, API operations, and incident response.</p>
        </div>
      </div>
    </footer>
  )
}
