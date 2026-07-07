package com.alzheimer.mmse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class MmseServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MmseServiceApplication.class, args);
    }
}
