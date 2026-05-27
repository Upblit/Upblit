# Backend Conventions

> Observed patterns and prescribed standards for the Spring Boot backend.

---

## Module Structure

The backend uses **Spring Modulith** to enforce module boundaries. Each top-level package is a module:

```
com.upblit.backend
├── ai/          — AI Gateway (Tenants, Docs)
├── config/      — Cross-cutting config
├── core/        — Domain entities (Users, Orgs, Projects, Apps, API Keys)
├── email/       — Email dispatch
├── Library/     — External integrations (Supabase)
├── query/       — Telemetry read path (Traces, Logs, Metrics)
├── security/    — Auth (JWT, OAuth2, Refresh Tokens)
└── test/        — Test utilities
```

---

## Layer Conventions

### Controller Layer
- Annotation: `@RestController` + `@RequestMapping`
- Return type: `ResponseEntity<T>` for all endpoints
- Naming: `<Entity>Controller.java` — exception: `orgcontroller.java` (existing, do not rename)
- Responsibility: HTTP mapping only — no business logic in controllers
- Inject service via constructor injection (not field injection)

### Service Layer
- Annotation: `@Service`
- Naming: `<Entity>Service.java`
- Responsibility: Business logic, orchestration, transaction management
- Use `Optional<T>` from repositories — never return `null`
- Throw domain exceptions (not HTTP exceptions) — let `GlobalExceptionHandler` map them

### Repository Layer
- Extends `JpaRepository<Entity, Long>` for PostgreSQL entities
- Extends `MongoRepository<Entity, String>` for MongoDB documents
- Naming: `<Entity>Repository.java`
- Custom queries: use `@Query` annotation with JPQL or MongoDB query expressions

### DTO Layer
- Naming: `<Entity>DTO.java`
- Used for: request bodies, response bodies, inter-module communication
- Never expose JPA entities directly in API responses

---

## API Endpoint Conventions

### Current Endpoints (from design.md analysis)

| Method | Path | Description |
|---|---|---|
| `GET` | `/org` | List organizations for authenticated user |
| `POST` | `/org?name=&description=` | Create organization (multipart logo) |
| `PUT` | `/org/{id}` | Update organization (multipart logo optional) |
| `GET` | `/project?OrganizationId={id}` | List projects for an org |
| `POST` | `/project?OrganizationId={id}` | Create project (JSON string body) |
| `PUT` | `/project/{projectId}?OrganizationId={id}` | Update project |
| `GET` | `/applications?projectId={id}` | List applications for a project |
| `POST` | `/applications` | Create application (JSON body) |
| `PUT` | `/applications/{id}` | Update application |
| `POST` | `/apikey?ApplicationId={id}` | Generate API key for application |
| `GET` | `/User?username={username}` | Get user by username |
| `PUT` | `/User` | Update current user profile |
| `GET` | `/logs/project?id={projectId}` | Get telemetry traces for project |
| `GET` | `/ingest/logs` | Get all log entries |
| `POST` | `/ingest/traces` | Ingest trace batch (SDK) |
| `POST` | `/ingest/logs` | Ingest log batch (SDK) |
| `POST` | `/ai/tenant` | Create AI tenant |
| `POST` | `/ai/docs?TenantId={id}` | Upload AI document |
| `GET` | `/oauth2/authorization/github` | GitHub OAuth2 redirect |

### Inconsistencies to Note
- Some endpoints use query params for IDs (`?OrganizationId=`, `?projectId=`) instead of path params (`/{id}`) — this is the existing pattern, do not change without updating the frontend
- `POST /project` sends a JSON string body (not an object) — unusual, do not change without updating the frontend
- `GET /User` uses capital U — do not change without updating the frontend

---

## Security Configuration

- `SecurityConfig.java` configures Spring Security
- JWT filter: `JWTAuthenticationFilter` runs on every request
- OAuth2: GitHub only, via `CustomOAuth2UserService` and `OAuth2SuccessHandler`
- All `/dashboard/*` frontend routes are protected by the JWT guard
- Ingest endpoints (`/ingest/*`) are authenticated via `x-api-key` header (API key, not JWT)

---

## Database Access Patterns

### PostgreSQL (JPA)
```java
// Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByUsersContaining(User user);
}

// Service
public Organization getById(Long id) {
    return organizationRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Organization not found: " + id));
}
```

### MongoDB (Spring Data)
```java
// Repository
public interface TraceRepository extends MongoRepository<Trace, String> {
    List<Trace> findByProjectId(Long projectId);
}
```

---

## Error Handling

- `GlobalExceptionHandler` in `config/` handles all uncaught exceptions
- Return structured error responses — never raw stack traces
- Use `@ResponseStatus` or `ResponseEntity` with appropriate HTTP status codes
- Log errors at `ERROR` level with entity context

---

## Lombok Usage

```java
@Data                    // getters, setters, equals, hashCode, toString
@Builder                 // builder pattern
@NoArgsConstructor       // required by JPA
@AllArgsConstructor      // for builder
@RequiredArgsConstructor // for constructor injection
```

---

## WebSocket

The backend has `spring-boot-starter-websocket` as a dependency. WebSocket infrastructure exists but is not yet wired to any observable feature (e.g., real-time log streaming). Do not remove the dependency.

---

## External HTTP Calls

Use `WebClient` (reactive) for all outbound HTTP calls:
```java
// Correct
webClient.post()
    .uri(emailUri)
    .bodyValue(emailDTO)
    .retrieve()
    .bodyToMono(String.class)
    .block();

// Avoid (legacy)
restTemplate.postForObject(url, request, String.class);
```

`RestTemplateConfig` exists for legacy compatibility — do not add new `RestTemplate` usages.

---

## File Upload Handling

- Max file size: 10MB (configured in `application.properties`)
- Files are processed by `LogoImageProcessor` (org logos) and `DocsSender` (AI docs)
- Files are stored in Supabase via `SupabaseService` — not on local disk
- Multipart requests: use `@RequestParam MultipartFile file` in controllers
