"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, ExternalLinkIcon, LogInIcon, MenuIcon, StarIcon } from "lucide-react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { patreonUrl } from "@/lib/support-links"
import { getStoredValidToken } from "@/lib/auth-session"

export const loginUrl = "/login"

const navItems = [
  { label: "About", href: "/#architecture" },
  { label: "Open Source", href: "https://github.com/Upblit/Upblit", external: true },
  { label: "Community", href: "/community" },
  { label: "Developer", href: "/docs" },
  { label: "Contact", href: "/contact" },
  { label: "Pricing", href: "/pricing" },
]
  
export function SiteNav() {
  const pathname = usePathname()
  const [stars, setStars] = useState(null)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setHasValidSession(Boolean(getStoredValidToken()))

    async function fetchStars() {
      try {
        const res = await fetch(
          "https://api.github.com/repos/Upblit/Upblit"
        );
        const data = await res.json();
        setStars(data.stargazers_count);
      } catch (err) {
        console.error(err);
      }
    }

    fetchStars();
  }, []);
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#090b0d]/95 backdrop-blur-xl"
    >
      <nav
        aria-label="Primary"
        className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-5 sm:px-8 lg:px-12"
      >
        <Link
          href="/"
          aria-label="Upblit home"
          className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07a1c1]"
        >
          <Image src="/lanscapelogo.png" alt="Upblit" width={100} height={32} />
        </Link>

        <div className="hidden min-w-0 justify-center lg:flex">
          <div className="flex items-center gap-1.5">
          {navItems.map((item) => (
            item.external ? (
              <a
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/54 transition hover:bg-white/[0.045] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07a1c1]"
              >
                {item.label}
                <ExternalLinkIcon className="size-3 opacity-45 transition group-hover:opacity-80" />
              </a>
            ) : (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07a1c1]",
                  pathname === item.href ? "bg-white/[0.065] text-white" : "text-white/54 hover:bg-white/[0.045] hover:text-white"
                )}
              >
                {item.label}
              </Link>
            )
          ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            href="https://github.com/Upblit/Upblit"
            className="hidden h-11 items-center rounded-full border border-white/[0.08] bg-[#111214] pl-4 pr-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition hover:border-white/[0.14] hover:bg-[#17181b] md:flex"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#111214]">
                <span className="text-[9px] font-black leading-none tracking-[-0.08em]">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className="octicon octicon-mark-github"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                    style={{ verticalAlign: "text-bottom", display: "inline-block", overflow: "visible" }}
                  >
                    <path d="M12 1C5.9225 1 1 5.9225 1 12C1 16.8675 4.14875 20.9787 8.52125 22.4362C9.07125 22.5325 9.2775 22.2025 9.2775 21.9137C9.2775 21.6525 9.26375 20.7862 9.26375 19.865C6.5 20.3737 5.785 19.1912 5.565 18.5725C5.44125 18.2562 4.905 17.28 4.4375 17.0187C4.0525 16.8125 3.5025 16.3037 4.42375 16.29C5.29 16.2762 5.90875 17.0875 6.115 17.4175C7.105 19.0812 8.68625 18.6137 9.31875 18.325C9.415 17.61 9.70375 17.1287 10.02 16.8537C7.5725 16.5787 5.015 15.63 5.015 11.4225C5.015 10.2262 5.44125 9.23625 6.1425 8.46625C6.0325 8.19125 5.6475 7.06375 6.2525 5.55125C6.2525 5.55125 7.17375 5.2625 9.2775 6.67875C10.1575 6.43125 11.0925 6.3075 12.0275 6.3075C12.9625 6.3075 13.8975 6.43125 14.7775 6.67875C16.8813 5.24875 17.8025 5.55125 17.8025 5.55125C18.4075 7.06375 18.0225 8.19125 17.9125 8.46625C18.6138 9.23625 19.04 10.2125 19.04 11.4225C19.04 15.6437 16.4688 16.5787 14.0213 16.8537C14.42 17.1975 14.7638 17.8575 14.7638 18.8887C14.7638 20.36 14.75 21.5425 14.75 21.9137C14.75 22.2025 14.9563 22.5462 15.5063 22.4362C19.8513 20.9787 23 16.8537 23 12C23 5.9225 18.0775 1 12 1Z" />
                  </svg>
                </span>
              </span>
              <span className="whitespace-nowrap">Star on GitHub</span>
            </span>
            <span className="mx-3 h-5 w-px bg-white/15" />
            <span className="flex items-center gap-1.5 whitespace-nowrap text-white/92">
              <StarIcon className="size-3.5 fill-current text-white" />
              <span>{stars ?? "—"}</span>
            </span>
          </Link>
          <Button asChild className="h-10 gap-2 rounded-full bg-[#087f9c] px-4 text-white shadow-lg shadow-[#087f9c]/15 transition hover:-translate-y-px hover:bg-[#0aa1c4]">
            <Link href={hasValidSession ? "/dashboard" : loginUrl}>
              {hasValidSession ? (
                <>
                  <ArrowRightIcon className="hidden size-4 sm:block" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <ArrowRightIcon className="size-4 sm:hidden" />
                </>
              ) : (
                <>
                  <LogInIcon className="hidden size-4 sm:block" />
                  <span className="hidden sm:inline">Sign in</span>
                  <ArrowRightIcon className="size-4 sm:hidden" />
                </>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="text-white/70 hover:bg-white/[0.06] hover:text-white lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon className="size-5" />
          </Button>
        </div>
      </nav>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-4/5 border-white/[0.08] bg-[#090b0d] text-white sm:max-w-xs">
          <SheetHeader>
            <SheetTitle className="text-left text-white">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={`m-${item.href}-${item.label}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-3 text-base font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {item.label}
                  <ExternalLinkIcon className="size-3.5 opacity-45" />
                </a>
              ) : (
                <Link
                  key={`m-${item.href}-${item.label}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-3 text-base font-medium transition",
                    pathname === item.href ? "bg-white/[0.065] text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </SheetContent>
      </Sheet>
    </motion.header>
  )
}
