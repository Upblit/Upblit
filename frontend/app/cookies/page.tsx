import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = {
  title: "Cookie Policy | Upblit",
  description: "How Upblit uses cookies and similar technologies for authentication, security, and analytics.",
  alternates: { canonical: "/cookies" },
}

export default function CookiesPage() {
  return <LegalPage slug="cookies" />
}
