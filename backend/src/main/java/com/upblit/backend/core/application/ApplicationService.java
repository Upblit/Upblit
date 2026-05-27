package com.upblit.backend.core.application;

import com.upblit.backend.core.*;
import com.upblit.backend.security.UserdataUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class ApplicationService {
    @Autowired
    private ApplicationsRepository applicationsRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private DeleteJobService deleteJobService;
    @Autowired
    private TelemetryPurger telemetryPurger;

    public ResponseEntity<?> createApplication(ApplicationDTO applicationDTO) {
        Project project = projectRepository
                .findByIdAndOrganizationId(applicationDTO.getProjectId(), applicationDTO.getOrganizationId())
                .orElse(null);

        if (project == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // --- Quota check ---
        Organization org = project.getOrganization();
        Plan plan = org.getPlan() != null ? org.getPlan() : Plan.PIRATES;
        PlanLimits limits = PlanLimits.of(plan);

        // Check org-wide application cap
        long totalOrgApps = applicationsRepository.countByProjectOrganizationId(org.getId());
        if (totalOrgApps >= limits.maxApplicationsPerOrg) {
            throw new QuotaExceededException(
                "applications (org-wide)",
                (int) totalOrgApps,
                limits.maxApplicationsPerOrg,
                plan
            );
        }

        // Check per-project application cap
        List<Application> existingApps = applicationsRepository
                .findByProjectId(applicationDTO.getProjectId())
                .orElse(Collections.emptyList());

        if (existingApps.size() >= limits.maxApplicationsPerProject) {
            throw new QuotaExceededException(
                "applications",
                existingApps.size(),
                limits.maxApplicationsPerProject,
                plan
            );
        }


        Application application = new Application();
        application.setName(applicationDTO.getName());
        application.setDescription(applicationDTO.getDescription());
        application.setEnvironment(applicationDTO.getEnvironment());
        application.setProject(project);
        return ResponseEntity.ok().body(applicationsRepository.save(application));
    }

    public ResponseEntity<?> updateApplication(Long id, ApplicationDTO applicationDTO) {
        return applicationsRepository
                .findByIdAndProjectOrganizationUsersId(id, UserdataUtil.getCurrentUserId())
                .map(application -> {
                    if (applicationDTO.getName() != null) {
                        application.setName(applicationDTO.getName());
                    }

                    if (applicationDTO.getDescription() != null) {
                        application.setDescription(applicationDTO.getDescription());
                    }

                    if (applicationDTO.getEnvironment() != null) {
                        application.setEnvironment(applicationDTO.getEnvironment());
                    }

                    return ResponseEntity.ok().body(applicationsRepository.save(application));
                })
                .orElseGet(() -> ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build());
    }

    public ResponseEntity<?> deleteApplication(Long id) {
        return applicationsRepository
                .findByIdAndProjectOrganizationUsersId(id, UserdataUtil.getCurrentUserId())
                .map(app -> {
                    // remove application record
                    applicationsRepository.delete(app);

                    // purge telemetry directly from MongoDB
                    try {
                        return ResponseEntity.ok().body(Collections.singletonMap("deleted", telemetryPurger.purgeTelemetry(id)));
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Collections.singletonMap("warning", "application deleted, but failed to purge telemetry: " + e.getMessage()));
                    }
                })
                .orElseGet(() -> ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build());
    }

    public ResponseEntity<?> enqueueDeleteJob(Long id) {
        return applicationsRepository
                .findByIdAndProjectOrganizationUsersId(id, UserdataUtil.getCurrentUserId())
                .map(app -> {
                    DeleteJob job = deleteJobService.create(id);
                    return ResponseEntity.accepted().body(java.util.Map.of("jobId", job.getId()));
                })
                .orElseGet(() -> ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build());
    }

    public ResponseEntity<?> getDeleteJob(Long jobId) {
        return deleteJobService.find(jobId)
                .map(j -> ResponseEntity.ok().body(j))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> getApplication(Long id) {
        return applicationsRepository
                .findByIdAndProjectOrganizationUsersId(id, UserdataUtil.getCurrentUserId())
                .map(app -> ResponseEntity.ok().body(app))
                .orElseGet(() -> ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build());
    }

    public ResponseEntity<?> getApplicationsByProject(Long projectId) {
        return applicationsRepository
                .findByProjectIdAndProjectOrganizationUsersId(projectId, UserdataUtil.getCurrentUserId())
                .map(apps -> ResponseEntity.ok().body(apps))
                .orElseGet(() -> ResponseEntity.ok().body(Collections.emptyList()));
    }
}