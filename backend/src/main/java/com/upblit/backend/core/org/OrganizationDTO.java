package com.upblit.backend.core.org;

import com.upblit.backend.core.Plan;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationDTO {
    private String name;
    @Enumerated(EnumType.STRING)
    private Plan plan;
}
