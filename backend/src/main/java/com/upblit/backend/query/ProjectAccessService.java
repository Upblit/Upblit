package com.upblit.backend.query;

import com.upblit.backend.core.ProjectRepository;
import com.upblit.backend.security.UserdataUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProjectAccessService {

    private final ProjectRepository projectRepository;

    public void validateProjectAccess(Long projectId) {
        Long currentUserId = UserdataUtil.getCurrentUserId();
        boolean hasAccess = projectRepository.existsByIdAndOrganizationUsersId(projectId, currentUserId);
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this project");
        }
    }
}
