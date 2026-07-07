package com.alzheimer.medical;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
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
    // Named to match the controller's @Qualifier("userServiceClient"); @MockitoBean matches by
    // type only, so without the name nothing satisfies the qualifier and the context fails to load.
    // Mocked: get() returns null -> NPE caught by userExists() -> returns null -> save proceeds
    @MockitoBean(name = "userServiceClient") RestClient userServiceClient;

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
        // userServiceClient.get() -> null (mock default) -> NPE -> userExists returns null -> save proceeds
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
