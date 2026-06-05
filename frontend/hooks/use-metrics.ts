import { useCallback, useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import type { Metrics, PaginatedResponse } from "@/lib/types"

export function useMetrics(projectId: number | null, applicationId?: number, startTime?: Date, endTime?: Date) {
  const [metrics, setMetrics] = useState<Metrics[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const fetchMetrics = useCallback(async (page: number = 0, size: number = 20) => {
    if (projectId == null) return
    const currentProjectId = projectId

    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { projectId: currentProjectId, page, size }
      if (applicationId) params.applicationId = applicationId
      if (startTime) params.start = startTime.toISOString()
      if (endTime) params.end = endTime.toISOString()

      const data = await apiGet<PaginatedResponse<Metrics> | Metrics[]>("/query/metrics", params)
      
      // Check if response is paginated
      if (data && "data" in data) {
        const paginatedData = data as PaginatedResponse<Metrics>
        setMetrics(paginatedData.data || [])
        setCurrentPage(paginatedData.currentPage)
        setPageSize(paginatedData.pageSize)
        setTotalElements(paginatedData.totalElements)
        setTotalPages(paginatedData.totalPages)
        setHasNext(paginatedData.hasNext)
        setHasPrevious(paginatedData.hasPrevious)
      } else {
        // Fallback for non-paginated response
        setMetrics(Array.isArray(data) ? data : [])
        setCurrentPage(0)
        setPageSize(0)
        setTotalElements(Array.isArray(data) ? data.length : 0)
        setTotalPages(1)
        setHasNext(false)
        setHasPrevious(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics")
    } finally {
      setIsLoading(false)
    }
  }, [projectId, applicationId, startTime, endTime])

  useEffect(() => {
    void fetchMetrics(currentPage, pageSize)
  }, [fetchMetrics, currentPage, pageSize])

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
    metrics, 
    isLoading, 
    error, 
    refetch: fetchMetrics,
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

export function useLatestMetrics(projectId: number | null, applicationId?: number) {
  const [metric, setMetric] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId == null) return
    const currentProjectId = projectId

    async function fetch() {
      setIsLoading(true)
      setError(null)
      try {
        const params: Record<string, string | number> = { projectId: currentProjectId }
        if (applicationId) params.applicationId = applicationId

        const data = await apiGet<Metrics>("/query/metrics/latest", params)
        setMetric(data || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch latest metric")
      } finally {
        setIsLoading(false)
      }
    }

    void fetch()
  }, [projectId, applicationId])

  return { metric, isLoading, error }
}
