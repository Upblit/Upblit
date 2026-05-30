package com.upblit.backend.query.service;

import com.upblit.backend.query.dto.PaginatedResponse;
import com.upblit.backend.query.model.Log;
import com.upblit.backend.query.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@CacheConfig(cacheNames = "log-query")
public class LogService {

    private final LogRepository logRepository;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    // Non-paginated methods (for backward compatibility)
    @Cacheable(key = "'project:' + #projectId + ':trace:' + #traceId")
    public List<Log> getLogsByProjectIdAndTraceId(Long projectId, String traceId) {
        return logRepository.findByProjectIdAndTraceId(projectId, traceId);
    }

    @Cacheable(key = "'project:' + #projectId + ':level:' + #level")
    public List<Log> getLogsByProjectIdAndLevel(Long projectId, String level) {
        return logRepository.findByProjectIdAndLevel(projectId, level);
    }

    @Cacheable(key = "'project:' + #projectId")
    public List<Log> getLogsByProjectId(Long projectId) {
        return logRepository.findByProjectId(projectId);
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId")
    public List<Log> getLogsByProjectAndApplication(Long projectId, Long applicationId) {
        return logRepository.findByProjectIdAndApplicationId(projectId, applicationId);
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':range:' + #start + ':' + #end")
    public List<Log> getLogsByProjectAndApplicationAndTimeRange(Long projectId, Long applicationId, Instant start, Instant end) {
        return logRepository.findByProjectIdAndApplicationIdAndTimestampBetween(projectId, applicationId, start, end);
    }

    @Cacheable(key = "'project:' + #projectId + ':range:' + #start + ':' + #end")
    public List<Log> getLogsByProjectIdAndTimeRange(Long projectId, Instant start, Instant end) {
        return logRepository.findByProjectIdAndTimestampBetween(projectId, start, end);
    }

    @Cacheable(key = "'count:project:' + #projectId + ':level:' + #level")
    public long countLogsByProjectIdAndLevel(Long projectId, String level) {
        return logRepository.countByProjectIdAndLevel(projectId, level);
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
    public PaginatedResponse<Log> getLogsByProjectIdPaginated(Long projectId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(logRepository.findByProjectId(projectId, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':trace:' + #traceId + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Log> getLogsByProjectIdAndTraceIdPaginated(Long projectId, String traceId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(logRepository.findByProjectIdAndTraceId(projectId, traceId, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':level:' + #level + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Log> getLogsByProjectIdAndLevelPaginated(Long projectId, String level, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(logRepository.findByProjectIdAndLevel(projectId, level, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Log> getLogsByProjectAndApplicationPaginated(Long projectId, Long applicationId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(logRepository.findByProjectIdAndApplicationId(projectId, applicationId, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':range:' + #start + ':' + #end + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Log> getLogsByProjectAndApplicationAndTimeRangePaginated(Long projectId, Long applicationId, Instant start, Instant end, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(logRepository.findByProjectIdAndApplicationIdAndTimestampBetween(projectId, applicationId, start, end, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':range:' + #start + ':' + #end + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Log> getLogsByProjectIdAndTimeRangePaginated(Long projectId, Instant start, Instant end, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(logRepository.findByProjectIdAndTimestampBetween(projectId, start, end, pageable));
    }
}