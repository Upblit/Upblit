package com.upblit.backend.uptime.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMonitorRequest {
    @NotBlank
    private String url;

    @NotNull
    private Long projectId;

    private Long applicationId;

    private Long organizationId;
    
    // optional: set monitor active or inactive
    private Boolean active;
}