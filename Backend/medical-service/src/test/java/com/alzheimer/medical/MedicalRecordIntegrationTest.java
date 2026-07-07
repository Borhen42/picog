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
