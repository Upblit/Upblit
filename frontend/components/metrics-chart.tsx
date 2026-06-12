"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { Metrics } from "@/lib/types"

interface MetricsChartProps {
  metrics: Metrics[]
}

export function MetricsChart({ metrics }: MetricsChartProps) {
  const chartData = useMemo(() => {
    if (!metrics.length) return []

    return metrics.map((m) => ({
      timestamp: new Date(m.timestamp).toLocaleTimeString(),
      time: new Date(m.timestamp).toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      requests: m.requestCount,
      errors: m.errorCount,
      avgLatency: Math.round(m.avgLatency),
      maxLatency: Math.round(m.maxLatency),
      minLatency: m.minLatency ? Math.round(m.minLatency) : Math.round(m.avgLatency * 0.8),
      errorRate: m.requestCount > 0 ? Math.round((m.errorCount / m.requestCount) * 100) : 0,
    }))
  }, [metrics])

  const stats = useMemo(() => {
    if (!metrics.length) {
      return { 
        totalRequests: 0, 
        totalErrors: 0, 
        avgLatency: 0, 
        maxLatency: 0,
        errorRate: 0 
      }
    }

    const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0)
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0)
    const avgLatency = Math.round(
      metrics.reduce((sum, m) => sum + m.avgLatency, 0) / metrics.length,
    )
    const maxLatency = Math.max(...metrics.map((m) => m.maxLatency))
    const errorRate = totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 100) : 0

    return { totalRequests, totalErrors, avgLatency, maxLatency, errorRate }
  }, [metrics])

  if (!metrics.length) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.01] p-8 text-center">
        <p className="text-muted-foreground">No metrics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          unit="requests"
        />
        <StatCard
          label="Total Errors"
          value={stats.totalErrors}
          unit="errors"
          variant={stats.totalErrors > 0 ? "error" : "default"}
        />
        <StatCard
          label="Error Rate"
          value={stats.errorRate}
          unit="%"
          variant={stats.errorRate > 5 ? "warning" : "default"}
        />
        <StatCard
          label="Avg Latency"
          value={stats.avgLatency}
          unit="ms"
        />
        <StatCard
          label="Max Latency"
          value={stats.maxLatency}
          unit="ms"
          variant={stats.maxLatency > 1000 ? "warning" : "default"}
        />
      </div>

      {/* Latency Trend Chart */}
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.01] p-6">
        <h3 className="mb-2 text-sm font-medium">Latency Trend</h3>
        <p className="mb-4 text-xs text-muted-foreground">Average, minimum, and maximum latency over time</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAvgLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMaxLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-white/[0.05]" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval={Math.max(0, Math.floor(chartData.length / 12))}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                padding: "12px",
              }}
              labelStyle={{ color: "rgb(255, 255, 255)" }}
              formatter={(value: number) => `${value}ms`}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Area
              type="monotone"
              dataKey="avgLatency"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAvgLatency)"
              isAnimationActive={false}
              name="Avg Latency"
            />
            <Area
              type="monotone"
              dataKey="maxLatency"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMaxLatency)"
              isAnimationActive={false}
              name="Max Latency"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Request & Error Chart */}
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.01] p-6">
        <h3 className="mb-2 text-sm font-medium">Request Volume & Errors</h3>
        <p className="mb-4 text-xs text-muted-foreground">Total requests and error count over time</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-white/[0.05]" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval={Math.max(0, Math.floor(chartData.length / 12))}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: "Count", angle: -90, position: "insideLeft" }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                padding: "12px",
              }}
              labelStyle={{ color: "rgb(255, 255, 255)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#10b981"
              strokeWidth={2}
              isAnimationActive={false}
              name="Requests"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="errors"
              stroke="#f59e0b"
              strokeWidth={2}
              isAnimationActive={false}
              name="Errors"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics Table */}
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-background/40">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Time</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Requests</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Errors</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Error Rate</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Min Latency</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Avg Latency</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Max Latency</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, idx) => (
                <tr key={idx} className="border-b border-white/[0.05] hover:bg-background/40 transition">
                  <td className="px-6 py-3 text-muted-foreground text-xs">{row.timestamp}</td>
                  <td className="px-6 py-3 text-right text-foreground/90">{row.requests.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={row.errors > 0 ? "text-red-400" : "text-green-400"}>
                      {row.errors}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={row.errorRate > 5 ? "text-red-400" : row.errorRate > 0 ? "text-yellow-400" : "text-green-400"}>
                      {row.errorRate}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-foreground/80 text-xs">{row.minLatency}ms</td>
                  <td className="px-6 py-3 text-right text-foreground/80 text-xs">{row.avgLatency}ms</td>
                  <td className="px-6 py-3 text-right text-foreground/80 text-xs">{row.maxLatency}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  let borderColor = "border-background/40"
  let bgColor = "bg-background/40"
  let textColor = "text-foreground/90"

  if (variant === "error") {
    borderColor = "border-red-500/25"
    bgColor = "bg-red-200/10"
    textColor = "text-red-500"
  } else if (variant === "warning") {
    borderColor = "border-yellow-500/25"
    bgColor = "bg-yellow-200/10"
    textColor = "text-yellow-500"
  }

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4`}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${textColor}`}>
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}
