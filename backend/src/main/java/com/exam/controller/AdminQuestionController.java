package com.exam.controller;

import com.exam.dto.QuestionRequest;
import com.exam.dto.QuestionResponse;
import com.exam.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminQuestionController {

    private final QuestionService questionService;

    @GetMapping("/exams/{examId}/questions")
    public ResponseEntity<List<QuestionResponse>> getQuestionsByExamId(@PathVariable Long examId) {
        return ResponseEntity.ok(questionService.getQuestionsByExamId(examId));
    }

    @PostMapping("/exams/{examId}/questions")
    public ResponseEntity<QuestionResponse> addQuestion(
            @PathVariable Long examId,
            @Valid @RequestBody QuestionRequest request,
            Authentication authentication) {
        QuestionResponse response = questionService.addQuestionToExam(examId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request,
            Authentication authentication) {
        QuestionResponse response = questionService.updateQuestion(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id, Authentication authentication) {
        questionService.deleteQuestion(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
