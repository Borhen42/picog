package com.alzheimer.medical;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MedicalServiceConfig {
    @Bean
    public RestClient userServiceClient() {
        return RestClient.builder().baseUrl("http://localhost:8082").build();
    }

    /**
     * Client for mmse-service, used to pull a patient's cognitive-test scores when building
     * the AI case summary. Best-effort only: callers must tolerate it being unreachable.
     */
    @Bean
    @Qualifier("mmseServiceClient")
    public RestClient mmseServiceClient(@Value("${mmse.service.url:http://localhost:8085}") String mmseServiceUrl) {
        return RestClient.builder().baseUrl(mmseServiceUrl).build();
    }
}
