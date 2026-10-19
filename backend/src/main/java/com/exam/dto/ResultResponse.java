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
public class ResultResponse {
    private Long resultId;
    private Long attemptId;
    private Long examId;
    private String examTitle;
    private String subject;
    private String studentName;
    private String studentEmail;
    private Integer totalQuestions;
    private Integer attemptedQuestions;
    private Integer unattemptedQuestions;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Double totalMarksObtained;
    private Double totalExamMarks;
    private Double percentage;
    private Boolean isPassed;
    private LocalDateTime evaluatedAt;
    private List<QuestionReviewDto> reviewList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionReviewDto {
        private Long questionId;
        private String questionText;
        private Integer marks;
        private Long selectedOptionId;
        private Long correctOptionId;
        private Boolean isCorrect;
        private List<OptionResponse> options;
    }
}
