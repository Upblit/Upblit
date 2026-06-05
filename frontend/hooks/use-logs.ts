import { useCallback, useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import type { Logs, PaginatedResponse } from "@/lib/types"

export function useLogs(
  projectId: number | null,
  applicationId?: number,
  traceId?: string,
  level?: string,
  startTime?: Date,
  endTime?: Date,
) {
  const [logs, setLogs] = useState<Logs[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const fetchLogs = useCallback(async (page: number = 0, size: number = 20) => {
    if (projectId == null) return
    const currentProjectId = projectId

    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { projectId: currentProjectId, page, size }
      if (applicationId) params.applicationId = applicationId
      if (traceId) params.traceId = traceId
      if (level) params.level = level
      if (startTime) params.start = startTime.toISOString()
      if (endTime) params.end = endTime.toISOString()

      const data = await apiGet<PaginatedResponse<Logs> | Logs[]>("/query/logs", params)
      
      // Check if response is paginated
      if (data && "data" in data) {
        const paginatedData = data as PaginatedResponse<Logs>
        setLogs(paginatedData.data || [])
        setCurrentPage(paginatedData.currentPage)
        setPageSize(paginatedData.pageSize)
        setTotalElements(paginatedData.totalElements)
        setTotalPages(paginatedData.totalPages)
        setHasNext(paginatedData.hasNext)
        setHasPrevious(paginatedData.hasPrevious)
      } else {
        // Fallback for non-paginated response
        setLogs(Array.isArray(data) ? data : [])
        setCurrentPage(0)
        setPageSize(0)
        setTotalElements(Array.isArray(data) ? data.length : 0)
        setTotalPages(1)
        setHasNext(false)
        setHasPrevious(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setIsLoading(false)
    }
  }, [projectId, applicationId, traceId, level, startTime, endTime])

  useEffect(() => {
    void fetchLogs(currentPage, pageSize)
  }, [fetchLogs, currentPage, pageSize])

  const nextPage = useCallback(() => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNext])

  const previousPage = useCallback(() => {
    if (hasPrevious) {
      setCurrentPage(prev => Math.max(0, prev - 1))
    }
  }, [hasPrevious])

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const changePageSize = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }, [])

  return { 
    logs, 
    isLoading, 
    error, 
    refetch: fetchLogs,
    pagination: {
      currentPage,
      pageSize,
      totalElements,
      totalPages,
      hasNext,
      hasPrevious,
    },
    actions: {
      nextPage,
      previousPage,
      goToPage,
      changePageSize,
    }
  }
}

export function useLogCountByLevel(projectId: number | null, level: string) {
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (projectId == null || !level) return
    const currentProjectId = projectId

    async function fetch() {
      setIsLoading(true)
      try {
        const data = await apiGet<{ count: number }>("/query/logs/count", {
          projectId: currentProjectId,
          level,
        })
        setCount(data.count || 0)
      } catch (err) {
        console.error("Failed to fetch log count:", err)
      } finally {
        setIsLoading(false)
      }
    }

    void fetch()
  }, [projectId, level])

  return { count, isLoading }
}

