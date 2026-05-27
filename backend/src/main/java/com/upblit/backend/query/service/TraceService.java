package com.upblit.backend.query.service;

import com.upblit.backend.query.dto.PaginatedResponse;
import com.upblit.backend.query.model.Trace;
import com.upblit.backend.query.repository.TraceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TraceService {

    private final TraceRepository traceRepository;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    // Non-paginated methods (for backward compatibility)
    public Optional<Trace> getTraceByProjectIdAndTraceId(Long projectId, String traceId) {
        return traceRepository.findByProjectIdAndTraceId(projectId, traceId);
    }

    public List<Trace> getTracesByProjectId(Long projectId) {
        return traceRepository.findByProjectId(projectId);
    }

    public List<Trace> getTracesByProjectAndApplication(Long projectId, Long applicationId) {
        return traceRepository.findByProjectIdAndApplicationId(projectId, applicationId);
    }

    public List<Trace> getTracesByProjectAndApplicationAndTimeRange(Long projectId, Long applicationId, Instant start, Instant end) {
        return traceRepository.findByProjectIdAndApplicationIdAndTimestampBetween(projectId, applicationId, start, end);
    }

    public List<Trace> getTracesByProjectIdAndTimeRange(Long projectId, Instant start, Instant end) {
        return traceRepository.findByProjectIdAndTimestampBetween(projectId, start, end);
    }

    public List<Trace> getTracesByProjectIdAndResponseStatusGreaterThanEqual(Long projectId, int status) {
        return traceRepository.findByProjectIdAndResponseStatusGreaterThanEqual(projectId, status);
    }

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

    public PaginatedResponse<Trace> getTracesByProjectIdPaginated(Long projectId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectId(projectId, pageable));
    }

    public PaginatedResponse<Trace> getTracesByProjectAndApplicationPaginated(Long projectId, Long applicationId, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectIdAndApplicationId(projectId, applicationId, pageable));
    }

    public PaginatedResponse<Trace> getTracesByProjectAndApplicationAndTimeRangePaginated(Long projectId, Long applicationId, Instant start, Instant end, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectIdAndApplicationIdAndTimestampBetween(projectId, applicationId, start, end, pageable));
    }

    public PaginatedResponse<Trace> getTracesByProjectIdAndTimeRangePaginated(Long projectId, Instant start, Instant end, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectIdAndTimestampBetween(projectId, start, end, pageable));
    }

    public PaginatedResponse<Trace> getTracesByProjectIdAndResponseStatusGreaterThanEqualPaginated(Long projectId, int status, int page, int size) {
        Pageable pageable = createPageable(page, size, "timestamp", "desc");
        return PaginatedResponse.from(traceRepository.findByProjectIdAndResponseStatusGreaterThanEqual(projectId, status, pageable));
    }
}
