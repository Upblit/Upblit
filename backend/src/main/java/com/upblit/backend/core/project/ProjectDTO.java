package com.upblit.backend.core.project;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ProjectDTO {
    private String name;

    private String projectLocation;
    private String cloudProviderName;

    private Long organizationId;
}
