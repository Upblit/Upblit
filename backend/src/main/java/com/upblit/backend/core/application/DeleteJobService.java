package com.upblit.backend.core.application;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DeleteJobService {
    @Autowired
    private DeleteJobRepository repo;

    public DeleteJob create(Long applicationId) {
        DeleteJob job = new DeleteJob();
        job.setApplicationId(applicationId);
        job.setStatus(DeleteJob.Status.PENDING);
        return repo.save(job);
    }

    public Optional<DeleteJob> find(Long id) {
        return repo.findById(id);
    }

    public java.util.List<DeleteJob> findPending() {
        return repo.findByStatus(DeleteJob.Status.PENDING);
    }

    public DeleteJob save(DeleteJob job) { return repo.save(job); }
}
