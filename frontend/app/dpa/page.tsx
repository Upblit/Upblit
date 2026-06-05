import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = {
  title: "Data Processing Notes | Upblit",
  description: "Reference notes for how Upblit processes workspace telemetry and documents.",
  alternates: { canonical: "/dpa" },
}

export default function DpaPage() {
  return <LegalPage slug="dpa" />
}
