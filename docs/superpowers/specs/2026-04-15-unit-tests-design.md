# Unit Test Suite Design — Backend & Frontend

**Date:** 2026-04-15  
**Branch:** Congnitive_tests  
**Scope:** All 5 backend microservices + 2 Angular services

---

## Goal

Add tests under standard Maven conventions (backend) and Vitest (frontend) to verify that all REST endpoints behave correctly — correct HTTP status codes, response shapes, and error paths.

---

## Approach

**Option 1 (chosen): Layered — unit + slice + integration**

Each backend service gets three test concerns:
1. **Mockito unit tests** — test service/business logic in isolation, no HTTP, no DB
2. **`@WebMvcTest` slice tests** — test each controller's HTTP behavior with mocked dependencies (MockMvc + Mockito `@MockBean`)
3. **`@SpringBootTest` integration smoke test** — boots the full context with H2 in-memory, performs one round-trip to confirm JPA wiring

Frontend services get `HttpClientTestingModule` + `HttpTestingController` specs that intercept and assert HTTP calls without real network.

---

## Backend Test Structure

Files live at `Backend/<service>/src/test/java/com/alzheimer/<service>/`.

### user-service (port 8082)

```
UserServiceTest.java          # Mockito — unit tests for UserService business logic
UserControllerTest.java       # @WebMvcTest — all /api/users endpoints
UserIntegrationTest.java      # @SpringBootTest + H2 — persistence round-trip
```

**Endpoints covered by `UserControllerTest`:**

| Method | Path | Status codes verified |
|--------|------|-----------------------|
| POST | `/api/users` | 200 (created user JSON) |
| GET | `/api/users` | 200 (list) |
| GET | `/api/users/{id}` | 200, 404 (Optional empty) |
| GET | `/api/users/email/{email}` | 200 |
| GET | `/api/users/active` | 200 |
| GET | `/api/users/count` | 200 (long) |
| GET | `/api/users/active/count` | 200 (long) |
| GET | `/api/users/role/{role}/count` | 200 (long) |
| GET | `/api/users/role/{role}` | 200 (list) |
| PUT | `/api/users/{id}` | 200 (updated JSON) |
| DELETE | `/api/users/{id}` | 200 |

**Note:** user-service uses H2 by default (dev profile), so integration tests need no extra datasource config.

---

### mmse-service (port 8085)

```
MMSEControllerTest.java       # @WebMvcTest — all /api/mmse endpoints
MMSEIntegrationTest.java      # @SpringBootTest + H2 test profile
```

**Endpoints covered by `MMSEControllerTest`:**

| Method | Path | Status codes verified |
|--------|------|-----------------------|
| POST | `/api/mmse/submit` | 200 (success=true, saved entity), 500 on bad date |
| GET | `/api/mmse/results` | 200 (success=true, list) |
| GET | `/api/mmse/count` | 200 (success=true, long) |
| GET | `/api/mmse/count/raw` | 200 (raw long) |
| GET | `/api/mmse/results/{patientName}` | 200 (found), 404 (not found) |

**Note:** mmse-service uses MySQL in production. Integration test uses `application-test.properties` switching to H2. Needs `h2` added to `pom.xml` in `test` scope.

---

### medical-service (port 8083)

```
MedicalRecordControllerTest.java    # @WebMvcTest — all /api/medical-records endpoints
MedicalRecordIntegrationTest.java   # @SpringBootTest + H2 test profile
```

**Endpoints covered by `MedicalRecordControllerTest`:**

| Method | Path | Status codes verified |
|--------|------|-----------------------|
| GET | `/api/medical-records` | 200 (list) |
| GET | `/api/medical-records/{id}` | 200 (found), 404 (not found) |
| GET | `/api/medical-records/user/{userId}` | 200 (list) |
| GET | `/api/medical-records/user/{userId}/latest` | 200, 404 |
| POST | `/api/medical-records` | 201 (created), 404 (user not found) |
| PUT | `/api/medical-records/{id}` | 200 (updated), 404 |
| DELETE | `/api/medical-records/{id}` | 200, 404 |
| GET | `/api/medical-records/stats` | 200 (map with counts) |

**Note:** `MedicalRecordController` uses a hardcoded `RestClient` to call user-service for user validation. In `@WebMvcTest`, the `RestClient` call inside `userExists()` must be stubbed. The implementation plan will inject `RestClient` as a `@Bean` so `@MockBean` can override it cleanly.

---

### cnn-service (port 8084)

```
CNNPredictionControllerTest.java    # @WebMvcTest — all /api/cnn endpoints
CNNIntegrationTest.java             # @SpringBootTest — context loads, no DB needed
```

**Endpoints covered:**

| Method | Path | Status codes verified |
|--------|------|-----------------------|
| POST | `/api/cnn/predict` | 200 (prediction result), 400 (empty file), 400 (invalid type), 400 (file too large) |
| GET | `/api/cnn/health` | 200 (status UP) |

**Note:** CNN service has no DB dependency — all logic is in-memory. Integration test just verifies context loads and health endpoint returns 200.

---

### admin-service (port 8091)

```
AdminDashboardControllerTest.java   # @WebMvcTest — all /api/admin endpoints
AdminIntegrationTest.java           # @SpringBootTest — context loads, downstream services mocked
```

**Endpoints covered by `AdminDashboardControllerTest`:**

| Method | Path | Status codes verified |
|--------|------|-----------------------|
| GET | `/api/admin/health` | 200 |
| GET | `/api/admin/users-count` | 200, 500 (downstream error) |
| GET | `/api/admin/mmse-tests-count` | 200, 500 |
| GET | `/api/admin/dashboard` | 200 |
| GET | `/api/admin/super-dashboard` | 200 (delegates to dashboard) |
| GET | `/api/admin/stats` | 200 |
| GET | `/api/admin/users-with-mmse` | 200 (enriched list) |
| GET | `/api/admin/mmse-tests` | 200 (sorted list) |
| GET | `/api/admin/medical-records` | 200 |
| PUT | `/api/admin/medical-records/{id}` | 200 |
| DELETE | `/api/admin/medical-records/{id}` | 200 |
| GET | `/api/admin/search?query=...` | 200, 400 (empty query) |
| GET | `/api/admin/filter` | 200 |
| GET | `/api/admin/export/users` | 200 |
| GET | `/api/admin/export/mmse` | 200 |
| GET | `/api/admin/activity-log` | 200 |
| POST | `/api/admin/backup` | 200 |

**Note:** AdminDashboardController hardcodes three `RestClient` instances. Implementation plan will refactor to inject them as `@Bean`s so `@MockBean` works in `@WebMvcTest`. The downstream fetch methods (`fetchUsers`, `fetchMmseTests`, `fetchMedicalRecords`) return empty lists on failure, so tests will stub clients to return controlled data.

---

## Backend Dependencies to Add

Each MySQL-backed service (`mmse-service`, `medical-service`, `admin-service`) needs in its `pom.xml`:

```xml
<!-- test scope only -->
<dependency>
  <groupId>com.h2database</groupId>
  <artifactId>h2</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
```

Each service also needs `src/test/resources/application-test.properties`:

```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
eureka.client.enabled=false
```

---

## Frontend Test Structure

Tests live next to the services they test (Angular convention). Vitest is already configured.

```
frontend/src/app/services/
  ├── prediction.service.spec.ts
  └── admin.service.spec.ts
```

### `prediction.service.spec.ts`

Verifies:
- `predict(file)` sends a POST to `http://localhost:8000/predict`
- Request body is a `FormData` with the file appended under key `"file"`
- Response is passed through as-is

### `admin.service.spec.ts`

Verifies all 12 methods:

| Method | URL asserted | Extra assertions |
|--------|-------------|-----------------|
| `getSuperDashboard()` | GET `/api/admin/super-dashboard` | unwraps `response.data` |
| `getDashboard()` | GET `/api/admin/users-with-mmse` | unwraps `response.data` |
| `getStats()` | GET `/api/admin/stats` | unwraps `response.data` |
| `getMedicalRecords()` | GET `/api/admin/medical-records` | unwraps `response.data` |
| `updateMedicalRecord(id, body)` | PUT `/api/admin/medical-records/1` | sends correct body, unwraps `response.data` |
| `deleteMedicalRecord(id)` | DELETE `/api/admin/medical-records/1` | — |
| `searchUsers(query)` | GET `/api/admin/search?query=test` | query param present |
| `filterUsers(role, active)` | GET `/api/admin/filter?role=...&active=...` | params optional |
| `exportUsers()` | GET `/api/admin/export/users` | — |
| `exportMMSE()` | GET `/api/admin/export/mmse` | — |
| `getMMSETests()` | GET `/api/admin/mmse-tests` → fallback GET `http://localhost:8085/api/mmse/results` | fallback fires on 404 |
| `getActivityLog(limit)` | GET `/api/admin/activity-log?limit=50` | default limit 50 |
| `deleteUser(id)` | DELETE `http://localhost:8082/api/users/1` | different base URL |
| `backupDatabase()` | POST `/api/admin/backup` | — |
| `submitMMSETest(data)` | POST `http://localhost:8085/api/mmse/submit` | sends test body |

---

## Test Run Commands

```bash
# Backend — all services
cd Backend && ./mvnw test

# Backend — single service
cd Backend && ./mvnw -pl user-service test

# Frontend
cd frontend && ng test
```

---

## Out of Scope

- E2E tests (Cypress/Playwright)
- CNN model accuracy tests (Python/pytest)
- Performance/load tests
- Authentication/authorization (not yet implemented)
