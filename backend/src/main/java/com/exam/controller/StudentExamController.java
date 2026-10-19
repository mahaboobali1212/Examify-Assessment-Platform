package com.exam.controller;

import com.exam.dto.ExamResponse;
import com.exam.dto.StudentDashboardDto;
import com.exam.service.AnalyticsService;
import com.exam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentExamController {

    private final ExamService examService;
    private final AnalyticsService analyticsService;

    @GetMapping("/exams")
    public ResponseEntity<List<ExamResponse>> getAvailableExams(Authentication authentication) {
        return ResponseEntity.ok(examService.getPublishedExamsForStudent(authentication.getName()));
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<ExamResponse> getExamDetails(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardDto> getStudentDashboard(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getStudentDashboard(authentication.getName()));
    }
}
