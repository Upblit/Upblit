package com.upblit.backend.ai.docs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocsUploadDTO {
    private String tenant_id;
    private String file_name;
    private String supabase_url;
}
