package com.upblit.backend.query.service;

import com.upblit.backend.query.dto.PaginatedResponse;
import com.upblit.backend.query.model.Trace;
import com.upblit.backend.query.repository.TraceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@CacheConfig(cacheNames = "trace-query")
public class TraceService {

    private final TraceRepository traceRepository;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    // Non-paginated methods (for backward compatibility)
    @Cacheable(key = "'project:' + #projectId + ':trace:' + #traceId")
    public Optional<Trace> getTraceByProjectIdAndTraceId(Long projectId, String traceId) {
        return traceRepository.findByProjectIdAndTraceId(projectId, traceId);
    }

    @Cacheable(key = "'project:' + #projectId")
    public List<Trace> getTracesByProjectId(Long projectId) {
        return traceRepository.findByProjectId(projectId);
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId")
    public List<Trace> getTracesByProjectAndApplication(Long projectId, Long applicationId) {
        return traceRepository.findByProjectIdAndApplicationId(projectId, applicationId);
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':range:' + #start + ':' + #end")
    public List<Trace> getTracesByProjectAndApplicationAndTimeRange(Long projectId, Long applicationId, Instant start, Instant end) {
        return traceRepository.findByProjectIdAndApplicationIdAndTimestampBetween(projectId, applicationId, start, end);
    }

    @Cacheable(key = "'project:' + #projectId + ':range:' + #start + ':' + #end")
    public List<Trace> getTracesByProjectIdAndTimeRange(Long projectId, Instant start, Instant end) {
        return traceRepository.findByProjectIdAndTimestampBetween(projectId, start, end);
    }

    @Cacheable(key = "'project:' + #projectId + ':status:gte:' + #status")
    public List<Trace> getTracesByProjectIdAndResponseStatusGreaterThanEqual(Long projectId, int status) {
        return traceRepository.findByProjectIdAndResponseStatusGreaterThanEqual(projectId, status);
    }

    @Cacheable(key = "'count:project:' + #projectId")
    public long countTracesByProjectId(Long projectId) {
        return traceRepository.countByProjectId(projectId);
    }

    // Paginated methods
    private Pageable createPageable(int page, int size, String sortBy, String sortDirection) {
        int validPage = Math.max(page, 0);
        int validSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        validSize = size <= 0 ? DEFAULT_PAGE_SIZE : validSize;
        
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(validPage, validSize, Sort.by(direction, sortBy != null ? sortBy : "timestamp"));
    }

    @Cacheable(key = "'project:' + #projectId + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Trace> getTracesByProjectIdPaginated(Long projectId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectId(projectId, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Trace> getTracesByProjectAndApplicationPaginated(Long projectId, Long applicationId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectIdAndApplicationId(projectId, applicationId, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':range:' + #start + ':' + #end + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Trace> getTracesByProjectAndApplicationAndTimeRangePaginated(Long projectId, Long applicationId, Instant start, Instant end, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectIdAndApplicationIdAndTimestampBetween(projectId, applicationId, start, end, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':range:' + #start + ':' + #end + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Trace> getTracesByProjectIdAndTimeRangePaginated(Long projectId, Instant start, Instant end, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectIdAndTimestampBetween(projectId, start, end, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':status:gte:' + #status + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Trace> getTracesByProjectIdAndResponseStatusGreaterThanEqualPaginated(Long projectId, int status, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectIdAndResponseStatusGreaterThanEqual(projectId, status, pageable));
    }
}
