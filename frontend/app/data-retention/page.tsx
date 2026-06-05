import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = {
  title: "Data Retention | Upblit",
  description: "Retention principles for telemetry, logs, traces, documents, accounts, and audit records.",
  alternates: { canonical: "/data-retention" },
}

export default function DataRetentionPage() {
  return <LegalPage slug="data-retention" />
}
