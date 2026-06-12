import Image from "next/image"
import Link from "next/link"

type AuthScreenProps = {
  mode: "login" | "signup"
  children: React.ReactNode
}

const copy = {
  login: {
    title: "Sign in",
    switchPrompt: "Need an account?",
    switchHref: "/signup",
    switchLabel: "Create one",
  },
  signup: {
    title: "Create account",
    switchPrompt: "Already have an account?",
    switchHref: "/login",
    switchLabel: "Sign in",
  },
} as const

const stream = [
  ["02:13:41.092", "warn", "checkout-api", "p95 crossed 900ms"],
  ["02:13:41.204", "error", "payment-worker", "stripe.capture timeout"],
  ["02:13:41.377", "match", "ai-runbook", "payment queue saturation"],
  ["02:13:41.881", "info", "gateway", "retry budget at 62 percent"],
  ["02:13:42.010", "info", "queue", "depth=1840 saturation=0.91"],
  ["02:13:42.611", "trace", "orders", "tr_8f13a9 correlated"],
]

function TraceStream() {
  return (
    <aside className="hidden min-h-svh border-r border-[#1f1f1f] bg-[#0d0d0d] p-6 lg:block">
      <div className="flex h-full flex-col justify-between">
        <Link href="/" aria-label="Upblit home">
          <Image src="/lanscapelogo.png" alt="Upblit" width={118} height={34} className="h-8 w-auto brightness-0 invert" priority />
        </Link>

        <div className="font-mono">
          <div className="mb-3 flex items-center justify-between border border-[#1f1f1f] bg-[#111] px-3 py-2 text-xs">
            <span className="uppercase text-[#525252]">live trace</span>
            <span className="text-[#22d3ee]">prod-us-east-1</span>
          </div>
          <div className="border border-[#1f1f1f] bg-[#111]">
            {stream.map(([time, level, service, message]) => (
              <div key={`${time}-${service}`} className="grid grid-cols-[92px_62px_128px_1fr] border-b border-[#1f1f1f] px-3 py-3 text-xs last:border-b-0">
                <span className="text-[#525252]">{time}</span>
                <span className={level === "error" ? "text-red-400" : level === "warn" ? "text-amber-400" : level === "match" ? "text-[#22d3ee]" : "text-[#737373]"}>
                  {level}
                </span>
                <span className="text-[#a3a3a3]">{service}</span>
                <span className="truncate text-[#f5f5f5]">{message}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-xs text-[#525252]">Your workspace is scoped to your organization.</p>
      </div>
    </aside>
  )
}

export function AuthScreen({ mode, children }: AuthScreenProps) {
  const modeCopy = copy[mode]

  return (
    <div className="grid min-h-svh bg-[#0a0a0a] text-[#f5f5f5] lg:grid-cols-[1.08fr_0.92fr]">
      <TraceStream />
      <main className="flex min-h-svh flex-col px-5 py-6 sm:px-8">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <Link href="/" aria-label="Upblit home">
            <Image src="/lanscapelogo.png" alt="Upblit" width={112} height={32} className="h-8 w-auto brightness-0 invert" priority />
          </Link>
          <Link href="/" className="border border-[#1f1f1f] px-3 py-2 font-mono text-xs uppercase text-[#a3a3a3]">
            Home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center">
          <div className="border border-[#1f1f1f] bg-[#111] p-5 sm:p-6">
            <p className="font-mono text-xs uppercase text-[#525252]">upblit auth</p>
            <h1 className="mt-3 font-mono text-3xl font-black text-[#f5f5f5]">{modeCopy.title}</h1>
            <div className="mt-6">{children}</div>
            <p className="mt-5 font-mono text-xs text-[#525252]">Your workspace is scoped to your organization.</p>
          </div>

          <p className="mt-5 font-mono text-xs text-[#737373]">
            {modeCopy.switchPrompt}{" "}
            <Link href={modeCopy.switchHref} className="text-[#22d3ee] hover:text-[#67e8f9]">
              {modeCopy.switchLabel}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
