package com.exam.service;

import com.exam.entity.AuditLog;
import com.exam.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String adminEmail, String action, String details) {
        AuditLog log = AuditLog.builder()
                .adminEmail(adminEmail)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }
}
