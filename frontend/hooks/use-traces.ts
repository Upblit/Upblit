import { useCallback, useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import type { Trace, PaginatedResponse } from "@/lib/types"

export function useTraces(
  projectId: number | null,
  applicationId?: number,
  startTime?: Date,
  endTime?: Date,
) {
  const [traces, setTraces] = useState<Trace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const fetchTraces = useCallback(async (page: number = 0, size: number = 50) => {
    if (projectId == null) return
    const currentProjectId = projectId

    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { projectId: currentProjectId, page, size }
      if (applicationId) params.applicationId = applicationId
      if (startTime) params.start = startTime.toISOString()
      if (endTime) params.end = endTime.toISOString()

      const data = await apiGet<PaginatedResponse<Trace> | Trace[]>("/query/traces", params)
      
      // Check if response is paginated
      if (data && "data" in data) {
        const paginatedData = data as PaginatedResponse<Trace>
        setTraces(paginatedData.data || [])
        setCurrentPage(paginatedData.currentPage)
        setPageSize(paginatedData.pageSize)
        setTotalElements(paginatedData.totalElements)
        setTotalPages(paginatedData.totalPages)
        setHasNext(paginatedData.hasNext)
        setHasPrevious(paginatedData.hasPrevious)
      } else {
        // Fallback for non-paginated response
        setTraces(Array.isArray(data) ? data : [])
        setCurrentPage(0)
        setPageSize(0)
        setTotalElements(Array.isArray(data) ? data.length : 0)
        setTotalPages(1)
        setHasNext(false)
        setHasPrevious(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch traces")
    } finally {
      setIsLoading(false)
    }
  }, [projectId, applicationId, startTime, endTime])

  useEffect(() => {
    void fetchTraces(currentPage, pageSize)
  }, [fetchTraces, currentPage, pageSize])

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
    traces, 
    isLoading, 
    error, 
    refetch: fetchTraces,
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

export function useTraceById(projectId: number | null, traceId: string) {
  const [trace, setTrace] = useState<Trace | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId == null || !traceId) return
    const currentProjectId = projectId

    async function fetch() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiGet<Trace>(`/query/traces/by-trace-id/${traceId}`, {
          projectId: currentProjectId,
        })
        setTrace(data || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch trace")
      } finally {
        setIsLoading(false)
      }
    }

    void fetch()
  }, [projectId, traceId])

  return { trace, isLoading, error }
}

export function useErrorTraces(projectId: number | null, statusCode: number = 400) {
  const [traces, setTraces] = useState<Trace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const fetchErrorTraces = useCallback(async (page: number = 0, size: number = 50) => {
    if (projectId == null) return
    const currentProjectId = projectId

    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGet<PaginatedResponse<Trace> | Trace[]>("/query/traces/errors", {
        projectId: currentProjectId,
        status: statusCode,
        page,
        size,
      })
      
      // Check if response is paginated
      if (data && "data" in data) {
        const paginatedData = data as PaginatedResponse<Trace>
        setTraces(paginatedData.data || [])
        setCurrentPage(paginatedData.currentPage)
        setPageSize(paginatedData.pageSize)
        setTotalElements(paginatedData.totalElements)
        setTotalPages(paginatedData.totalPages)
        setHasNext(paginatedData.hasNext)
        setHasPrevious(paginatedData.hasPrevious)
      } else {
        // Fallback for non-paginated response
        setTraces(Array.isArray(data) ? data : [])
        setCurrentPage(0)
        setPageSize(0)
        setTotalElements(Array.isArray(data) ? data.length : 0)
        setTotalPages(1)
        setHasNext(false)
        setHasPrevious(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch error traces")
    } finally {
      setIsLoading(false)
    }
  }, [projectId, statusCode])

  useEffect(() => {
    if (projectId == null) return
    void fetchErrorTraces(currentPage, pageSize)
  }, [projectId, statusCode, currentPage, pageSize, fetchErrorTraces])

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

  return { 
    traces, 
    isLoading, 
    error,
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
    }
  }
}

export function useTraceCount(projectId: number | null) {
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (projectId == null) return
    const currentProjectId = projectId

    async function fetch() {
      setIsLoading(true)
      try {
        const data = await apiGet<{ count: number }>("/query/traces/count", {
          projectId: currentProjectId,
        })
        setCount(data.count || 0)
      } catch (err) {
        console.error("Failed to fetch trace count:", err)
      } finally {
        setIsLoading(false)
      }
    }

    void fetch()
  }, [projectId])

  return { count, isLoading }
}
