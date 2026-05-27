package com.upblit.backend.core.application;

import com.upblit.backend.core.ApplicationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/applications")
public class ApplicationController {
    @Autowired
    private ApplicationService applicationService;
    @PostMapping
    public ResponseEntity<?> save(@RequestBody ApplicationDTO applicationDTO) {
        System.out.println("hello world");

        return applicationService.createApplication(applicationDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ApplicationDTO applicationDTO) {
        return applicationService.updateApplication(id, applicationDTO);
    }

    @GetMapping()
    public ResponseEntity<?> getApplications(@RequestParam Long projectId) {
        return applicationService.getApplicationsByProject(projectId);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        return applicationService.deleteApplication(id);
    }

    @PostMapping("/{id}/delete-job")
    public ResponseEntity<?> createDeleteJob(@PathVariable Long id) {
        return applicationService.enqueueDeleteJob(id);
    }

    @GetMapping("/delete-job/{jobId}")
    public ResponseEntity<?> getDeleteJob(@PathVariable Long jobId) {
        return applicationService.getDeleteJob(jobId);
    }
}
