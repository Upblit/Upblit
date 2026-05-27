package com.upblit.backend.core.application;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DeleteJobProcessor {
    @Autowired
    private DeleteJobService jobService;
    @Autowired
    private TelemetryPurger purger;

    @Scheduled(fixedDelayString = "5000")
    public void pollAndProcess() {
        List<DeleteJob> pending = jobService.findPending();
        for (DeleteJob job : pending) {
            try {
                job.setStatus(DeleteJob.Status.RUNNING);
                jobService.save(job);

                var result = purger.purgeTelemetry(job.getApplicationId());
                job.setResult(result.toString());
                job.setStatus(DeleteJob.Status.COMPLETED);
                jobService.save(job);
            } catch (Exception e) {
                job.setErrorMessage(e.getMessage());
                job.setStatus(DeleteJob.Status.FAILED);
                jobService.save(job);
            }
        }
    }
}
