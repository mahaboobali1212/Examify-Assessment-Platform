package com.exam.controller;

import com.exam.dto.AttemptStartResponse;
import com.exam.dto.ResultResponse;
import com.exam.dto.SaveAnswerRequest;
import com.exam.service.AttemptService;
import com.exam.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/attempts")
@RequiredArgsConstructor
public class StudentAttemptController {

    private final AttemptService attemptService;
    private final EvaluationService evaluationService;

    @PostMapping("/exams/{examId}/start")
    public ResponseEntity<AttemptStartResponse> startOrResumeExam(
            @PathVariable Long examId,
            Authentication authentication) {
        AttemptStartResponse response = attemptService.startOrResumeExam(examId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<AttemptStartResponse> getActiveAttempt(
            @PathVariable Long attemptId,
            Authentication authentication) {
        AttemptStartResponse response = attemptService.getActiveAttempt(attemptId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{attemptId}/save-answer")
    public ResponseEntity<Void> saveAnswer(
            @PathVariable Long attemptId,
            @Valid @RequestBody SaveAnswerRequest request,
            Authentication authentication) {
        attemptService.saveAnswer(attemptId, request, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<ResultResponse> submitExam(
            @PathVariable Long attemptId,
            Authentication authentication) {
        ResultResponse response = evaluationService.submitAndEvaluate(attemptId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/results")
    public ResponseEntity<List<ResultResponse>> getMyResults(Authentication authentication) {
        return ResponseEntity.ok(evaluationService.getStudentResults(authentication.getName()));
    }

    @GetMapping("/results/{attemptId}")
    public ResponseEntity<ResultResponse> getResultByAttemptId(
            @PathVariable Long attemptId,
            Authentication authentication) {
        return ResponseEntity.ok(evaluationService.getResultByAttemptId(attemptId, authentication.getName(), false));
    }
}
