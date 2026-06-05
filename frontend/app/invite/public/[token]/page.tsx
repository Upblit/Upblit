"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiPost, apiGet } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ArrowRight, CircleCheckBig, Loader2, Sparkles } from "lucide-react"

export default function PublicInviteAcceptPage() {
  const params = useParams() as { token?: string }
  const router = useRouter()
  const token = params?.token ?? ""

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    // auto-accept on mount
    (async () => {
      setLoading(true)
      try {
        await apiPost(`/invite/public/${encodeURIComponent(token)}/accept`)
        setMessage("Invite accepted. Redirecting to dashboard...")
        try {
          await apiGet('/org')
        } catch {}
        setTimeout(() => router.push('/dashboard'), 1200)
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Failed to accept invite')
      } finally {
        setLoading(false)
      }
    })()
  }, [token, router])

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,_#07111d_0%,_#0f172a_56%,_#f8fafc_56%,_#f8fafc_100%)] px-6 py-10 text-slate-900 sm:px-10">
      <div className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/90 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.22)] backdrop-blur sm:p-10">
          <div className="rounded-[1.75rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/30 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              <Sparkles className="size-3.5" />
              Invite verification
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                {loading ? (
                  <Loader2 className="size-7 animate-spin text-cyan-300" />
                ) : (
                  <CircleCheckBig className="size-7 text-emerald-300" />
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {loading ? "Accepting your invitation" : "Invite accepted"}
                </h1>
                <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  {loading
                    ? "We are checking the invite link and connecting you to the right workspace."
                    : message || "You are ready to continue into the dashboard."}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Automatic handoff</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">No token entry or extra clicks required.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Correct workspace</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Your selected organization will load after acceptance.</p>
              </div>
            </div>

            {!loading && message && !message.startsWith("Invite accepted") ? (
              <div className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {message}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.push("/dashboard")} className="h-11 rounded-xl px-5">
                Continue to dashboard
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="h-11 rounded-xl px-5">
                Back to sign in
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
