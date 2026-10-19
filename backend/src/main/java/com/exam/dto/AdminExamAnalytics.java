package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminExamAnalytics {
    private Long examId;
    private String examTitle;
    private String subject;
    private long totalAttempts;
    private double averagePercentage;
    private double highestScore;
    private double lowestScore;
    private long passCount;
    private long failCount;
    private double passRate;
    private List<QuestionAccuracyDto> questionPerformance;
}
