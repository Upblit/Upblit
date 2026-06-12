"use client"

import { useState, useMemo } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import type { Logs } from "@/lib/types"
import { SearchIcon, CopyIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface LogsTableProps {
  logs: Logs[]
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

function getLevelColor(level: string): string {
  const upper = level.toUpperCase()
  if (upper === "ERROR") return "bg-red-200/10 text-red-500 border-red-500/25"
  if (upper === "WARN" || upper === "WARNING") return "bg-yellow-200/10 text-yellow-500 border-yellow-500/25"
  if (upper === "INFO") return "bg-blue-200/10 text-blue-500 border-blue-500/25"
  if (upper === "DEBUG") return "bg-purple-200/10 text-purple-500 border-purple-500/25"
  return "bg-gray-500/10 text-gray-500 border-gray-500/25"
}

export function LogsTable({ logs, pagination, actions }: LogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("")
  const [selectedLog, setSelectedLog] = useState<Logs | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.traceId?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLevel = !levelFilter || log.level?.toUpperCase() === levelFilter.toUpperCase()
      return matchesSearch && matchesLevel
    })
  }, [logs, searchQuery, levelFilter])

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach((log) => {
      const level = log.level?.toUpperCase() || "UNKNOWN"
      counts[level] = (counts[level] || 0) + 1
    })
    return counts
  }, [logs])

  const openDetail = (log: Logs) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  if (typeof window !== 'undefined') {
    console.log('LogsTable - logs:', logs, 'levelCounts:', levelCounts)
  }

  if (!logs.length) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.01] p-8 text-center">
        <p className="text-muted-foreground">No logs available</p>
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
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/40 border-white/[0.08] h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <LevelFilter
            label="All"
            count={logs.length}
            active={!levelFilter}
            onClick={() => setLevelFilter("")}
          />
          {Object.entries(levelCounts).map(([level, count]) => (
            <LevelFilter
              key={level}
              label={level}
              count={count}
              active={levelFilter === level}
              onClick={() => setLevelFilter(level)}
            />
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border border-white/[0.08] bg-background/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-background/40">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Level</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Message</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Trace ID</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-white/[0.05] hover:bg-background/40 transition">
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${getLevelColor(log.level || "unknown")}`}>
                      {log.level || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-foreground/80 max-w-xs truncate">{log.message}</td>
                  <td className="px-6 py-3 font-mono text-[10px] text-muted-foreground">{log.traceId}</td>
                  <td className="px-6 py-3 text-muted-foreground text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetail(log)}
                      className="h-7 text-xs text-[#087f9c] hover:text-[#0aa1c4] hover:bg-[#087f9c]/10"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
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
      {selectedLog && (
        <LogDetailDialog
          log={selectedLog}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      )}
    </div>
  )
}

interface LevelFilterProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function LevelFilter({ label, count, active, onClick }: LevelFilterProps) {
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

interface LogDetailDialogProps {
  log: Logs
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function LogDetailDialog({ log, isOpen, onOpenChange }: LogDetailDialogProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl bg-[#0a0a0a]/95 border-l border-white/[0.08]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={`inline-block px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${getLevelColor(log.level || "unknown")}`}>
              {log.level || "UNKNOWN"}
            </span>
            Log Details
          </SheetTitle>
          <SheetDescription>Complete log information</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Message */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Message</p>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.08] p-3">
              <p className="text-sm text-white/90 break-words">{log.message}</p>
            </div>
          </div>

          {/* Trace ID */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase flex items-center justify-between">
              Trace ID
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(log.traceId)}
                className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-white"
              >
                <CopyIcon className="size-3" />
                Copy
              </Button>
            </p>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.08] p-3 font-mono text-[10px] text-muted-foreground">
              {log.traceId}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetadataItem label="Application ID" value={log.applicationId} />
            <MetadataItem label="Project ID" value={log.projectId} />
            <MetadataItem label="Type" value={log.type || "N/A"} />
            <MetadataItem
              label="Timestamp"
              value={new Date(log.timestamp).toLocaleString()}
            />
            {log.clientTimestamp && (
              <MetadataItem label="Client Time" value={new Date(log.clientTimestamp).toLocaleString()} />
            )}
            {log.serverTimestamp && (
              <MetadataItem label="Server Time" value={new Date(log.serverTimestamp).toLocaleString()} />
            )}
          </div>
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
