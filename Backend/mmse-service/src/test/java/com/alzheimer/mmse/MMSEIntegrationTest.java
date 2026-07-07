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
        // 9+3+5+3+8 = 28 -> Normal cognition
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
        // total = 5 -> Severe cognitive impairment
        assertThat(saved.getInterpretation()).isEqualTo("Severe cognitive impairment");
    }
}
