"use client"

import Link from "next/link"
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InvitePage() {
  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_34%),linear-gradient(180deg,_#07111f_0%,_#0d1728_55%,_#f7fafc_55%,_#f8fafc_100%)] px-6 py-10 text-slate-900 sm:px-10">
      <div className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 rounded-[2rem] border border-white/10 bg-white/90 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.22)] backdrop-blur sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/30 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.18),_transparent_24%)]" />
            <div className="absolute inset-y-0 right-0 w-56 bg-[linear-gradient(135deg,transparent,_rgba(255,255,255,0.08),transparent)] blur-2xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <Sparkles className="size-3.5" />
                Public invite
              </div>

              <div className="space-y-4">
                <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Join your workspace without copying a token.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Invite links now open automatically. If you arrived from an organization invite, we will
                  verify the link and connect you to the right workspace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <CheckCircle2 className="mb-3 size-5 text-cyan-300" />
                  <p className="text-sm font-medium">Open the link</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">Use the invite URL from email or chat.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="mb-3 size-5 text-emerald-300" />
                  <p className="text-sm font-medium">We verify access</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">Your membership is checked automatically.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ArrowRight className="mb-3 size-5 text-sky-300" />
                  <p className="text-sm font-medium">Continue working</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">You will land in the dashboard once accepted.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">Ready to join</p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Nothing to paste here anymore</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Public invites are handled by the shared link itself. Open the link you received and the app
                  will finish the handoff automatically.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-900">What changed</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We removed the manual token field so there is one clear path: click the invite link, verify,
                  and continue.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-xl px-5">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl px-5">
                <Link href="/">Back to sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
