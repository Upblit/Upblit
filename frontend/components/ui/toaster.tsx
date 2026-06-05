"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useToasts, dismissToast, type Toast } from "@/hooks/use-toast"
import { XIcon, ZapIcon, AlertCircleIcon, CheckCircleIcon, InfoIcon } from "lucide-react"

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true))
  }, [])

  function handleDismiss() {
    setLeaving(true)
    setTimeout(() => dismissToast(toast.id), 300)
  }

  // Pause auto-dismiss on hover
  function handleMouseEnter() {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const isQuota = toast.variant === "quota"
  const isError = toast.variant === "error"
  const isSuccess = toast.variant === "success"

  const Icon = isQuota
    ? ZapIcon
    : isError
    ? AlertCircleIcon
    : isSuccess
    ? CheckCircleIcon
    : InfoIcon

  const iconColor = isQuota
    ? "text-amber-400"
    : isError
    ? "text-red-400"
    : isSuccess
    ? "text-emerald-400"
    : "text-sky-400"

  const borderColor = isQuota
    ? "border-amber-500/25"
    : isError
    ? "border-red-500/25"
    : isSuccess
    ? "border-emerald-500/25"
    : "border-sky-500/25"

  const glowColor = isQuota
    ? "shadow-amber-500/10"
    : isError
    ? "shadow-red-500/10"
    : isSuccess
    ? "shadow-emerald-500/10"
    : "shadow-sky-500/10"

  const accentBg = isQuota
    ? "bg-amber-500/10"
    : isError
    ? "bg-red-500/10"
    : isSuccess
    ? "bg-emerald-500/10"
    : "bg-sky-500/10"

  return (
    <div
      onMouseEnter={handleMouseEnter}
      style={{
        transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
      }}
      className={`
        relative flex w-full max-w-sm items-start gap-3.5 overflow-hidden
        rounded-2xl border ${borderColor} bg-[#111111]/95 backdrop-blur-xl
        p-4 shadow-2xl ${glowColor}
        ring-1 ring-white/[0.04]
      `}
    >
      {/* Subtle left accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-[3px] rounded-l-2xl ${accentBg.replace("bg-", "bg-").replace("/10", "/60")}`}
        style={{
          background: isQuota
            ? "linear-gradient(to bottom, #f59e0b, #d97706)"
            : isError
            ? "linear-gradient(to bottom, #ef4444, #dc2626)"
            : isSuccess
            ? "linear-gradient(to bottom, #10b981, #059669)"
            : "linear-gradient(to bottom, #38bdf8, #0284c7)",
        }}
      />

      {/* Icon */}
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${accentBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-semibold text-white/95 leading-snug">
          {toast.title}
        </p>

        {toast.description && (
          <p className="mt-1 text-xs text-white/55 leading-relaxed">
            {toast.description}
          </p>
        )}

        {/* Quota-specific: plan badge + upgrade button */}
        {isQuota && (
          <div className="mt-3 flex items-center gap-2">
            {toast.plan && (
              <span className="inline-flex items-center rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
                {toast.plan}
              </span>
            )}
            {toast.upgradeUrl && (
              <Link
                href={toast.upgradeUrl}
                onClick={handleDismiss}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 px-2.5 py-1 text-[11px] font-semibold text-amber-400 transition-all"
              >
                <ZapIcon className="h-3 w-3" />
                Upgrade plan
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/70"
        aria-label="Dismiss"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts } = useToasts()

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
