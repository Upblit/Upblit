package com.upblit.backend.security.OAuth;

import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import com.upblit.backend.core.Plan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private static final String PROVIDER_CONFLICT_MESSAGE = "Account already registered, use the correct provider";
    private static final String GITHUB_EMAILS_ENDPOINT = "https://api.github.com/user/emails";

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = new DefaultOAuth2UserService().loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = user.getAttributes();

        String providerId = getProviderId(registrationId, attributes);
        String username = getUsername(registrationId, attributes);
        String email = getEmail(registrationId, userRequest, attributes);
        String avatarUrl = getAvatarUrl(registrationId, attributes);

        User existing = findExistingUser(registrationId, providerId, email);
        if (existing == null) {
            existing = new User();
            existing.setPlan(Plan.PIRATES.name());
            existing.setAuthProvider(registrationId.toUpperCase());
        } else if (existing.getAuthProvider() != null && !existing.getAuthProvider().equalsIgnoreCase(registrationId)) {
            throw new OAuth2AuthenticationException(new OAuth2Error("provider_mismatch"), PROVIDER_CONFLICT_MESSAGE);
        }

        existing.setAuthProvider(registrationId.toUpperCase());
        existing.setUsername(username);
        if (email != null && !email.isBlank()) {
            existing.setEmail(email);
        }
        existing.setAvatarUrl(avatarUrl);
        existing.setEmailVerified(true);
        existing.setEmailVerificationToken(null);
        existing.setEmailVerificationTokenExpiresAt(null);
        existing.setPasswordHash(existing.getPasswordHash());

        if ("google".equalsIgnoreCase(registrationId)) {
            existing.setGoogleId(providerId);
        } else {
            existing.setGithubId(providerId);
        }

        existing.setLastLogin(Instant.now());

        User userdetails = userRepository.save(existing);

        return new CustomOAuth2User(user,userdetails);
    }

    private User findExistingUser(String registrationId, String providerId, String email) {
        if ("google".equalsIgnoreCase(registrationId)) {
            User byGoogle = userRepository.findByGoogleId(providerId).orElse(null);
            if (byGoogle != null) return byGoogle;
        } else {
            User byGithub = userRepository.findByGithubId(providerId).orElse(null);
            if (byGithub != null) return byGithub;
        }

        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email).orElse(null);
        }

        return null;
    }

    private String getProviderId(String registrationId, Map<String, Object> attributes) {
        Object value = "google".equalsIgnoreCase(registrationId) ? attributes.get("sub") : attributes.get("id");
        return value != null ? value.toString() : null;
    }

    private String getUsername(String registrationId, Map<String, Object> attributes) {
        Object value = "google".equalsIgnoreCase(registrationId) ? attributes.get("name") : attributes.get("login");
        return value != null ? value.toString() : null;
    }

    private String getEmail(String registrationId, OAuth2UserRequest userRequest, Map<String, Object> attributes) {
        Object value = attributes.get("email");
        if (value != null) {
            return value.toString();
        }

        if ("github".equalsIgnoreCase(registrationId)) {
            return fetchGithubPrimaryEmail(userRequest);
        }

        return null;
    }

    private String fetchGithubPrimaryEmail(OAuth2UserRequest userRequest) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(userRequest.getAccessToken().getTokenValue());
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            List<?> emailRecords = new RestTemplate().exchange(
                    GITHUB_EMAILS_ENDPOINT,
                    HttpMethod.GET,
                    entity,
                    List.class
            ).getBody();

            if (emailRecords == null) {
                return null;
            }

            for (Object item : emailRecords) {
                if (!(item instanceof Map<?, ?> emailRecord)) {
                    continue;
                }

                Object primary = emailRecord.get("primary");
                Object verified = emailRecord.get("verified");
                Object email = emailRecord.get("email");
                if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified) && email != null) {
                    return email.toString();
                }
            }

            for (Object item : emailRecords) {
                if (item instanceof Map<?, ?> emailRecord) {
                    Object email = emailRecord.get("email");
                    if (email != null) {
                        return email.toString();
                    }
                }
            }
        } catch (Exception ignored) {
            // Fall back to null when the email endpoint is unavailable or the scope is missing.
        }

        return null;
    }

    private String getAvatarUrl(String registrationId, Map<String, Object> attributes) {
        Object value = "google".equalsIgnoreCase(registrationId) ? attributes.get("picture") : attributes.get("avatar_url");
        return value != null ? value.toString() : null;
    }
}

