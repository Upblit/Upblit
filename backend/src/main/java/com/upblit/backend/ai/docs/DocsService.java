package com.upblit.backend.ai.docs;

import com.upblit.backend.Library.SupabaseService;
import com.upblit.backend.ai.Doc;
import com.upblit.backend.ai.DocRepository;
import com.upblit.backend.ai.Tenant;
import com.upblit.backend.ai.TenantRepository;
import com.upblit.backend.security.UserdataUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@Service
public class DocsService {

    @Autowired
    private TenantRepository tenantRepository;
    @Autowired
    private SupabaseService  supabaseService;
    @Autowired
    private DocRepository docRepository;

    public Doc create(Long TenantId, MultipartFile file) throws Exception {
        Tenant tenant = tenantRepository.findByIdAndOrganizationUsersId(TenantId, UserdataUtil.getCurrentUserId()).orElse(null);
        if (tenant == null) {
            return null;
        }
        String FileUrl = supabaseService.uploadFile(file, "Docs");
        Doc doc = new Doc();
        doc.setUrl(FileUrl);
        doc.setFilename(file.getOriginalFilename());
        doc.setTenant(tenant);
        doc.setStatus("not started");
        doc.setCreated_at(Instant.now());
        doc.setUpdated_at(Instant.now());
        return  docRepository.save(doc);
    }


    public Doc delete(Long docsId) {
        Doc doc = docRepository.findById(docsId).orElse(null);
        if (doc == null){
            System.out.println("docs not found");
            return null;
        }
        Tenant tenant = tenantRepository.findByIdAndOrganizationUsersId(doc.getTenant().getId(), UserdataUtil.getCurrentUserId()).orElse(null);
        if (tenant == null) return null;
        docRepository.delete(doc);
        return doc;
    }
}
