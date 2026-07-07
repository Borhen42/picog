# Unit Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add layered unit tests (Mockito + @WebMvcTest + @SpringBootTest/H2) for all 5 backend microservices and Vitest HTTP-mock tests for 2 Angular services.

**Architecture:** Each backend service gets a Mockito unit test for service logic, a @WebMvcTest slice test per controller verifying HTTP status codes and JSON shapes, and one @SpringBootTest integration smoke test with H2. Frontend services get HttpClientTestingModule specs asserting URLs, methods, and payloads.

**Tech Stack:** JUnit 5, Mockito, Spring MockMvc, H2, @MockitoBean (Spring Boot 3.5), Angular TestBed, HttpClientTestingModule, Vitest

---

## File Map

**Create:**
- `Backend/user-service/src/test/resources/application.properties`
- `Backend/user-service/src/test/java/com/alzheimer/user/UserServiceTest.java`
- `Backend/user-service/src/test/java/com/alzheimer/user/UserControllerTest.java`
- `Backend/user-service/src/test/java/com/alzheimer/user/UserIntegrationTest.java`
- `Backend/mmse-service/src/test/resources/application.properties`
- `Backend/mmse-service/src/test/java/com/alzheimer/mmse/MMSEControllerTest.java`
- `Backend/mmse-service/src/test/java/com/alzheimer/mmse/MMSEIntegrationTest.java`
- `Backend/medical-service/src/main/java/com/alzheimer/medical/MedicalServiceConfig.java`
- `Backend/medical-service/src/test/resources/application.properties`
- `Backend/medical-service/src/test/java/com/alzheimer/medical/MedicalRecordControllerTest.java`
- `Backend/medical-service/src/test/java/com/alzheimer/medical/MedicalRecordIntegrationTest.java`
- `Backend/admin-service/src/main/java/com/alzheimer/admin/AdminServiceConfig.java`
- `Backend/admin-service/src/test/resources/application.properties`
- `Backend/admin-service/src/test/java/com/alzheimer/admin/AdminDashboardControllerTest.java`
- `Backend/admin-service/src/test/java/com/alzheimer/admin/AdminIntegrationTest.java`
- `Backend/cnn-service/src/test/resources/application.properties`
- `Backend/cnn-service/src/test/java/com/alzheimer/cnn/CNNPredictionControllerTest.java`
- `Backend/cnn-service/src/test/java/com/alzheimer/cnn/CNNIntegrationTest.java`
- `frontend/src/app/services/prediction.service.spec.ts`
- `frontend/src/app/services/admin.service.spec.ts`

**Modify:**
- `Backend/user-service/pom.xml` — add spring-boot-starter-test
- `Backend/mmse-service/pom.xml` — add spring-boot-starter-test
- `Backend/medical-service/pom.xml` — add spring-boot-starter-test
- `Backend/admin-service/pom.xml` — add spring-boot-starter-test
- `Backend/cnn-service/pom.xml` — add spring-boot-starter-test
- `Backend/medical-service/src/main/java/com/alzheimer/medical/MedicalRecordController.java` — inject RestClient via constructor
- `Backend/admin-service/src/main/java/com/alzheimer/admin/AdminDashboardController.java` — inject 3 RestClients via constructor

---

## Task 1: Add spring-boot-starter-test to all poms + test application.properties

**Files:**
- Modify: `Backend/user-service/pom.xml`
- Modify: `Backend/mmse-service/pom.xml`
- Modify: `Backend/medical-service/pom.xml`
- Modify: `Backend/admin-service/pom.xml`
- Modify: `Backend/cnn-service/pom.xml`
- Create: `Backend/user-service/src/test/resources/application.properties`
- Create: `Backend/mmse-service/src/test/resources/application.properties`
- Create: `Backend/medical-service/src/test/resources/application.properties`
- Create: `Backend/admin-service/src/test/resources/application.properties`
- Create: `Backend/cnn-service/src/test/resources/application.properties`

- [ ] **Add spring-boot-starter-test to all five poms**

In each of `user-service/pom.xml`, `mmse-service/pom.xml`, `medical-service/pom.xml`, `admin-service/pom.xml`, `cnn-service/pom.xml` — add inside `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

- [ ] **Create test application.properties for user-service**

`Backend/user-service/src/test/resources/application.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.defer-datasource-initialization=true
eureka.client.enabled=false
eureka.client.register-with-eureka=false
spring.cloud.discovery.enabled=false
```

- [ ] **Create test application.properties for mmse-service**

`Backend/mmse-service/src/test/resources/application.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.defer-datasource-initialization=true
eureka.client.enabled=false
eureka.client.register-with-eureka=false
spring.cloud.discovery.enabled=false
```

- [ ] **Create test application.properties for medical-service**

`Backend/medical-service/src/test/resources/application.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.defer-datasource-initialization=true
eureka.client.enabled=false
eureka.client.register-with-eureka=false
spring.cloud.discovery.enabled=false
```

- [ ] **Create test application.properties for admin-service**

`Backend/admin-service/src/test/resources/application.properties`:
```properties
eureka.client.enabled=false
eureka.client.register-with-eureka=false
spring.cloud.discovery.enabled=false
```

- [ ] **Create test application.properties for cnn-service**

`Backend/cnn-service/src/test/resources/application.properties`:
```properties
eureka.client.enabled=false
eureka.client.register-with-eureka=false
spring.cloud.discovery.enabled=false
```

- [ ] **Commit**
```bash
git add Backend/*/pom.xml Backend/*/src/test/resources/
git commit -m "test: add spring-boot-starter-test deps and H2 test properties for all services"
```

---

## Task 2: Refactor MedicalRecordController — inject RestClient

**Files:**
- Create: `Backend/medical-service/src/main/java/com/alzheimer/medical/MedicalServiceConfig.java`
- Modify: `Backend/medical-service/src/main/java/com/alzheimer/medical/MedicalRecordController.java:32-35`

- [ ] **Create MedicalServiceConfig.java**

```java
package com.alzheimer.medical;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MedicalServiceConfig {
    @Bean
    public RestClient userServiceClient() {
        return RestClient.builder().baseUrl("http://localhost:8082").build();
    }
}
```

- [ ] **Update MedicalRecordController constructor to accept injected RestClient**

Replace the existing constructor (lines 32–35):
```java
// BEFORE
public MedicalRecordController(MedicalRecordRepository medicalRecordRepository) {
    this.medicalRecordRepository = medicalRecordRepository;
    this.userServiceClient = RestClient.builder().baseUrl("http://localhost:8082").build();
}
```

With:
```java
// AFTER
public MedicalRecordController(MedicalRecordRepository medicalRecordRepository,
                                RestClient userServiceClient) {
    this.medicalRecordRepository = medicalRecordRepository;
    this.userServiceClient = userServiceClient;
}
```

- [ ] **Verify the app still compiles**
```bash
cd Backend && ./mvnw.cmd -pl medical-service compile -q
```
Expected: BUILD SUCCESS

- [ ] **Commit**
```bash
git add Backend/medical-service/src/main/java/com/alzheimer/medical/
git commit -m "refactor(medical): inject RestClient via constructor for testability"
```

---

## Task 3: Refactor AdminDashboardController — inject 3 RestClients

**Files:**
- Create: `Backend/admin-service/src/main/java/com/alzheimer/admin/AdminServiceConfig.java`
- Modify: `Backend/admin-service/src/main/java/com/alzheimer/admin/AdminDashboardController.java:38-42`

- [ ] **Create AdminServiceConfig.java**

```java
package com.alzheimer.admin;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AdminServiceConfig {

    @Bean
    @Qualifier("adminUserServiceClient")
    public RestClient adminUserServiceClient() {
        return RestClient.builder().baseUrl("http://localhost:8082").build();
    }

    @Bean
    @Qualifier("adminMmseServiceClient")
    public RestClient adminMmseServiceClient() {
        return RestClient.builder().baseUrl("http://localhost:8085").build();
    }

    @Bean
    @Qualifier("adminMedicalServiceClient")
    public RestClient adminMedicalServiceClient() {
        return RestClient.builder().baseUrl("http://localhost:8083").build();
    }
}
```

- [ ] **Update AdminDashboardController constructor**

Replace the existing no-arg constructor (lines 38–42):
```java
// BEFORE
public AdminDashboardController() {
    this.userServiceClient = RestClient.builder().baseUrl("http://localhost:8082").build();
    this.mmseServiceClient = RestClient.builder().baseUrl("http://localhost:8085").build();
    this.medicalServiceClient = RestClient.builder().baseUrl("http://localhost:8083").build();
}
```

With:
```java
// AFTER
public AdminDashboardController(
        @Qualifier("adminUserServiceClient") RestClient userServiceClient,
        @Qualifier("adminMmseServiceClient") RestClient mmseServiceClient,
        @Qualifier("adminMedicalServiceClient") RestClient medicalServiceClient) {
    this.userServiceClient = userServiceClient;
    this.mmseServiceClient = mmseServiceClient;
    this.medicalServiceClient = medicalServiceClient;
}
```

Also add the import at the top of AdminDashboardController.java:
```java
import org.springframework.beans.factory.annotation.Qualifier;
```

- [ ] **Verify compile**
```bash
cd Backend && ./mvnw.cmd -pl admin-service compile -q
```
Expected: BUILD SUCCESS

- [ ] **Commit**
```bash
git add Backend/admin-service/src/main/java/com/alzheimer/admin/
git commit -m "refactor(admin): inject RestClients via constructor for testability"
```

---

## Task 4: user-service — UserServiceTest (Mockito unit)

**Files:**
- Create: `Backend/user-service/src/test/java/com/alzheimer/user/UserServiceTest.java`

- [ ] **Write UserServiceTest.java**

```java
package com.alzheimer.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository repository;
    @InjectMocks UserService service;

    private User sampleUser() {
        User u = new User();
        u.setId(1L);
        u.setEmail("alice@test.com");
        u.setFirstName("Alice");
        u.setLastName("Smith");
        u.setPassword("secret");
        u.setRole(UserRole.USER);
        u.setActive(true);
        return u;
    }

    @Test
    void save_delegatesToRepository() {
        User u = sampleUser();
        when(repository.save(u)).thenReturn(u);
        assertThat(service.save(u)).isEqualTo(u);
        verify(repository).save(u);
    }

    @Test
    void findAll_returnsAllUsers() {
        when(repository.findAll()).thenReturn(List.of(sampleUser()));
        assertThat(service.findAll()).hasSize(1);
    }

    @Test
    void findById_returnsOptional() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleUser()));
        assertThat(service.findById(1L)).isPresent();
    }

    @Test
    void findByEmail_throwsWhenNotFound() {
        when(repository.findByEmail("missing@test.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findByEmail("missing@test.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void findByEmail_returnsUserWhenFound() {
        when(repository.findByEmail("alice@test.com")).thenReturn(Optional.of(sampleUser()));
        assertThat(service.findByEmail("alice@test.com").getEmail()).isEqualTo("alice@test.com");
    }

    @Test
    void findActiveUsers_passesTrue() {
        when(repository.findByActive(true)).thenReturn(List.of(sampleUser()));
        assertThat(service.findActiveUsers()).hasSize(1);
        verify(repository).findByActive(true);
    }

    @Test
    void countAllUsers_returnsCount() {
        when(repository.count()).thenReturn(42L);
        assertThat(service.countAllUsers()).isEqualTo(42L);
    }

    @Test
    void countActiveUsers_passesTrue() {
        when(repository.countByActive(true)).thenReturn(10L);
        assertThat(service.countActiveUsers()).isEqualTo(10L);
        verify(repository).countByActive(true);
    }

    @Test
    void countUsersByRole_delegatesRole() {
        when(repository.countByRole(UserRole.ADMIN)).thenReturn(3L);
        assertThat(service.countUsersByRole(UserRole.ADMIN)).isEqualTo(3L);
    }

    @Test
    void update_throwsWhenUserNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.update(99L, sampleUser()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void update_savesWithNewValues() {
        User existing = sampleUser();
        User updated = sampleUser();
        updated.setEmail("new@test.com");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);
        service.update(1L, updated);
        assertThat(existing.getEmail()).isEqualTo("new@test.com");
        verify(repository).save(existing);
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(5L);
        verify(repository).deleteById(5L);
    }
}
```

- [ ] **Run the test**
```bash
cd Backend && ./mvnw.cmd -pl user-service test -Dtest=UserServiceTest -q
```
Expected: BUILD SUCCESS, 11 tests run

- [ ] **Commit**
```bash
git add Backend/user-service/src/test/
git commit -m "test(user): add UserServiceTest Mockito unit tests"
```

---

## Task 5: user-service — UserControllerTest (@WebMvcTest)

**Files:**
- Create: `Backend/user-service/src/test/java/com/alzheimer/user/UserControllerTest.java`

- [ ] **Write UserControllerTest.java**

```java
package com.alzheimer.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean UserService service;

    private User sampleUser() {
        User u = new User();
        u.setId(1L);
        u.setEmail("alice@test.com");
        u.setFirstName("Alice");
        u.setLastName("Smith");
        u.setPassword("secret");
        u.setRole(UserRole.USER);
        u.setActive(true);
        return u;
    }

    @Test
    void createUser_returns200() throws Exception {
        User u = sampleUser();
        when(service.save(any(User.class))).thenReturn(u);
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(u)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@test.com"));
    }

    @Test
    void getAllUsers_returns200() throws Exception {
        when(service.findAll()).thenReturn(List.of(sampleUser()));
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("alice@test.com"));
    }

    @Test
    void getUserById_found_returns200() throws Exception {
        when(service.findById(1L)).thenReturn(Optional.of(sampleUser()));
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk());
    }

    @Test
    void getUserById_notFound_returns200WithEmpty() throws Exception {
        when(service.findById(99L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isOk());
    }

    @Test
    void getUserByEmail_returns200() throws Exception {
        when(service.findByEmail("alice@test.com")).thenReturn(sampleUser());
        mockMvc.perform(get("/api/users/email/alice@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@test.com"));
    }

    @Test
    void getActiveUsers_returns200() throws Exception {
        when(service.findActiveUsers()).thenReturn(List.of(sampleUser()));
        mockMvc.perform(get("/api/users/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].active").value(true));
    }

    @Test
    void getUsersCount_returns200() throws Exception {
        when(service.countAllUsers()).thenReturn(5L);
        mockMvc.perform(get("/api/users/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @Test
    void getActiveUsersCount_returns200() throws Exception {
        when(service.countActiveUsers()).thenReturn(3L);
        mockMvc.perform(get("/api/users/active/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("3"));
    }

    @Test
    void getUsersByRole_returns200() throws Exception {
        when(service.findUsersByRole(UserRole.ADMIN)).thenReturn(List.of(sampleUser()));
        mockMvc.perform(get("/api/users/role/ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    void getUsersCountByRole_returns200() throws Exception {
        when(service.countUsersByRole(UserRole.DOCTOR)).thenReturn(2L);
        mockMvc.perform(get("/api/users/role/DOCTOR/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("2"));
    }

    @Test
    void updateUser_returns200() throws Exception {
        User u = sampleUser();
        when(service.update(eq(1L), any(User.class))).thenReturn(u);
        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(u)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@test.com"));
    }

    @Test
    void deleteUser_returns200() throws Exception {
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isOk());
    }
}
```

- [ ] **Run the test**
```bash
cd Backend && ./mvnw.cmd -pl user-service test -Dtest=UserControllerTest -q
```
Expected: BUILD SUCCESS, 12 tests run

- [ ] **Commit**
```bash
git add Backend/user-service/src/test/java/com/alzheimer/user/UserControllerTest.java
git commit -m "test(user): add UserControllerTest WebMvcTest slice tests"
```

---

## Task 6: user-service — UserIntegrationTest (@SpringBootTest)

**Files:**
- Create: `Backend/user-service/src/test/java/com/alzheimer/user/UserIntegrationTest.java`

- [ ] **Write UserIntegrationTest.java**

```java
package com.alzheimer.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UserIntegrationTest {

    @Autowired UserRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private User sampleUser() {
        User u = new User();
        u.setEmail("int@test.com");
        u.setFirstName("Integration");
        u.setLastName("Test");
        u.setPassword("pass");
        u.setRole(UserRole.USER);
        u.setActive(true);
        return u;
    }

    @Test
    void save_thenFindById_roundTrip() {
        User saved = repository.save(sampleUser());
        assertThat(saved.getId()).isNotNull();
        assertThat(repository.findById(saved.getId())).isPresent();
    }

    @Test
    void findByEmail_returnsUser() {
        repository.save(sampleUser());
        assertThat(repository.findByEmail("int@test.com")).isPresent();
    }

    @Test
    void findByActive_returnsActiveUsers() {
        repository.save(sampleUser());
        assertThat(repository.findByActive(true)).hasSize(1);
    }

    @Test
    void countByRole_returnsCount() {
        repository.save(sampleUser());
        assertThat(repository.countByRole(UserRole.USER)).isEqualTo(1L);
    }

    @Test
    void deleteAll_clearsRepository() {
        repository.save(sampleUser());
        repository.deleteAll();
        assertThat(repository.findAll()).isEmpty();
    }
}
```

- [ ] **Run the test**
```bash
cd Backend && ./mvnw.cmd -pl user-service test -Dtest=UserIntegrationTest -q
```
Expected: BUILD SUCCESS, 5 tests run

- [ ] **Commit**
```bash
git add Backend/user-service/src/test/java/com/alzheimer/user/UserIntegrationTest.java
git commit -m "test(user): add UserIntegrationTest SpringBootTest with H2"
```

---

## Task 7: mmse-service — MMSEControllerTest (@WebMvcTest)

**Files:**
- Create: `Backend/mmse-service/src/test/java/com/alzheimer/mmse/MMSEControllerTest.java`

- [ ] **Write MMSEControllerTest.java**

```java
package com.alzheimer.mmse;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MMSEController.class)
class MMSEControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean MMSERepository mmseRepository;

    private MMSETest sampleTest() {
        MMSETest t = new MMSETest();
        t.setId(1L);
        t.setPatientName("Alice Smith");
        t.setOrientationScore(8);
        t.setRegistrationScore(3);
        t.setAttentionScore(4);
        t.setRecallScore(2);
        t.setLanguageScore(7);
        t.setTotalScore(24);
        t.setInterpretation("Normal cognition");
        t.setTestDate(LocalDate.of(2026, 4, 15));
        t.setNotes("All good");
        return t;
    }

    private Map<String, Object> submitPayload() {
        Map<String, Object> m = new HashMap<>();
        m.put("patient_name", "Alice Smith");
        m.put("orientation_score", 8);
        m.put("registration_score", 3);
        m.put("attention_score", 4);
        m.put("recall_score", 2);
        m.put("language_score", 7);
        m.put("total_score", 24);
        m.put("interpretation", "Normal cognition");
        m.put("test_date", "2026-04-15");
        m.put("notes", "All good");
        return m;
    }

    @Test
    void submitMMSETest_returns200() throws Exception {
        when(mmseRepository.save(any(MMSETest.class))).thenReturn(sampleTest());
        mockMvc.perform(post("/api/mmse/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submitPayload())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.patientName").value("Alice Smith"));
    }

    @Test
    void submitMMSETest_badDate_returns500() throws Exception {
        Map<String, Object> bad = new HashMap<>(submitPayload());
        bad.put("test_date", "not-a-date");
        mockMvc.perform(post("/api/mmse/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getMMSEResults_returns200() throws Exception {
        when(mmseRepository.findAll()).thenReturn(List.of(sampleTest()));
        mockMvc.perform(get("/api/mmse/results"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].patientName").value("Alice Smith"));
    }

    @Test
    void getMMSECount_returns200() throws Exception {
        when(mmseRepository.count()).thenReturn(7L);
        mockMvc.perform(get("/api/mmse/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(7));
    }

    @Test
    void getMMSECountRaw_returns200() throws Exception {
        when(mmseRepository.count()).thenReturn(7L);
        mockMvc.perform(get("/api/mmse/count/raw"))
                .andExpect(status().isOk())
                .andExpect(content().string("7"));
    }

    @Test
    void getPatientResults_found_returns200() throws Exception {
        when(mmseRepository.findByPatientNameIgnoreCase("Alice Smith"))
                .thenReturn(List.of(sampleTest()));
        mockMvc.perform(get("/api/mmse/results/Alice Smith"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getPatientResults_notFound_returns404() throws Exception {
        when(mmseRepository.findByPatientNameIgnoreCase("Unknown"))
                .thenReturn(List.of());
        mockMvc.perform(get("/api/mmse/results/Unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
```

- [ ] **Run the test**
```bash
cd Backend && ./mvnw.cmd -pl mmse-service test -Dtest=MMSEControllerTest -q
```
Expected: BUILD SUCCESS, 7 tests run

- [ ] **Commit**
```bash
git add Backend/mmse-service/src/test/
git commit -m "test(mmse): add MMSEControllerTest WebMvcTest slice tests"
```

---

## Task 8: mmse-service — MMSEIntegrationTest (@SpringBootTest)

**Files:**
- Create: `Backend/mmse-service/src/test/java/com/alzheimer/mmse/MMSEIntegrationTest.java`

- [ ] **Write MMSEIntegrationTest.java**

```java
package com.alzheimer.mmse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class MMSEIntegrationTest {

    @Autowired MMSERepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private MMSETest sampleTest() {
        MMSETest t = new MMSETest();
        t.setPatientName("Bob Jones");
        t.setOrientationScore(9);
        t.setRegistrationScore(3);
        t.setAttentionScore(5);
        t.setRecallScore(3);
        t.setLanguageScore(8);
        t.setTestDate(LocalDate.now());
        return t;
    }

    @Test
    void save_thenFindAll_roundTrip() {
        repository.save(sampleTest());
        assertThat(repository.findAll()).hasSize(1);
    }

    @Test
    void findByPatientNameIgnoreCase_found() {
        repository.save(sampleTest());
        assertThat(repository.findByPatientNameIgnoreCase("bob jones")).hasSize(1);
    }

    @Test
    void prePersist_setsInterpretation_Normal() {
        // 9+3+5+3+8 = 28 → Normal cognition
        MMSETest saved = repository.save(sampleTest());
        assertThat(saved.getInterpretation()).isEqualTo("Normal cognition");
    }

    @Test
    void prePersist_setsInterpretation_Severe() {
        MMSETest t = new MMSETest();
        t.setPatientName("Test Severe");
        t.setOrientationScore(1);
        t.setRegistrationScore(1);
        t.setAttentionScore(1);
        t.setRecallScore(1);
        t.setLanguageScore(1);
        t.setTestDate(LocalDate.now());
        MMSETest saved = repository.save(t);
        // total = 5 → Severe
        assertThat(saved.getInterpretation()).isEqualTo("Severe cognitive impairment");
    }
}
```

- [ ] **Run the test**
```bash
cd Backend && ./mvnw.cmd -pl mmse-service test -Dtest=MMSEIntegrationTest -q
```
Expected: BUILD SUCCESS, 4 tests run

- [ ] **Commit**
```bash
git add Backend/mmse-service/src/test/java/com/alzheimer/mmse/MMSEIntegrationTest.java
git commit -m "test(mmse): add MMSEIntegrationTest SpringBootTest with H2"
```

---

## Task 9: medical-service — MedicalRecordControllerTest (@WebMvcTest)

**Files:**
- Create: `Backend/medical-service/src/test/java/com/alzheimer/medical/MedicalRecordControllerTest.java`

- [ ] **Write MedicalRecordControllerTest.java**

```java
package com.alzheimer.medical;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MedicalRecordController.class)
class MedicalRecordControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean MedicalRecordRepository medicalRecordRepository;
    // Mocked: get() returns null → NPE caught by userExists() → returns null → save proceeds
    @MockitoBean RestClient userServiceClient;

    private MedicalRecord sampleRecord() {
        MedicalRecord r = new MedicalRecord();
        r.setId(1L);
        r.setUserId(10L);
        r.setAge(65);
        r.setGender(Gender.Male);
        r.setFamilyHistory(FamilyHistory.No);
        return r;
    }

    @Test
    void getAllRecords_returns200() throws Exception {
        when(medicalRecordRepository.findAll()).thenReturn(List.of(sampleRecord()));
        mockMvc.perform(get("/api/medical-records"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].userId").value(10));
    }

    @Test
    void getRecordById_found_returns200() throws Exception {
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(sampleRecord()));
        mockMvc.perform(get("/api/medical-records/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getRecordById_notFound_returns404() throws Exception {
        when(medicalRecordRepository.findById(99L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/medical-records/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getRecordsByUser_returns200() throws Exception {
        when(medicalRecordRepository.findByUserId(10L)).thenReturn(List.of(sampleRecord()));
        mockMvc.perform(get("/api/medical-records/user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getLatestByUser_notFound_returns404() throws Exception {
        when(medicalRecordRepository.findFirstByUserIdOrderByCreatedAtDesc(99L))
                .thenReturn(Optional.empty());
        mockMvc.perform(get("/api/medical-records/user/99/latest"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createRecord_userServiceUnreachable_saves_returns201() throws Exception {
        // userServiceClient.get() → null (mock default) → NPE → userExists returns null → save proceeds
        MedicalRecord saved = sampleRecord();
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(saved);
        Map<String, Object> body = Map.of(
            "userId", 10,
            "age", 65,
            "gender", "Male",
            "familyHistory", "No"
        );
        mockMvc.perform(post("/api/medical-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void updateRecord_found_returns200() throws Exception {
        MedicalRecord existing = sampleRecord();
        when(medicalRecordRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(existing);
        mockMvc.perform(put("/api/medical-records/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("age", 70))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void updateRecord_notFound_returns404() throws Exception {
        when(medicalRecordRepository.findById(99L)).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/medical-records/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("age", 70))))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteRecord_found_returns200() throws Exception {
        when(medicalRecordRepository.existsById(1L)).thenReturn(true);
        mockMvc.perform(delete("/api/medical-records/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void deleteRecord_notFound_returns404() throws Exception {
        when(medicalRecordRepository.existsById(99L)).thenReturn(false);
        mockMvc.perform(delete("/api/medical-records/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getStats_returns200() throws Exception {
        when(medicalRecordRepository.count()).thenReturn(10L);
        when(medicalRecordRepository.findByFamilyHistory(FamilyHistory.Yes)).thenReturn(List.of());
        when(medicalRecordRepository.findByGender(Gender.Male)).thenReturn(List.of(sampleRecord()));
        when(medicalRecordRepository.findByGender(Gender.Female)).thenReturn(List.of());
        mockMvc.perform(get("/api/medical-records/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRecords").value(10));
    }
}
```

- [ ] **Run the test**
```bash
cd Backend && ./mvnw.cmd -pl medical-service test -Dtest=MedicalRecordControllerTest -q
```
Expected: BUILD SUCCESS, 11 tests run

- [ ] **Commit**
```bash
git add Backend/medical-service/src/test/
git commit -m "test(medical): add MedicalRecordControllerTest WebMvcTest slice tests"
```

---

## Task 10: medical-service — MedicalRecordIntegrationTest (@SpringBootTest)

**Files:**
- Create: `Backend/medical-service/src/test/java/com/alzheimer/medical/MedicalRecordIntegrationTest.java`

- [ ] **Write MedicalRecordIntegrationTest.java**

```java
package com.alzheimer.medical;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class MedicalRecordIntegrationTest {

    @Autowired MedicalRecordRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private MedicalRecord sampleRecord() {
        MedicalRecord r = new MedicalRecord();
        r.setUserId(1L);
        r.setAge(65);
        r.setGender(Gender.Female);
        r.setFamilyHistory(FamilyHistory.Yes);
        return r;
    }

    @Test
    void save_thenFindById_roundTrip() {
        MedicalRecord saved = repository.save(sampleRecord());
        assertThat(saved.getId()).isNotNull();
        Optional<MedicalRecord> found = repository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getAge()).isEqualTo(65);
    }

    @Test
    void findByUserId_returnsRecords() {
        repository.save(sampleRecord());
        assertThat(repository.findByUserId(1L)).hasSize(1);
    }

    @Test
    void findByGender_returnsFiltered() {
        repository.save(sampleRecord());
        assertThat(repository.findByGender(Gender.Female)).hasSize(1);
        assertThat(repository.findByGender(Gender.Male)).isEmpty();
    }

    @Test
    void findFirstByUserIdOrderByCreatedAtDesc_returnsLatest() {
        repository.save(sampleRecord());
        assertThat(repository.findFirstByUserIdOrderByCreatedAtDesc(1L)).isPresent();
    }

    @Test
    void findByFamilyHistory_returnsFiltered() {
        repository.save(sampleRecord());
        assertThat(repository.findByFamilyHistory(FamilyHistory.Yes)).hasSize(1);
        assertThat(repository.findByFamilyHistory(FamilyHistory.No)).isEmpty();
    }
}
```

- [ ] **Run the test**
```bash
cd Backend && ./mvnw.cmd -pl medical-service test -Dtest=MedicalRecordIntegrationTest -q
```
Expected: BUILD SUCCESS, 5 tests run

- [ ] **Commit**
```bash
git add Backend/medical-service/src/test/java/com/alzheimer/medical/MedicalRecordIntegrationTest.java
git commit -m "test(medical): add MedicalRecordIntegrationTest SpringBootTest with H2"
```

---

## Task 11: cnn-service — Controller + Integration tests

**Files:**
- Create: `Backend/cnn-service/src/test/java/com/alzheimer/cnn/CNNPredictionControllerTest.java`
- Create: `Backend/cnn-service/src/test/java/com/alzheimer/cnn/CNNIntegrationTest.java`

- [ ] **Write CNNPredictionControllerTest.java**

```java
package com.alzheimer.cnn;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CNNPredictionController.class)
class CNNPredictionControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    void health_returns200() throws Exception {
        mockMvc.perform(get("/api/cnn/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CNN Prediction Service is healthy"));
    }

    @Test
    void predict_emptyFile_returns400() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[0]);
        mockMvc.perform(multipart("/api/cnn/predict").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("File is empty"));
    }

    @Test
    void predict_invalidContentType_returns400() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "data.pdf", "application/pdf", new byte[100]);
        mockMvc.perform(multipart("/api/cnn/predict").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void predict_tooLargeFile_returns400() throws Exception {
        byte[] big = new byte[50_000_001];
        MockMultipartFile file = new MockMultipartFile(
                "file", "huge.jpg", "image/jpeg", big);
        mockMvc.perform(multipart("/api/cnn/predict").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("File is too large. Maximum size is 50MB."));
    }

    @Test
    void predict_smallImage_returnsNormalCognition() throws Exception {
        // < 500_000 bytes → determineDiagnosis returns "Normal Cognition"
        byte[] content = new byte[100_000];
        MockMultipartFile file = new MockMultipartFile(
                "file", "small.jpg", "image/jpeg", content);
        mockMvc.perform(multipart("/api/cnn/predict").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.diagnosis").value("Normal Cognition"));
    }

    @Test
    void predict_mediumImage_returnsMildImpairment() throws Exception {
        // 600_001 bytes → "Mild Cognitive Impairment"
        byte[] content = new byte[600_001];
        MockMultipartFile file = new MockMultipartFile(
                "file", "medium.jpg", "image/jpeg", content);
        mockMvc.perform(multipart("/api/cnn/predict").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.diagnosis").value("Mild Cognitive Impairment"));
    }

    @Test
    void predict_validImage_includesScoresAndRecommendations() throws Exception {
        byte[] content = new byte[100_000];
        MockMultipartFile file = new MockMultipartFile(
                "file", "brain.jpg", "image/jpeg", content);
        mockMvc.perform(multipart("/api/cnn/predict").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.scores").isArray())
                .andExpect(jsonPath("$.data.recommendations").isArray())
                .andExpect(jsonPath("$.data.confidence").isNumber());
    }
}
```

- [ ] **Write CNNIntegrationTest.java**

```java
package com.alzheimer.cnn;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class CNNIntegrationTest {

    @Autowired TestRestTemplate restTemplate;

    @Test
    void health_contextLoads_andReturns200() {
        ResponseEntity<String> response =
                restTemplate.getForEntity("/api/cnn/health", String.class);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).contains("healthy");
    }
}
```

- [ ] **Run both tests**
```bash
cd Backend && ./mvnw.cmd -pl cnn-service test -q
```
Expected: BUILD SUCCESS, 8 tests run

- [ ] **Commit**
```bash
git add Backend/cnn-service/src/test/
git commit -m "test(cnn): add CNNPredictionControllerTest and CNNIntegrationTest"
```

---

## Task 12: admin-service — Controller + Integration tests

**Files:**
- Create: `Backend/admin-service/src/test/java/com/alzheimer/admin/AdminDashboardControllerTest.java`
- Create: `Backend/admin-service/src/test/java/com/alzheimer/admin/AdminIntegrationTest.java`

- [ ] **Write AdminDashboardControllerTest.java**

```java
package com.alzheimer.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestClient;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// All three RestClient mocks return null on method calls.
// fetchUsers/fetchMmseTests/fetchMedicalRecords catch the resulting NPE and return List.of().
// Endpoints return 200 with data:[] or data:{} — status codes and JSON structure are verified.
@WebMvcTest(AdminDashboardController.class)
class AdminDashboardControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean(name = "adminUserServiceClient")    RestClient userServiceClient;
    @MockitoBean(name = "adminMmseServiceClient")    RestClient mmseServiceClient;
    @MockitoBean(name = "adminMedicalServiceClient") RestClient medicalServiceClient;

    @Test
    void health_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"));
    }

    @Test
    void dashboard_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void superDashboard_delegates_toDashboard_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/super-dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void stats_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void usersWithMMSE_returns200_withEmptyList() throws Exception {
        mockMvc.perform(get("/api/admin/users-with-mmse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void mmseTests_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/mmse-tests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void medicalRecords_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/medical-records"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void search_emptyQuery_returns400() throws Exception {
        mockMvc.perform(get("/api/admin/search").param("query", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void search_validQuery_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/search").param("query", "alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void filter_noParams_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/filter"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void exportUsers_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/export/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void exportMMSE_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/export/mmse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void activityLog_defaultLimit_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/activity-log"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void usersCount_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/users-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void mmseTestsCount_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/mmse-tests-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void backup_returns200() throws Exception {
        mockMvc.perform(post("/api/admin/backup")
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("success"));
    }
}
```

- [ ] **Write AdminIntegrationTest.java**

```java
package com.alzheimer.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class AdminIntegrationTest {

    @Autowired TestRestTemplate restTemplate;

    @Test
    void health_contextLoads_andReturns200() {
        ResponseEntity<String> response =
                restTemplate.getForEntity("/api/admin/health", String.class);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).contains("UP");
    }

    @Test
    void backup_stubEndpoint_returns200() {
        ResponseEntity<String> response =
                restTemplate.postForEntity("/api/admin/backup", "{}", String.class);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).contains("success");
    }
}
```

- [ ] **Run both tests**
```bash
cd Backend && ./mvnw.cmd -pl admin-service test -q
```
Expected: BUILD SUCCESS, 18 tests run

- [ ] **Commit**
```bash
git add Backend/admin-service/src/test/
git commit -m "test(admin): add AdminDashboardControllerTest and AdminIntegrationTest"
```

---

## Task 13: frontend — prediction.service.spec.ts

**Files:**
- Create: `frontend/src/app/services/prediction.service.spec.ts`

- [ ] **Write prediction.service.spec.ts**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PredictionService } from './prediction.service';

describe('PredictionService', () => {
  let service: PredictionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PredictionService],
    });
    service = TestBed.inject(PredictionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST to http://localhost:8000/predict', () => {
    const file = new File(['brain-data'], 'brain.jpg', { type: 'image/jpeg' });
    const mockResponse = { diagnosis: 'Normal Cognition', confidence: 0.92 };

    service.predict(file).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/predict');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    req.flush(mockResponse);
  });

  it('should append file under key "file" in FormData', () => {
    const file = new File(['data'], 'scan.png', { type: 'image/png' });

    service.predict(file).subscribe();

    const req = httpMock.expectOne('http://localhost:8000/predict');
    const formData = req.request.body as FormData;
    expect(formData.get('file')).toBe(file);
    req.flush({});
  });

  it('should return observable from HTTP response', (done) => {
    const file = new File(['x'], 'x.jpg', { type: 'image/jpeg' });
    const expected = { diagnosis: 'Mild Cognitive Impairment' };

    service.predict(file).subscribe(res => {
      expect(res).toEqual(expected);
      done();
    });

    httpMock.expectOne('http://localhost:8000/predict').flush(expected);
  });
});
```

- [ ] **Run the test**
```bash
cd frontend && ng test --include="**/prediction.service.spec.ts" --watch=false
```
Expected: 3 tests pass

- [ ] **Commit**
```bash
git add frontend/src/app/services/prediction.service.spec.ts
git commit -m "test(frontend): add PredictionService HTTP tests"
```

---

## Task 14: frontend — admin.service.spec.ts

**Files:**
- Create: `frontend/src/app/services/admin.service.spec.ts`

- [ ] **Write admin.service.spec.ts**

```typescript
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const adminUrl = 'http://localhost:8091/api/admin';
  const usersUrl = 'http://localhost:8082/api/users';
  const mmseUrl  = 'http://localhost:8085/api/mmse';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSuperDashboard() — GET /super-dashboard, unwraps data', () => {
    const data = { usersCount: 10 };
    service.getSuperDashboard().subscribe(res => expect(res).toEqual(data));
    const req = httpMock.expectOne(`${adminUrl}/super-dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data });
  });

  it('getDashboard() — GET /users-with-mmse, unwraps data', () => {
    const data = [{ id: 1 }];
    service.getDashboard().subscribe(res => expect(res).toEqual(data));
    const req = httpMock.expectOne(`${adminUrl}/users-with-mmse`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data });
  });

  it('getStats() — GET /stats', () => {
    service.getStats().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: {} });
  });

  it('getMedicalRecords() — GET /medical-records', () => {
    service.getMedicalRecords().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/medical-records`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('updateMedicalRecord() — PUT /medical-records/1 with body', () => {
    const updates = { age: 70 };
    service.updateMedicalRecord(1, updates).subscribe();
    const req = httpMock.expectOne(`${adminUrl}/medical-records/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updates);
    req.flush({ success: true, message: '', data: {} });
  });

  it('deleteMedicalRecord() — DELETE /medical-records/1', () => {
    service.deleteMedicalRecord(1).subscribe();
    const req = httpMock.expectOne(`${adminUrl}/medical-records/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('searchUsers() — GET /search?query=alice', () => {
    service.searchUsers('alice').subscribe();
    const req = httpMock.expectOne(`${adminUrl}/search?query=alice`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('filterUsers(role, active) — includes both params', () => {
    service.filterUsers('ADMIN', true).subscribe();
    const req = httpMock.expectOne(r =>
      r.url === `${adminUrl}/filter` &&
      r.params.get('role') === 'ADMIN' &&
      r.params.get('active') === 'true'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('filterUsers() — no params when omitted', () => {
    service.filterUsers().subscribe();
    const req = httpMock.expectOne(r =>
      r.url === `${adminUrl}/filter` &&
      !r.params.has('role') &&
      !r.params.has('active')
    );
    req.flush({ success: true, message: '', data: [] });
  });

  it('exportUsers() — GET /export/users', () => {
    service.exportUsers().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/export/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('exportMMSE() — GET /export/mmse', () => {
    service.exportMMSE().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/export/mmse`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getMMSETests() — GET /mmse-tests on success', () => {
    service.getMMSETests().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/mmse-tests`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getMMSETests() — falls back to mmse-service on admin 404', () => {
    service.getMMSETests().subscribe();
    const adminReq = httpMock.expectOne(`${adminUrl}/mmse-tests`);
    adminReq.flush(null, { status: 404, statusText: 'Not Found' });
    const fallbackReq = httpMock.expectOne(`${mmseUrl}/results`);
    expect(fallbackReq.request.method).toBe('GET');
    fallbackReq.flush({ success: true, message: '', data: [] });
  });

  it('getActivityLog() — default limit 50', () => {
    service.getActivityLog().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/activity-log?limit=50`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getActivityLog(10) — custom limit', () => {
    service.getActivityLog(10).subscribe();
    const req = httpMock.expectOne(`${adminUrl}/activity-log?limit=10`);
    req.flush({ success: true, message: '', data: [] });
  });

  it('deleteUser() — DELETE on users API', () => {
    service.deleteUser(5).subscribe();
    const req = httpMock.expectOne(`${usersUrl}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('backupDatabase() — POST /backup', () => {
    service.backupDatabase().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/backup`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: '', data: { status: 'success' } });
  });

  it('submitMMSETest() — POST to mmse-service/submit with body', () => {
    const testData = { patient_name: 'Alice', total_score: 28 };
    service.submitMMSETest(testData).subscribe();
    const req = httpMock.expectOne(`${mmseUrl}/submit`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testData);
    req.flush({ success: true });
  });
});
```

- [ ] **Run the test**
```bash
cd frontend && ng test --include="**/admin.service.spec.ts" --watch=false
```
Expected: 18 tests pass

- [ ] **Run all frontend tests**
```bash
cd frontend && ng test --watch=false
```
Expected: all tests pass

- [ ] **Commit**
```bash
git add frontend/src/app/services/admin.service.spec.ts
git commit -m "test(frontend): add AdminService HTTP tests with fallback coverage"
```

---

## Task 15: Run full backend test suite and verify

- [ ] **Run all backend tests**
```bash
cd Backend && ./mvnw.cmd test -q
```
Expected: BUILD SUCCESS across all modules

- [ ] **Final commit if any fixes were needed**
```bash
git add -A
git commit -m "test: full backend and frontend unit test suite complete"
```
