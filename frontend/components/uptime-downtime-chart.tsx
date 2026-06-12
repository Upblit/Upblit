"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { UptimeCheckResult } from "@/lib/types"

interface UptimeDowntimeChartProps {
  results: UptimeCheckResult[]
}

export function UptimeDowntimeChart({ results }: UptimeDowntimeChartProps) {
  const chartData = useMemo(() => {
    if (!results.length) return []

    const sortedResults = [...results].sort((left, right) => {
      return new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
    })

    const firstTimestamp = new Date(sortedResults[0].timestamp).getTime()
    const lastTimestamp = new Date(sortedResults[sortedResults.length - 1].timestamp).getTime()
    const span = Math.max(lastTimestamp - firstTimestamp, 1)
    const bucketCount = Math.min(12, Math.max(4, sortedResults.length))
    const bucketSize = span / bucketCount

    const buckets = Array.from({ length: bucketCount }, (_, index) => ({
      label: new Date(firstTimestamp + index * bucketSize).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      totalChecks: 0,
      downtimeChecks: 0,
      downtimeRate: 0,
    }))

    for (const result of sortedResults) {
      const timestamp = new Date(result.timestamp).getTime()
      const rawIndex = Math.floor((timestamp - firstTimestamp) / bucketSize)
      const bucketIndex = Math.min(bucketCount - 1, Math.max(0, rawIndex))
      const bucket = buckets[bucketIndex]
      bucket.totalChecks += 1
      if (!result.success) bucket.downtimeChecks += 1
    }

    return buckets.map((bucket) => ({
      ...bucket,
      downtimeRate: bucket.totalChecks > 0 ? Math.round((bucket.downtimeChecks / bucket.totalChecks) * 100) : 0,
    }))
  }, [results])

  const stats = useMemo(() => {
    if (!results.length) {
      return {
        totalChecks: 0,
        downtimeChecks: 0,
        downtimeRate: 0,
      }
    }

    const totalChecks = results.length
    const downtimeChecks = results.filter((result) => !result.success).length
    const downtimeRate = Math.round((downtimeChecks / totalChecks) * 100)

    return { totalChecks, downtimeChecks, downtimeRate }
  }, [results])

  if (!results.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No downtime data yet.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total checks" value={stats.totalChecks.toLocaleString()} unit="checks" />
        <StatCard
          label="Downtime checks"
          value={stats.downtimeChecks.toLocaleString()}
          unit="checks"
          variant={stats.downtimeChecks > 0 ? "error" : "default"}
        />
        <StatCard
          label="Downtime rate"
          value={stats.downtimeRate}
          unit="%"
          variant={stats.downtimeRate > 5 ? "warning" : "default"}
        />
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground/90">Downtime trend</h3>
          <p className="mt-1 text-sm text-muted-foreground">Failed checks grouped across the selected window.</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="downtimeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/[0.05]" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: "Downtime (%)", angle: -90, position: "insideLeft" }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                padding: "12px",
              }}
              labelStyle={{ color: "rgb(255, 255, 255)" }}
              formatter={(value: number, name: string) => {
                if (name === "Downtime rate") return [`${value}%`, name]
                return [value, name]
              }}
            />
            <Area
              type="monotone"
              dataKey="downtimeRate"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#downtimeFill)"
              isAnimationActive={false}
              name="Downtime rate"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  unit: string
  variant?: "default" | "error" | "warning"
}

function StatCard({ label, value, unit, variant = "default" }: StatCardProps) {
  let borderColor = "border-border"
  let bgColor = "bg-card"
  let textColor = "text-foreground/90"

  if (variant === "error") {
    borderColor = "border-red-500/25"
    bgColor = "bg-red-500/10"
    textColor = "text-red-200"
  } else if (variant === "warning") {
    borderColor = "border-yellow-500/25"
    bgColor = "bg-yellow-500/10"
    textColor = "text-yellow-200"
  }

  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} p-4`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${textColor}`}>
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}