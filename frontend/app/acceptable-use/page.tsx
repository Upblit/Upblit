import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = {
  title: "Acceptable Use Policy | Upblit",
  description: "Rules for safe, lawful, and responsible use of Upblit systems.",
  alternates: { canonical: "/acceptable-use" },
}

export default function AcceptableUsePage() {
  return <LegalPage slug="acceptable-use" />
}
