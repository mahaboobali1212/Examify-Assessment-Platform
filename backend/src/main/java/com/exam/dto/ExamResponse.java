package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponse {
    private Long id;
    private String title;
    private String description;
    private String subject;
    private Integer durationMinutes;
    private Integer totalMarks;
    private Integer passMarks;
    private Boolean isPublished;
    private Boolean randomizeQuestions;
    private Integer allowedAttempts;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer questionCount;
    private Long totalAttempts;
    private LocalDateTime createdAt;
}
