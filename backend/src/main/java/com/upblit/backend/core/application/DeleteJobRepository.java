package com.upblit.backend.core.application;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeleteJobRepository extends JpaRepository<DeleteJob, Long> {
    List<DeleteJob> findByStatus(DeleteJob.Status status);
}
