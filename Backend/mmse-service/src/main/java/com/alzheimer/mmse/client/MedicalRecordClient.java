package com.alzheimer.mmse.client;

import com.alzheimer.mmse.client.dto.ApiResponse;
import com.alzheimer.mmse.client.dto.MedicalRecordResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client to medical-service. The {@code name} is the target service's
 * spring.application.name; it is resolved via Eureka + Spring Cloud LoadBalancer,
 * so no host/port is hard-coded here.
 */
@FeignClient(name = "medical-service")
public interface MedicalRecordClient {

  /**
   * Fetch a medical record by id. medical-service wraps the payload in its
   * ApiResponse envelope, hence the generic return type.
   * A missing record surfaces as a FeignException.NotFound (HTTP 404).
   */
  @GetMapping("/api/medical-records/{id}")
  ApiResponse<MedicalRecordResponse> getMedicalRecordById(@PathVariable("id") Long id);
}
