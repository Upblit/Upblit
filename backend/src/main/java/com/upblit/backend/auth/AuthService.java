package com.upblit.backend.auth;

import com.upblit.backend.core.Plan;
import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import com.upblit.backend.email.EmailDTO;
import com.upblit.backend.email.EmailService;
import com.upblit.backend.security.JWT.JWTService;
import com.upblit.backend.security.RefreshToken.RefreshService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class AuthService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();
    private static final String PROVIDER_EMAIL = "EMAIL";
    private static final String PROVIDER_GITHUB = "GITHUB";
    private static final String PROVIDER_GOOGLE = "GOOGLE";
    private static final String PROVIDER_CONFLICT_MESSAGE = "Account already registered, use the correct provider";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final RefreshService refreshService;
    private final EmailService emailService;

    @Value("${frontend.uri}")
    private String frontendUrl;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JWTService jwtService,
            RefreshService refreshService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshService = refreshService;
        this.emailService = emailService;
    }

    public AuthResponse register(AuthRegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            if (!PROVIDER_EMAIL.equalsIgnoreCase(user.getAuthProvider())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, PROVIDER_CONFLICT_MESSAGE);
            }

            throw new ResponseStatusException(HttpStatus.CONFLICT, PROVIDER_CONFLICT_MESSAGE);
        }

        user = new User();
        user.setAuthProvider(PROVIDER_EMAIL);
        user.setEmail(email);
        user.setUsername(resolveUsername(request.getName(), email));
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setPlan(user.getPlan() == null ? Plan.PIRATES.name() : user.getPlan());
        user.setEmailVerified(false);
        user.setEmailVerificationToken(generateToken());
        user.setEmailVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        user.setLastLogin(Instant.now());

        User saved = userRepository.save(user);
        sendVerificationEmail(saved);

        return new AuthResponse(null, null, true, "Verification email sent", saved.getId(), saved.getUsername(), saved.getEmail());
    }

    public AuthResponse login(AuthLoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();

        if (email == null || password == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!PROVIDER_EMAIL.equalsIgnoreCase(user.getAuthProvider())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, PROVIDER_CONFLICT_MESSAGE);
        }

        if (!user.isEmailVerified()) {
            sendVerificationEmail(user);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email before signing in");
        }

        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);

        return issueTokens(user, "Signed in successfully");
    }

    public AuthResponse verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token is required");
        }

        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token"));

        if (user.getEmailVerificationTokenExpiresAt() != null && user.getEmailVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiresAt(null);
        user.setLastLogin(Instant.now());
        userRepository.save(user);

        return issueTokens(user, "Email verified successfully");
    }

    private AuthResponse issueTokens(User user, String message) {
        String refresh = refreshService.createRefreshToken(user.getId());
        String jwt = jwtService.generateToken(
                String.valueOf(user.getId()),
                user.getAvatarUrl(),
                user.getUsername(),
                user.getEmail(),
                user.getPlan()
        );

        return new AuthResponse(jwt, refresh, false, message, user.getId(), user.getUsername(), user.getEmail());
    }

    private void sendVerificationEmail(User user) {
        String token = user.getEmailVerificationToken();
        if (token == null) {
            token = generateToken();
            user.setEmailVerificationToken(token);
            user.setEmailVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
            userRepository.save(user);
        }

        String verificationLink = frontendUrl + "/verify-email?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setTemplate("verification");
        emailDTO.setEmail(user.getEmail());
        emailDTO.setName(user.getUsername());
        emailDTO.setVerificationLink(verificationLink);
        emailService.sendEmail(emailDTO);
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return BASE64_URL.encodeToString(bytes);
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private static String resolveUsername(String name, String email) {
        if (name != null && !name.isBlank()) {
            return name.trim();
        }

        return email;
    }
}