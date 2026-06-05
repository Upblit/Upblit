export type PolicySlug = "privacy" | "terms" | "cookies" | "acceptable-use" | "data-retention" | "dpa"

export type PolicySection = {
  title: string
  body: string[]
}

export type Policy = {
  slug: PolicySlug
  title: string
  description: string
  updated: string
  sections: PolicySection[]
}

export const policies: Record<PolicySlug, Policy> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How Upblit collects, uses, secures, and shares account, telemetry, and workspace data.",
    updated: "May 27, 2026",
    sections: [
      {
        title: "Data we process",
        body: [
          "Upblit processes account information, organization metadata, project and application records, authentication events, API key metadata, logs, traces, metrics, telemetry payloads, and uploaded operational documents.",
          "Telemetry and log payloads may contain customer-controlled content. Customers are responsible for avoiding unnecessary personal data in logs, traces, and uploaded documents.",
        ],
      },
      {
        title: "How data is used",
        body: [
          "We use data to provide observability workflows, incident review, AI-assisted document retrieval, security auditing, billing operations, support, product reliability, and abuse prevention.",
          "We do not sell customer telemetry or uploaded documents. AI document retrieval is scoped to the relevant workspace and tenant context.",
        ],
      },
      {
        title: "Security controls",
        body: [
          "Upblit is designed around encryption in transit, scoped API keys, organization-level access, auditability, OAuth-based sign-in, and role-based access patterns.",
          "Production deployments should configure retention, access controls, and integrations according to the workspace's actual risk profile.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    description: "The commercial and operational terms for using Upblit services and software.",
    updated: "May 27, 2026",
    sections: [
      {
        title: "Use of the service",
        body: [
          "You may use Upblit to ingest, inspect, and manage telemetry, logs, traces, metrics, application metadata, and operational documents for authorized systems.",
          "You are responsible for account security, user access, API key handling, and the legality of data submitted to the platform.",
        ],
      },
      {
        title: "Service availability",
        body: [
          "Upblit is built for operational reliability, but no service can guarantee uninterrupted availability. Status, maintenance, and incident communications should be reviewed through the status and support channels linked from the site footer.",
        ],
      },
      {
        title: "Customer content",
        body: [
          "Customers retain ownership of telemetry, logs, traces, documents, and metadata they submit. Upblit receives the rights necessary to operate, secure, troubleshoot, and improve the service.",
        ],
      },
    ],
  },
  cookies: {
    slug: "cookies",
    title: "Cookie Policy",
    description: "How Upblit uses cookies and similar technologies for authentication, security, and product analytics.",
    updated: "May 27, 2026",
    sections: [
      {
        title: "Cookie categories",
        body: [
          "Essential cookies support authentication, session continuity, CSRF protection, workspace routing, and security checks.",
          "Optional analytics may help us understand product usage, reliability, and onboarding friction. Customers can request configuration details for production deployments.",
        ],
      },
      {
        title: "Authentication",
        body: [
          "GitHub OAuth and related session flows may use cookies, tokens, or browser storage to complete sign-in and preserve authenticated state.",
        ],
      },
      {
        title: "Choices",
        body: [
          "Browser controls can limit cookies, but disabling essential cookies may prevent authentication, dashboard access, or workspace operations.",
        ],
      },
    ],
  },
  "acceptable-use": {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    description: "Rules for safe, lawful, and responsible use of Upblit telemetry, document, and API systems.",
    updated: "May 27, 2026",
    sections: [
      {
        title: "Prohibited activity",
        body: [
          "Do not use Upblit to store or transmit malware, credentials you are not authorized to process, unlawful content, harassment, regulated data without appropriate controls, or telemetry from systems you do not own or administer.",
          "Do not attempt to disrupt, overload, reverse engineer, bypass limits, probe unauthorized systems, or abuse API endpoints.",
        ],
      },
      {
        title: "Operational data hygiene",
        body: [
          "Customers should redact secrets, tokens, payment data, medical data, and unnecessary personal information before sending logs, traces, metrics, or documents.",
        ],
      },
      {
        title: "Enforcement",
        body: [
          "We may suspend access, throttle ingestion, remove content, or contact workspace owners if usage creates security, legal, reliability, or abuse concerns.",
        ],
      },
    ],
  },
  "data-retention": {
    slug: "data-retention",
    title: "Data Retention",
    description: "Retention principles for telemetry, logs, traces, documents, accounts, and audit records.",
    updated: "May 27, 2026",
    sections: [
      {
        title: "Telemetry retention",
        body: [
          "Retention windows for logs, traces, metrics, and telemetry should be configured by plan, deployment mode, workspace requirements, and operational risk.",
          "Customers can request deletion of project or application data subject to backup, security, billing, and legal hold constraints.",
        ],
      },
      {
        title: "Document retention",
        body: [
          "Uploaded AI documents remain associated with the relevant tenant until deleted by an authorized user or removed according to a configured retention workflow.",
        ],
      },
      {
        title: "Audit records",
        body: [
          "Security and audit records may be retained longer than ordinary telemetry when necessary for abuse prevention, billing, or incident investigation.",
        ],
      },
    ],
  },
  dpa: {
    slug: "dpa",
    title: "Data Processing Notes",
    description: "Reference notes for teams that need to understand how workspace data is processed.",
    updated: "May 27, 2026",
    sections: [
      {
        title: "Roles",
        body: [
          "For telemetry and uploaded documents, workspace owners decide what data is sent to Upblit and who can access it.",
          "For account administration, support, security, and product operations, Upblit may process limited account and usage data needed to run the service.",
        ],
      },
      {
        title: "Processing instructions",
        body: [
          "Upblit processes customer content to provide observability, telemetry review, document retrieval, security, support, reliability, and related service operations.",
        ],
      },
      {
        title: "Subprocessors and transfers",
        body: [
          "Production deployments should document hosting providers, storage systems, and support tools so teams know where operational data can flow.",
        ],
      },
    ],
  },
}

export const policyOrder: PolicySlug[] = ["privacy", "terms", "cookies", "acceptable-use", "data-retention", "dpa"]

export function getPolicy(slug: PolicySlug) {
  return policies[slug]
}
