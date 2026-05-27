package com.upblit.backend.core.project;

import com.upblit.backend.core.*;
import com.upblit.backend.security.UserdataUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
@Transactional
public class ProjectService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ApplicationsRepository applicationsRepository;
    @Autowired
    private com.upblit.backend.core.application.TelemetryPurger telemetryPurger;

    public ResponseEntity<?> createProject(@RequestBody ProjectDTO projectDTO) {
        if (!accessChecker(projectDTO.getOrganizationId())) {
            return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build();
        }

        Organization org = organizationRepository.findById(projectDTO.getOrganizationId()).orElse(null);
        if (org == null) {
            return ResponseEntity.notFound().build();
        }

        // --- Quota check ---
        PlanLimits limits = PlanLimits.of(org.getPlan() != null ? org.getPlan() : Plan.PIRATES);
        List<Project> existing = projectRepository.findByOrganizationId(org.getId());
        if (existing.size() >= limits.maxProjectsPerOrg) {
            throw new QuotaExceededException(
                "projects",
                existing.size(),
                limits.maxProjectsPerOrg,
                org.getPlan() != null ? org.getPlan() : Plan.PIRATES
            );
        }

        System.out.println("projectName:" + projectDTO.getName());
        Project project = new Project();
        project.setName(projectDTO.getName());
        project.setProjectLocation(projectDTO.getProjectLocation());
        project.setCloudProviderName(projectDTO.getCloudProviderName());
        project.setOrganization(org);
        return ResponseEntity.ok(projectRepository.save(project));
    }

    public ResponseEntity<?> updateProject(Long projectId, Long organizationId, ProjectDTO projectDTO) {
        if (!accessChecker(organizationId)) {
            return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build();
        }

        Project project = projectRepository.findByIdAndOrganizationId(projectId, organizationId).orElse(null);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        if (projectDTO.getName() != null) {
            project.setName(projectDTO.getName());
        }

        if (projectDTO.getProjectLocation() != null) {
            project.setProjectLocation(projectDTO.getProjectLocation());
        }

        if (projectDTO.getCloudProviderName() != null) {
            project.setCloudProviderName(projectDTO.getCloudProviderName());
        }

        return ResponseEntity.ok(projectRepository.save(project));
    }

    public ResponseEntity<?> getProject(@RequestBody Long projectId, Long OrganizationId) {
        if (accessChecker(OrganizationId)) {
            System.out.println("projectName:" + projectId);
            Project project = projectRepository.findByIdAndOrganizationId(projectId, OrganizationId).orElse(null);
            if (project != null) {
                return ResponseEntity.ok(project);
            }
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build();
    }

    public ResponseEntity<?> getAllProjects(Long OrganizationId) {
        if (accessChecker(OrganizationId)) return ResponseEntity.ok(projectRepository.findByOrganizationId(OrganizationId));
        return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build();
    }

    public ResponseEntity<?> deleteProject(Long projectId, Long organizationId) {
        if (!accessChecker(organizationId)) {
            return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build();
        }

        Project project = projectRepository.findByIdAndOrganizationId(projectId, organizationId).orElse(null);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        List<Application> applications = applicationsRepository.findByProjectId(projectId).orElse(List.of());
        for (Application application : applications) {
            telemetryPurger.purgeTelemetry(application.getId());
            applicationsRepository.delete(application);
        }

        projectRepository.delete(project);
        return ResponseEntity.ok().body(java.util.Map.of(
                "projectId", projectId,
                "applicationsDeleted", applications.size()
        ));
    }

    public boolean accessChecker(Long OrganizationId) {
        return organizationRepository.findByIdAndUsersId(OrganizationId, UserdataUtil.getCurrentUserId()).isPresent();
    }
}
