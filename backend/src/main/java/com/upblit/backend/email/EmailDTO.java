package com.upblit.backend.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailDTO {
    private String template;
    private String name;
    private String email;
    private String inviteLink;
    private String verificationLink;
    private String organizationName;
}
