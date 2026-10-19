package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptStartResponse {
    private Long attemptId;
    private Long examId;
    private String examTitle;
    private String subject;
    private Integer durationMinutes;
    private Integer totalMarks;
    private Integer passMarks;
    private LocalDateTime startTime;
    private LocalDateTime maxEndTime;
    private Long remainingSeconds;
    private List<StudentQuestionResponse> questions;
    private List<StudentAnswerResponse> savedAnswers;
}
