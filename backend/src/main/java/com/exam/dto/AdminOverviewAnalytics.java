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
public class AdminOverviewAnalytics {
    private long totalStudents;
    private long totalExams;
    private long totalAttempts;
    private double overallAverageScore;
    private double overallPassRate;
    private List<ResultResponse> recentResults;
}
