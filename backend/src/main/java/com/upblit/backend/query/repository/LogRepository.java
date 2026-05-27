package com.upblit.backend.query.repository;


import com.upblit.backend.query.model.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface LogRepository extends MongoRepository<Log, String> {

    List<Log> findByTraceId(String traceId);

        List<Log> findByProjectIdAndTraceId(Long projectId, String traceId);

    List<Log> findByLevel(String level);

        List<Log> findByProjectIdAndLevel(Long projectId, String level);

    List<Log> findByProjectId(Long projectId);

    List<Log> findByApplicationId(Long applicationId);

    List<Log> findByProjectIdAndApplicationId(
            Long projectId,
            Long applicationId
    );

    @Query("{ 'projectId': ?0, 'applicationId': ?1, 'timestamp': { $gte: ?2, $lte: ?3 } }")
    List<Log> findByProjectIdAndApplicationIdAndTimestampBetween(
            Long projectId,
            Long applicationId,
            Instant start,
            Instant end
    );

    List<Log> findByTimestampBetween(
            Instant start,
            Instant end
    );

    @Query("{ 'projectId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
    List<Log> findByProjectIdAndTimestampBetween(
            Long projectId,
            Instant start,
            Instant end
    );

    long countByLevel(String level);

        long countByProjectIdAndLevel(Long projectId, String level);

    // Paginated methods
    Page<Log> findByProjectIdAndTraceId(Long projectId, String traceId, Pageable pageable);

    Page<Log> findByProjectIdAndLevel(Long projectId, String level, Pageable pageable);

    Page<Log> findByProjectId(Long projectId, Pageable pageable);

    Page<Log> findByProjectIdAndApplicationId(Long projectId, Long applicationId, Pageable pageable);

    @Query("{ 'projectId': ?0, 'applicationId': ?1, 'timestamp': { $gte: ?2, $lte: ?3 } }")
    Page<Log> findByProjectIdAndApplicationIdAndTimestampBetween(
            Long projectId,
            Long applicationId,
            Instant start,
            Instant end,
            Pageable pageable
    );

    @Query("{ 'projectId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
    Page<Log> findByProjectIdAndTimestampBetween(
            Long projectId,
            Instant start,
            Instant end,
            Pageable pageable
    );
}
