package com.upblit.backend.ai.docs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocsDeleteDTO {
    public String docs_id;
    public String docs_name;
    public String tenant_id;
}
