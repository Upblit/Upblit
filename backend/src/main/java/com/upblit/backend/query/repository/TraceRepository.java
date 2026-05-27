package com.upblit.backend.query.repository;

import com.upblit.backend.query.model.Trace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TraceRepository extends MongoRepository<Trace, String> {

    Optional<Trace> findByTraceId(String traceId);

        Optional<Trace> findByProjectIdAndTraceId(Long projectId, String traceId);

    List<Trace> findByProjectId(Long projectId);

    List<Trace> findByApplicationId(Long applicationId);

    List<Trace> findByProjectIdAndApplicationId(
            Long projectId,
            Long applicationId
    );

    @Query("{ 'projectId': ?0, 'applicationId': ?1, 'timestamp': { $gte: ?2, $lte: ?3 } }")
    List<Trace> findByProjectIdAndApplicationIdAndTimestampBetween(
            Long projectId,
            Long applicationId,
            Instant start,
            Instant end
    );

    List<Trace> findByTimestampBetween(
            Instant start,
            Instant end
    );

    @Query("{ 'projectId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
    List<Trace> findByProjectIdAndTimestampBetween(
            Long projectId,
            Instant start,
            Instant end
    );

    List<Trace> findByResponseStatusGreaterThanEqual(int status);

        List<Trace> findByProjectIdAndResponseStatusGreaterThanEqual(Long projectId, int status);

    long countByProjectId(Long projectId);

    // Paginated methods
    Page<Trace> findByProjectId(Long projectId, Pageable pageable);

    Page<Trace> findByProjectIdAndApplicationId(
            Long projectId,
            Long applicationId,
            Pageable pageable
    );

    @Query("{ 'projectId': ?0, 'applicationId': ?1, 'timestamp': { $gte: ?2, $lte: ?3 } }")
    Page<Trace> findByProjectIdAndApplicationIdAndTimestampBetween(
            Long projectId,
            Long applicationId,
            Instant start,
            Instant end,
            Pageable pageable
    );

    @Query("{ 'projectId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
    Page<Trace> findByProjectIdAndTimestampBetween(
            Long projectId,
            Instant start,
            Instant end,
            Pageable pageable
    );

    Page<Trace> findByProjectIdAndResponseStatusGreaterThanEqual(Long projectId, int status, Pageable pageable);
}
