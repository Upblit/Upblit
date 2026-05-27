package com.upblit.backend.ai.docs;

import com.upblit.backend.Library.SupabaseService;
import com.upblit.backend.ai.Doc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/ai/docs")
public class DocsController {
    @Autowired
    private DocsService docsService;

    @Autowired
    private DocsSender docsSender;
    @Autowired
    private SupabaseService supabaseService;


    @PostMapping
    public ResponseEntity<?> createDoc(@RequestParam("TenantId") Long TenantId,
                                    @RequestParam("file") MultipartFile file) throws Exception {
        Doc doc = docsService.create(TenantId,file);
        if(doc == null) return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build();
        DocsUploadDTO docsUploadDTO = new DocsUploadDTO();
        docsUploadDTO.setFile_name(doc.getFilename());
        docsUploadDTO.setSupabase_url(doc.getUrl());
        docsUploadDTO.setTenant_id(doc.getTenant().getId().toString());
        return ResponseEntity.ok().body(docsSender.docs_send(docsUploadDTO));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteDoc(@RequestParam Long docs_id) throws Exception {
        Doc doc=docsService.delete(docs_id);
        if(doc == null) return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.FORBIDDEN)).build();
        DocsDeleteDTO docsDeleteDTO = new DocsDeleteDTO();
        docsDeleteDTO.setDocs_id(docs_id.toString());
        docsDeleteDTO.setTenant_id(doc.getTenant().getId().toString());
        docsDeleteDTO.setDocs_name(doc.getFilename());
        supabaseService.deleteFile(doc.getUrl());
        return docsSender.docs_delete(docsDeleteDTO);
    }


}
