package com.upblit.backend.query.repository;

import com.upblit.backend.query.model.Metrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricsRepository extends MongoRepository<Metrics, String> {

    List<Metrics> findByProjectId(Long projectId);

    List<Metrics> findByApplicationId(Long applicationId);

    List<Metrics> findByProjectIdAndApplicationId(
            Long projectId,
            Long applicationId
    );

    @Query("{ 'projectId': ?0, 'applicationId': ?1, 'timestamp': { $gte: ?2, $lte: ?3 } }")
    List<Metrics> findByProjectIdAndApplicationIdAndTimestampBetween(
            Long projectId,
            Long applicationId,
            Instant start,
            Instant end
    );

    List<Metrics> findByTimestampBetween(
            Instant start,
            Instant end
    );

    @Query("{ 'projectId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
    List<Metrics> findByProjectIdAndTimestampBetween(
            Long projectId,
            Instant start,
            Instant end
    );

    Optional<Metrics> findTopByProjectIdOrderByTimestampDesc(
            Long projectId
    );

    Optional<Metrics> findTopByApplicationIdOrderByTimestampDesc(
            Long applicationId
    );

    Optional<Metrics> findTopByProjectIdAndApplicationIdOrderByTimestampDesc(
            Long projectId,
            Long applicationId
    );

    // Paginated methods
    Page<Metrics> findByProjectId(Long projectId, Pageable pageable);

    Page<Metrics> findByProjectIdAndApplicationId(
            Long projectId,
            Long applicationId,
            Pageable pageable
    );

    @Query("{ 'projectId': ?0, 'applicationId': ?1, 'timestamp': { $gte: ?2, $lte: ?3 } }")
    Page<Metrics> findByProjectIdAndApplicationIdAndTimestampBetween(
            Long projectId,
            Long applicationId,
            Instant start,
            Instant end,
            Pageable pageable
    );

    @Query("{ 'projectId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
    Page<Metrics> findByProjectIdAndTimestampBetween(
            Long projectId,
            Instant start,
            Instant end,
            Pageable pageable
    );
}
