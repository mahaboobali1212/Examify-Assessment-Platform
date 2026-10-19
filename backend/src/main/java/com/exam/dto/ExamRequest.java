package com.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Total marks is required")
    @Min(value = 1, message = "Total marks must be positive")
    private Integer totalMarks;

    @NotNull(message = "Pass marks is required")
    @Min(value = 0, message = "Pass marks cannot be negative")
    private Integer passMarks;

    @Builder.Default
    private Boolean isPublished = false;

    @Builder.Default
    private Boolean randomizeQuestions = false;

    @Builder.Default
    private Integer allowedAttempts = 1;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
