import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service | Upblit",
  description: "Commercial and operational terms for using Upblit services and software.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return <LegalPage slug="terms" />
}
