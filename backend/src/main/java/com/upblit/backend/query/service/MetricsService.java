package com.upblit.backend.query.service;

import com.upblit.backend.query.dto.PaginatedResponse;
import com.upblit.backend.query.model.Metrics;
import com.upblit.backend.query.repository.MetricsRepository;
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
@CacheConfig(cacheNames = "metrics-query")
public class MetricsService {

    private final MetricsRepository metricsRepository;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    // Non-paginated methods (for backward compatibility)
    @Cacheable(key = "'project:' + #projectId")
    public List<Metrics> getMetricsByProjectId(Long projectId) {
        return metricsRepository.findByProjectId(projectId);
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId")
    public List<Metrics> getMetricsByProjectAndApplication(Long projectId, Long applicationId) {
        return metricsRepository.findByProjectIdAndApplicationId(projectId, applicationId);
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':range:' + #start + ':' + #end")
    public List<Metrics> getMetricsByProjectAndApplicationAndTimeRange(Long projectId, Long applicationId, Instant start, Instant end) {
        return metricsRepository.findByProjectIdAndApplicationIdAndTimestampBetween(projectId, applicationId, start, end);
    }

    @Cacheable(key = "'project:' + #projectId + ':range:' + #start + ':' + #end")
    public List<Metrics> getMetricsByProjectIdAndTimeRange(Long projectId, Instant start, Instant end) {
        return metricsRepository.findByProjectIdAndTimestampBetween(projectId, start, end);
    }

    @Cacheable(key = "'latest:project:' + #projectId")
    public Optional<Metrics> getLatestMetricsByProjectId(Long projectId) {
        return metricsRepository.findTopByProjectIdOrderByTimestampDesc(projectId);
    }

    @Cacheable(key = "'latest:project:' + #projectId + ':application:' + #applicationId")
    public Optional<Metrics> getLatestMetricsByProjectAndApplicationId(Long projectId, Long applicationId) {
        return metricsRepository.findTopByProjectIdAndApplicationIdOrderByTimestampDesc(projectId, applicationId);
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
    public PaginatedResponse<Metrics> getMetricsByProjectIdPaginated(Long projectId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(metricsRepository.findByProjectId(projectId, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Metrics> getMetricsByProjectAndApplicationPaginated(Long projectId, Long applicationId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(metricsRepository.findByProjectIdAndApplicationId(projectId, applicationId, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':application:' + #applicationId + ':range:' + #start + ':' + #end + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Metrics> getMetricsByProjectAndApplicationAndTimeRangePaginated(Long projectId, Long applicationId, Instant start, Instant end, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(metricsRepository.findByProjectIdAndApplicationIdAndTimestampBetween(projectId, applicationId, start, end, pageable));
    }

    @Cacheable(key = "'project:' + #projectId + ':range:' + #start + ':' + #end + ':page:' + #page + ':size:' + #size")
    public PaginatedResponse<Metrics> getMetricsByProjectIdAndTimeRangePaginated(Long projectId, Instant start, Instant end, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(metricsRepository.findByProjectIdAndTimestampBetween(projectId, start, end, pageable));
    }
}