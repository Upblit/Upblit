import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy | Upblit",
  description: "How Upblit collects, uses, secures, and shares account, telemetry, and workspace data.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />
}
