import type { Metadata } from "next"

import { LandingPage } from "@/components/marketing/landing-page"

export const metadata: Metadata = {
  title: "Upblit | Operational telemetry for engineering teams",
  description:
    "Upblit is a dark-first observability workspace for logs, traces, metrics, API keys, and AI-assisted incident review.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Upblit | Operational telemetry for engineering teams",
    description:
      "Production-grade observability for teams that need logs, traces, telemetry, and runbooks in one focused workspace.",
    url: "/",
    siteName: "Upblit",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Upblit" }],
    type: "website",
  },
}

export default function Home() {
  return <LandingPage />
}
