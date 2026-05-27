package com.upblit.backend.core.ApiKey;

import com.upblit.backend.core.ApplicationsRepository;
import com.upblit.backend.security.UserdataUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class ApiKeyGenerator {

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder encoder =
            Base64.getUrlEncoder().withoutPadding();

    @Autowired
    private ApplicationsRepository applicationsRepository;

    @Autowired
    private ApiClientRepository apiClientRepository;

    public String generateApiKey(@RequestParam Long ApplicationId) {
        return applicationsRepository
                .findByIdAndProjectOrganizationUsersId(ApplicationId, UserdataUtil.getCurrentUserId())
                .map(application -> {
                    String apiToken = generate();

                    ApiClient apiClient = new ApiClient();
                    apiClient.setApiKey(apiToken);
                    apiClient.setApplicationId(ApplicationId);
                    apiClient.setProjectId(application.getProject().getId());

                    apiClientRepository.save(apiClient);

                    return "upblit_" + apiToken;
                })
                .orElse(null);
    }
    public static String generate() {
        byte[] bytes = new byte[32]; // 256-bit entropy
        secureRandom.nextBytes(bytes);

        return encoder.encodeToString(bytes);
    }
}
