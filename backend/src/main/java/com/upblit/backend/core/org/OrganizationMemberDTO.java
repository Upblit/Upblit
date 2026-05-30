package com.upblit.backend.core.org;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationMemberDTO {
    private Long id;
    private OrganizationRole role;
    private UserSummary user;
}
