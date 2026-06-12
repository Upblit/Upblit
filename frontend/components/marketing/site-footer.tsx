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
      { label: "Community", href: "/community" },
      { label: "Support", href: "/contact" },
      { label: "Patreon", href: patreonUrl, external: true },
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
    <footer className="border-t border-[#1f1f1f] bg-[#0a0a0a] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-10 font-mono text-xs lg:grid-cols-[0.9fr_2fr]">
        <div>
          <Link href="/" aria-label="Upblit home">
            <Image src="/logo.png" alt="Upblit" width={108} height={36} className="h-auto w-24 opacity-90 brightness-0 invert" />
          </Link>
          <p className="mt-5 max-w-sm leading-6 text-[#737373]">
            Observability for logs, traces, metrics, API keys, and AI-assisted incident notes.
          </p>
          <p className="mt-6 text-[#525252]">Copyright 2026 Upblit.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="uppercase text-[#525252]">{column.title}</h2>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
                    {link.external || link.href.startsWith("http") ? (
                      <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined} className="text-[#a3a3a3] hover:text-[#f5f5f5]">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-[#a3a3a3] hover:text-[#f5f5f5]">
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
    </footer>
  )
}
