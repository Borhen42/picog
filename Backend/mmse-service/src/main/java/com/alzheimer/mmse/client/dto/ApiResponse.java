package com.alzheimer.mmse.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Mirrors the response envelope returned by medical-service
 * (com.alzheimer.medical.dto.ApiResponse) so Feign can unwrap the payload.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiResponse<T> {

  private boolean success;
  private String message;
  private T data;
  private String error;

  public boolean isSuccess() {
    return success;
  }

  public void setSuccess(boolean success) {
    this.success = success;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public T getData() {
    return data;
  }

  public void setData(T data) {
    this.data = data;
  }

  public String getError() {
    return error;
  }

  public void setError(String error) {
    this.error = error;
  }
}
