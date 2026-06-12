"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiDelete, apiPost, apiPut } from "@/lib/api"
import type { Application, UptimeMonitor } from "@/lib/types"

type UptimeConnectSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
  projectId: number
  existingMonitor: UptimeMonitor | null
  onConnected: () => Promise<void> | void
}

export function UptimeConnectSheet({
  open,
  onOpenChange,
  application,
  projectId,
  existingMonitor,
  onConnected,
}: UptimeConnectSheetProps) {
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // allow editing when an existing monitor is present

  useEffect(() => {
    if (!open) return
    setUrl(existingMonitor?.url ?? "")
  }, [existingMonitor, open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!application || !url.trim()) return

    setIsSubmitting(true)
    try {
      const payload = {
        url: url.trim(),
        projectId,
        applicationId: application.id,
        organizationId: application.organizationId,
      }

      if (existingMonitor) {
        await apiPut(`/uptime/monitors/${existingMonitor.id}`, payload)
      } else {
        await apiPost("/uptime/monitors", payload)
      }
      onOpenChange(false)
      await onConnected()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingMonitor) return

    setIsSubmitting(true)
    try {
      await apiDelete(`/uptime/monitors/${existingMonitor.id}`)
      onOpenChange(false)
      await onConnected()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async () => {
    if (!existingMonitor || isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = {
        url: (url || existingMonitor.url).trim(),
        projectId: existingMonitor.projectId,
        applicationId: existingMonitor.applicationId,
        organizationId: existingMonitor.organizationId,
        active: !existingMonitor.active,
      }

      await apiPut(`/uptime/monitors/${existingMonitor.id}`, payload)
      onOpenChange(false)
      await onConnected()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-background/95 border-l border-border p-8 sm:max-w-md">
        <SheetHeader className="gap-1.5 p-0">
          <SheetTitle className="text-2xl font-bold text-foreground/95">
            {existingMonitor ? "Uptime connected" : `Connect uptime for ${application?.name ?? "application"}`}
          </SheetTitle>
          <SheetDescription>
            {existingMonitor
              ? "This application already has a single uptime URL connected."
              : "Add one uptime URL. We'll monitor its availability for you."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">URL</label>
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="example.com or https://example.com"
              className="bg-muted/40 border-border h-11 text-foreground"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">We'll check the site's availability.</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            {existingMonitor ? (
              <>
                Connected URL: <span className="text-foreground/90">{existingMonitor.url}</span>
              </>
            ) : (
              <>
                Only one URL can be connected per application. We'll monitor it for you.
              </>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !url.trim()}
            className="h-11 bg-accent hover:bg-accent-hover text-white"
          >
            {isSubmitting ? "Saving..." : existingMonitor ? "Save changes" : "Connect uptime"}
          </Button>

          {existingMonitor && (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleToggleActive}
                disabled={isSubmitting}
                className="h-11 bg-accent-dark hover:bg-accent-dark-hover text-white"
              >
                {existingMonitor.active ? "Deactivate" : "Activate"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="h-11 border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-200 hover:bg-red-500/20"
              >
                Delete monitor
              </Button>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}