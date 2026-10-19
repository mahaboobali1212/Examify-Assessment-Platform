package com.exam.controller;

import com.exam.dto.AdminExamAnalytics;
import com.exam.dto.AdminOverviewAnalytics;
import com.exam.dto.ResultResponse;
import com.exam.entity.AuditLog;
import com.exam.entity.User;
import com.exam.enums.RoleName;
import com.exam.repository.AuditLogRepository;
import com.exam.repository.UserRepository;
import com.exam.service.AnalyticsService;
import com.exam.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;
    private final EvaluationService evaluationService;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewAnalytics> getOverview() {
        return ResponseEntity.ok(analyticsService.getAdminOverview());
    }

    @GetMapping("/exams/{examId}")
    public ResponseEntity<AdminExamAnalytics> getExamAnalytics(@PathVariable Long examId) {
        return ResponseEntity.ok(analyticsService.getExamAnalytics(examId));
    }

    @GetMapping("/exams/{examId}/results")
    public ResponseEntity<List<ResultResponse>> getExamResults(@PathVariable Long examId) {
        return ResponseEntity.ok(evaluationService.getExamResultsForAdmin(examId));
    }

    @GetMapping("/exams/{examId}/export-csv")
    public ResponseEntity<byte[]> exportExamResultsCsv(@PathVariable Long examId) {
        String csvContent = analyticsService.exportExamResultsCsv(examId);
        byte[] bytes = csvContent.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"exam_" + examId + "_results.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        return ResponseEntity.ok(userRepository.findByRole(RoleName.ROLE_STUDENT));
    }
}
