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
public class StudentDashboardDto {
    private long availableExamsCount;
    private long completedExamsCount;
    private double averagePercentage;
    private long passedCount;
    private long failedCount;
    private List<ResultResponse> recentResults;
}
