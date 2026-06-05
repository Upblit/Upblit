"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Trace } from "@/lib/types"
import { SearchIcon, CopyIcon, ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon } from "lucide-react"

interface TracesTableProps {
  traces: Trace[]
  pagination?: {
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  actions?: {
    nextPage: () => void
    previousPage: () => void
    goToPage: (page: number) => void
    changePageSize: (size: number) => void
  }
}

function getStatusColor(status: number): string {
  if (status < 300) return "text-green-400 bg-green-500/10"
  if (status < 400) return "text-blue-400 bg-blue-500/10"
  if (status < 500) return "text-yellow-400 bg-yellow-500/10"
  return "text-red-400 bg-red-500/10"
}

function getStatusText(status: number): string {
  if (status < 300) return "Success"
  if (status < 400) return "Redirect"
  if (status < 500) return "Client Error"
  return "Server Error"
}

interface TraceGroup {
  traceId: string
  spans: Trace[]
  mainSpan: Trace
}

export function TracesTable({ traces, pagination, actions }: TracesTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [expandedTraceIds, setExpandedTraceIds] = useState<Set<string>>(new Set())

  const { groupedTraces, filteredGroups } = useMemo(() => {
    // Group traces by traceId
    const groups: Record<string, TraceGroup> = {}

    traces.forEach((trace) => {
      if (!trace.traceId) return

      if (!groups[trace.traceId]) {
        groups[trace.traceId] = {
          traceId: trace.traceId,
          spans: [],
          mainSpan: trace,
        }
      }

      groups[trace.traceId].spans.push(trace)

      // Update mainSpan to be the one without parentSpanId (root span)
      if (!trace.parentSpanId) {
        groups[trace.traceId].mainSpan = trace
      }
    })

    // Sort spans within each group: parents first, then children
    const sortedGroups = Object.values(groups).map((group) => ({
      ...group,
      spans: group.spans.sort((a, b) => {
        // Root spans (no parent) first
        if (!a.parentSpanId && b.parentSpanId) return -1
        if (a.parentSpanId && !b.parentSpanId) return 1
        
        // Then sort by spanId
        return (a.spanId || "").localeCompare(b.spanId || "")
      }),
    }))

    // Filter groups
    const filtered = sortedGroups.filter((group) => {
      const matchesSearch =
        group.mainSpan.requestURL?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.traceId?.toLowerCase().includes(searchQuery.toLowerCase())

      if (!statusFilter) return matchesSearch

      const statusCode = parseInt(statusFilter)
      const traceStatusCode = Math.floor(group.mainSpan.responseStatus / 100) * 100
      return matchesSearch && traceStatusCode === statusCode
    })

    return { groupedTraces: sortedGroups, filteredGroups: filtered }
  }, [traces, searchQuery, statusFilter])

  const statusGroups = useMemo(() => {
    const groups: Record<string, { count: number; label: string }> = {
      "2": { count: 0, label: "2xx" },
      "3": { count: 0, label: "3xx" },
      "4": { count: 0, label: "4xx" },
      "5": { count: 0, label: "5xx" },
    }

    groupedTraces.forEach((group) => {
      const statusGroup = Math.floor(group.mainSpan.responseStatus / 100)
      if (groups[statusGroup]) {
        groups[statusGroup].count++
      }
    })

    return groups
  }, [groupedTraces])

  const toggleTraceExpanded = (traceId: string) => {
    const newExpanded = new Set(expandedTraceIds)
    if (newExpanded.has(traceId)) {
      newExpanded.delete(traceId)
    } else {
      newExpanded.add(traceId)
    }
    setExpandedTraceIds(newExpanded)
  }

  const openDetail = (trace: Trace) => {
    setSelectedTrace(trace)
    setIsDetailOpen(true)
  }

  if (!traces.length) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.01] p-8 text-center">
        <p className="text-muted-foreground">No traces available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search traces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/[0.03] border-white/[0.08] h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusFilter
            label="All"
            count={groupedTraces.length}
            active={!statusFilter}
            onClick={() => setStatusFilter("")}
          />
          {[
            { key: "200", label: "2xx", group: statusGroups["2"] },
            { key: "300", label: "3xx", group: statusGroups["3"] },
            { key: "400", label: "4xx", group: statusGroups["4"] },
            { key: "500", label: "5xx", group: statusGroups["5"] },
          ].map(({ key, label, group }) => (
            <StatusFilter
              key={key}
              label={label}
              count={group.count}
              active={statusFilter === key}
              onClick={() => setStatusFilter(key)}
            />
          ))}
        </div>
      </div>

      {/* Traces Table */}
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground w-8"></th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Method</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">URL</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Duration</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Spans</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => {
                const isExpanded = expandedTraceIds.has(group.traceId)
                const hasMultipleSpans = group.spans.length > 1

                return (
                  <React.Fragment key={group.traceId}>
                    {/* Main trace row */}
                    <tr className="border-b border-white/[0.05] hover:bg-white/[0.02] transition">
                      <td className="px-3 py-3 w-8">
                        {hasMultipleSpans && (
                          <button
                            onClick={() => toggleTraceExpanded(group.traceId)}
                            className="text-muted-foreground hover:text-white p-0 flex items-center justify-center"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="size-4" />
                            ) : (
                              <ChevronRightIcon className="size-4" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 w-16">
                        <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs ${getStatusColor(group.mainSpan.responseStatus)}`}>
                          {group.mainSpan.responseStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 w-16">
                        <span className="font-mono text-[10px] font-bold text-[#8ee8f5]">
                          {group.mainSpan.requestMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex-1 min-w-0">
                        <p className="text-white/80 truncate text-xs">
                          {group.mainSpan.requestURL}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[10px] w-24">
                        <span className={group.mainSpan.durationMs > 1000 ? "text-yellow-400" : "text-white/80"}>
                          {group.mainSpan.durationMs}ms
                        </span>
                      </td>
                      <td className="px-4 py-3 w-16">
                        <span className="text-xs text-muted-foreground bg-white/[0.05] px-2 py-1 rounded inline-block">
                          {group.spans.length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs w-40">
                        {new Date(group.mainSpan.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 w-20">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetail(group.mainSpan)}
                          className="h-7 text-xs text-[#087f9c] hover:text-[#0aa1c4] hover:bg-[#087f9c]/10"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded spans */}
                    {isExpanded && hasMultipleSpans && (
                      <>
                        {group.spans.map((span, idx) => (
                          <tr key={idx} className="border-b border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.02] transition">
                            <td className="px-3 py-2 w-8">
                              {span.parentSpanId && (
                                <div className="text-muted-foreground text-xs text-center">→</div>
                              )}
                            </td>
                            <td className="px-4 py-2 w-16">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${getStatusColor(span.responseStatus)}`}>
                                {span.responseStatus}
                              </span>
                            </td>
                            <td className="px-4 py-2 w-16">
                              <span className="font-mono text-[10px] font-bold text-[#8ee8f5]">
                                {span.requestMethod}
                              </span>
                            </td>
                            <td className="px-4 py-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                  {span.spanType ? `[${span.spanType}]` : "[span]"}
                                </span>
                                <span className="text-[10px] text-white/80 truncate font-mono">
                                  {span.spanId}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-[10px] w-24">
                              <span className={span.durationMs > 500 ? "text-yellow-400" : "text-white/80"}>
                                {span.durationMs}ms
                              </span>
                            </td>
                            <td className="px-4 py-2 w-16"></td>
                            <td className="px-4 py-2 text-muted-foreground text-[10px] w-40">
                              {new Date(span.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-2 w-20">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetail(span)}
                                className="h-6 text-[10px] text-[#087f9c] hover:text-[#0aa1c4] hover:bg-[#087f9c]/10"
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && actions && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.08] bg-white/[0.01] p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage + 1} of {pagination.totalPages} ({pagination.totalElements} total)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Per page:</span>
              <Select defaultValue={pagination.pageSize.toString()} onValueChange={(val) => actions.changePageSize(parseInt(val))}>
                <SelectTrigger className="w-20 bg-white/[0.03] border-white/[0.08] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a]/95 border-white/[0.08]">
                  <SelectItem value="10" className="text-xs">10</SelectItem>
                  <SelectItem value="20" className="text-xs">20</SelectItem>
                  <SelectItem value="50" className="text-xs">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.previousPage()}
                disabled={!pagination.hasPrevious}
                className="h-8 w-8 p-0 border-white/[0.08]"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.nextPage()}
                disabled={!pagination.hasNext}
                className="h-8 w-8 p-0 border-white/[0.08]"
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTrace && (
        <TraceDetailDialog
          trace={selectedTrace}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      )}
    </div>
  )
}

interface StatusFilterProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function StatusFilter({ label, count, active, onClick }: StatusFilterProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`h-8 text-xs gap-2 ${
        active
          ? "bg-[#087f9c] text-white hover:bg-[#0aa1c4]"
          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08]"
      }`}
    >
      {label} <span className="text-[10px] opacity-75">({count})</span>
    </Button>
  )
}

interface TraceDetailDialogProps {
  trace: Trace
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function TraceDetailDialog({ trace, isOpen, onOpenChange }: TraceDetailDialogProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl bg-[#0a0a0a]/95 border-l border-white/[0.08] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs ${getStatusColor(trace.responseStatus)}`}>
              {trace.responseStatus}
            </span>
            Trace Details
          </SheetTitle>
          <SheetDescription>{getStatusText(trace.responseStatus)}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Request */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase">Request</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Method</p>
                <p className="font-mono text-sm font-bold text-[#8ee8f5]">{trace.requestMethod}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">URL</p>
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.08] p-3">
                  <p className="text-sm text-white/90 break-all font-mono">{trace.requestURL}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Response */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase">Response</p>
            <div className="grid grid-cols-2 gap-3">
              <MetadataItem label="Status Code" value={trace.responseStatus} />
              <MetadataItem label="Duration" value={`${trace.durationMs}ms`} />
            </div>
          </div>

          {/* Span Information */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase">Span Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1 flex items-center justify-between">
                  Trace ID
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(trace.traceId)}
                    className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-white"
                  >
                    <CopyIcon className="size-3" />
                  </Button>
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">{trace.traceId}</p>
              </div>

              <MetadataItem label="Span ID" value={trace.spanId} />
              <MetadataItem label="Parent Span ID" value={trace.parentSpanId || "N/A"} />
              <MetadataItem label="Span Type" value={trace.spanType || "N/A"} />
            </div>
          </div>

          {/* Metadata Grid */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase">Metadata</p>
            <div className="grid grid-cols-2 gap-3">
              <MetadataItem label="Application ID" value={trace.applicationId} />
              <MetadataItem label="Project ID" value={trace.projectId} />
              <MetadataItem label="Timestamp" value={new Date(trace.timestamp).toLocaleString()} />
              {trace.clientTimestamp && (
                <MetadataItem label="Client Time" value={new Date(trace.clientTimestamp).toLocaleString()} />
              )}
              {trace.serverTimestamp && (
                <MetadataItem label="Server Time" value={new Date(trace.serverTimestamp).toLocaleString()} />
              )}
            </div>
          </div>

          {/* Additional Meta */}
          {trace.meta && Object.keys(trace.meta).length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase">Custom Metadata</p>
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.08] p-3">
                <div className="space-y-2">
                  {Object.entries(trace.meta).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3">
                      <p className="text-[10px] text-muted-foreground font-mono">{key}</p>
                      <p className="text-[10px] text-white/80 font-mono text-right break-all">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MetadataItemProps {
  label: string
  value: string | number
}

function MetadataItem({ label, value }: MetadataItemProps) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase">{label}</p>
      <p className="text-sm text-white/80 font-mono break-all">{value}</p>
    </div>
  )
}
