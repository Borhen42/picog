package com.alzheimer.mmse;

import com.alzheimer.mmse.client.MedicalRecordClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
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
    @MockitoBean MedicalRecordClient medicalRecordClient;

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
