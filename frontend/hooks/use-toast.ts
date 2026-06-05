import { useState, useEffect } from "react"

export type ToastVariant = "error" | "quota" | "success" | "info"

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  upgradeUrl?: string
  plan?: string
  duration?: number
}

type Listener = (toasts: Toast[]) => void

let toasts: Toast[] = []
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((fn) => fn([...toasts]))
}

export function toast(opts: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2)
  const duration = opts.duration ?? 6000
  toasts = [...toasts, { ...opts, id, duration }]
  notify()

  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration)
  }
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

export function useToasts() {
  const [items, setItems] = useState<Toast[]>([...toasts])

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  return { toasts: items, dismiss: dismissToast }
}
